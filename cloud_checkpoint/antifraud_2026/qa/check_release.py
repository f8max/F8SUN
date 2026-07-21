#!/usr/bin/env python3
"""Release checks plus visual contact sheets for every PDF page."""
from pathlib import Path
import re, sys, zipfile
import fitz
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
BOOK=ROOT/'output'/'ANTIFRAUD_ULTIMATE_GUIDE_2026_RU.md'
DIST=ROOT/'dist'; RENDER=ROOT/'qa'/'rendered'
base='ANTIFRAUD_ULTIMATE_GUIDE_2026_RU'
text=BOOK.read_text('utf-8')
required=['# 1. Деньги','# 2. Карта угроз','# 3. Fraud journey','# 5. Эталонная','# 8. ML без магии','# 10. Bot management','# 17. Практические чек-листы','# 19. Глоссарий']
for s in required: assert s in text, f'missing {s}'
assert text.count('```mermaid') >= 3
urls=re.findall(r'https://[^\s|)]+', (ROOT/'research'/'SOURCE_LEDGER.md').read_text('utf-8'))
assert len(urls)>=35 and len(urls)==len(set(urls)), 'source URL count/duplicates'
# Patterns that could indicate offensive operational detail. Hits need review; canonical boundary sentence excluded.
boundary=text.split('\n\n',3)[2] if len(text.split('\n\n',3))>2 else ''
scan=text.replace(boundary,'')
forbidden=[r'как обойти',r'купить карт',r'валидатор карт',r'stealth[- ]настрой',r'поднять траст']
for p in forbidden: assert not re.search(p,scan,re.I), f'defensive scope hit: {p}'
pdf=DIST/f'{base}.pdf'; doc=fitz.open(pdf); assert len(doc)>=20
RENDER.mkdir(parents=True,exist_ok=True)
thumbs=[]
for n,page in enumerate(doc):
    pix=page.get_pixmap(matrix=fitz.Matrix(0.65,0.65),alpha=False)
    im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
    canvas=Image.new('RGB',(im.width,im.height+22),'white'); canvas.paste(im,(0,22))
    ImageDraw.Draw(canvas).text((5,4),f'Page {n+1}',fill='black'); thumbs.append(canvas)
cols=4; rows_per_sheet=5
for start in range(0,len(thumbs),cols*rows_per_sheet):
    batch=thumbs[start:start+cols*rows_per_sheet]; w=max(i.width for i in batch); h=max(i.height for i in batch)
    sheet=Image.new('RGB',(cols*w,rows_per_sheet*h),(205,210,214))
    for j,im in enumerate(batch): sheet.paste(im,((j%cols)*w,(j//cols)*h))
    sheet.save(RENDER/f'contact_{start//(cols*rows_per_sheet)+1:02}.png')
doc.close()
for ext in ('docx','epub'):
    with zipfile.ZipFile(DIST/f'{base}.{ext}') as z: assert z.testzip() is None
print(f'PASS: {len(required)} sections, {len(urls)} unique source URLs, {len(thumbs)} PDF pages, CRC OK; {len(list(RENDER.glob("contact_*.png")))} contact sheets')
