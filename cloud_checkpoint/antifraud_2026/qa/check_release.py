#!/usr/bin/env python3
"""M2 release checks, URL verification and visual sheets for PDF and DOCX."""
from pathlib import Path
import argparse, concurrent.futures, re, shutil, subprocess, tempfile, zipfile
import fitz
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]; BOOK=ROOT/'output'/'ANTIFRAUD_ULTIMATE_GUIDE_2026_RU.md'; DIST=ROOT/'dist'; RENDER=ROOT/'qa'/'rendered'; BASE='ANTIFRAUD_ULTIMATE_GUIDE_2026_RU'

def sheet_pdf(pdf_path: Path, prefix: str):
    doc=fitz.open(pdf_path); assert len(doc)>=1; thumbs=[]; empty=[]; replacement=[]
    for n,page in enumerate(doc):
        txt=page.get_text();
        if len(txt.strip())<20: empty.append(n+1)
        if '\ufffd' in txt or '�' in txt: replacement.append(n+1)
        # A5 portrait tolerance; catches wrong page geometry.
        ratio=page.rect.height/page.rect.width; assert 1.38<ratio<1.44, f'{prefix} page {n+1} not A5-like: {page.rect}'
        pix=page.get_pixmap(matrix=fitz.Matrix(.62,.62),alpha=False); im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
        canvas=Image.new('RGB',(im.width,im.height+22),'white'); canvas.paste(im,(0,22)); ImageDraw.Draw(canvas).text((5,4),f'{prefix} page {n+1}',fill='black'); thumbs.append(canvas)
    assert not empty, f'{prefix} empty pages {empty}'; assert not replacement, f'{prefix} replacement glyph pages {replacement}'
    cols,rows=4,5
    for start in range(0,len(thumbs),cols*rows):
        batch=thumbs[start:start+cols*rows]; w=max(x.width for x in batch); h=max(x.height for x in batch)
        out=Image.new('RGB',(cols*w,rows*h),(205,210,214))
        for j,im in enumerate(batch): out.paste(im,((j%cols)*w,(j//cols)*h))
        out.save(RENDER/f'{prefix.lower()}_contact_{start//(cols*rows)+1:02}.png')
    text='\n'.join(p.get_text() for p in doc); links=sum(len(p.get_links()) for p in doc); pages=len(doc); doc.close()
    return pages,text,links

def check_url(url):
    last=None
    for attempt in range(3):
        last=subprocess.run(['curl','-L','--retry','2','--retry-delay','2','-A','AntifraudGuide-QA/2.0','--connect-timeout','15','--max-time','60','-o','/dev/null','-sS','-w','%{http_code}',url],text=True,capture_output=True)
        code=int(last.stdout[-3:]) if len(last.stdout)>=3 and last.stdout[-3:].isdigit() else 0
        if code: break
    return url,code,last.stderr.strip()

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--skip-network',action='store_true'); args=ap.parse_args()
    text=BOOK.read_text('utf-8'); words=len(re.findall(r"[\wА-Яа-яЁё-]+",text)); assert words>=16000, words
    required=['Как проходит интернет-платёж','Сквозной синтетический кейс','Реализуемая модель данных','Card testing и enumeration','ATO, session','Dispute и chargeback','Threat-control crosswalk','Проектный практикум','Встроенная библиография']
    for s in required: assert s in text,f'missing {s}'
    assert text.count('```mermaid')>=5 and not re.search(r'\\\[|\\\]',text), 'raw display math'
    ledger=(ROOT/'research'/'SOURCE_LEDGER.md').read_text('utf-8'); claim=(ROOT/'research'/'CLAIM_MAP.md').read_text('utf-8')
    urls=re.findall(r'https://[^\s|)]+',ledger); assert len(urls)>=50 and len(urls)==len(set(urls))
    source_ids=set(re.findall(r'\| (S\d+) \|',ledger)); claim_ids=set(re.findall(r'\bS\d+\b',claim)); assert claim_ids<=source_ids, sorted(claim_ids-source_ids)
    if not args.skip_network:
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex: results=list(ex.map(check_url,urls))
        bad=[(u,c,e) for u,c,e in results if c==0 or c==404 or c>=500]
        # Government sites occasionally block automated clients; 503 is recorded but still fails stale-link QA unless allowlisted.
        restricted_official=('pravo.gov.ru','pd.rkn.gov.ru','nspk.ru')
        bad=[x for x in bad if not (x[1] in (0,403,503) and any(h in x[0] for h in restricted_official))]
        assert not bad, 'bad source links: '+repr(bad)
        (ROOT/'qa'/'URL_CHECK_2026-07-21.txt').write_text('\n'.join(f'{c} {u}' for u,c,_ in sorted(results))+'\n','utf-8')
    RENDER.mkdir(parents=True,exist_ok=True)
    for old in RENDER.glob('*contact_*.png'): old.unlink()
    pdf_pages,pdf_text,pdf_links=sheet_pdf(DIST/f'{BASE}.pdf','PDF')
    assert 'flowchart LR' not in pdf_text and 'sequenceDiagram' not in pdf_text, 'raw Mermaid leaked into PDF'
    assert pdf_links>=15, f'PDF hyperlinks missing: {pdf_links}'
    for ext in ('docx','epub'):
        with zipfile.ZipFile(DIST/f'{BASE}.{ext}') as z:
            assert z.testzip() is None
            names=z.namelist()
            if ext=='epub': assert any('diagram_' in n for n in names), 'EPUB has no rendered diagrams'
            else: assert len([n for n in names if n.startswith('word/media/')])>=5, 'DOCX has no rendered diagrams'
            if ext=='epub':
                nav=''.join(z.read(n).decode('utf-8','ignore') for n in names if n.endswith('nav.xhtml')); assert 'Как проходит интернет-платёж' in nav
            else:
                xml=z.read('word/document.xml').decode('utf-8','ignore')
                assert 'Содержание' in xml and ' TOC ' in xml and 'graphic' in xml
                assert 'tblHeader' in xml, 'DOCX tables do not repeat header rows'
    lo=shutil.which('libreoffice') or shutil.which('soffice')
    if not lo: raise AssertionError('LibreOffice required for independent DOCX visual rendering')
    with tempfile.TemporaryDirectory() as td:
        cp=subprocess.run([lo,'--headless','--convert-to','pdf','--outdir',td,str(DIST/f'{BASE}.docx')],capture_output=True,text=True,timeout=180)
        assert cp.returncode==0,cp.stderr; docx_pdf=Path(td)/f'{BASE}.pdf'; assert docx_pdf.exists()
        docx_pages,docx_text,_=sheet_pdf(docx_pdf,'DOCX'); assert 'flowchart LR' not in docx_text
    print(f'PASS: {words} words, {len(source_ids)} sources/{len(urls)} URLs, PDF {pdf_pages} pages, DOCX {docx_pages} pages, links {pdf_links}, CRC/TOC/diagrams OK')
if __name__=='__main__': main()
