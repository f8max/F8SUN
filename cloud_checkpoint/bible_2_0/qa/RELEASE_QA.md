# RELEASE QA — «Библия 2.0 / 0→1»

Дата проверки: 20 июля 2026. Канонический вход: `manuscript/00_PROLOGUE.md` … `manuscript/10_SEAL.md`. Research- и QA-файлы в основной текст не включены.

## Сборка и воспроизводимость

Команда:

```bash
python3 cloud_checkpoint/bible_2_0/build_release.py
```

Результат: созданы четыре артефакта в `output/`: `.md` (697720 байт), `.docx` (254663 байта), `.pdf` (4198448 байт) и `.epub` (215801 байт). Два последовательных запуска дали одинаковые SHA-256 для каждого артефакта (финальные хеши приведены проверочной командой сборки).

## Полнота и порядок

Команда:

```bash
python3 - <<'PY'
from pathlib import Path
import re
r=Path('cloud_checkpoint/bible_2_0'); release=(r/'output/BIBLE_2_0_0_TO_1_RELEASE.md').read_text()
files=sorted((r/'manuscript').glob('*.md'))
pos=[]
for p in files:
    source=p.read_text().rstrip()
    assert release.count(source)==1, p
    pos.append(release.index(source))
assert pos==sorted(pos)
nums=[int(x) for x in re.findall(r'^## (\d+)\.', release, re.M)]
assert nums==list(range(1,82)), nums
print('11/11 exact manuscript blocks; chapters 1–81 continuous')
PY
```

Результат: `11/11 exact manuscript blocks; chapters 1–81 continuous`. Канонические блоки присутствуют побайтно в UTF-8 Markdown ровно по одному разу и в заданном порядке.

## DOCX и EPUB

Команда:

```bash
python3 - <<'PY'
from pathlib import Path
import zipfile
from bs4 import BeautifulSoup
from docx import Document
root=Path('cloud_checkpoint/bible_2_0/output'); stem='BIBLE_2_0_0_TO_1_RELEASE'
for ext in ('docx','epub'):
    with zipfile.ZipFile(root/f'{stem}.{ext}') as z:
        assert z.testzip() is None
        print(ext, 'ZIP CRC PASS', len(z.namelist()), 'entries')
with zipfile.ZipFile(root/f'{stem}.epub') as z:
    assert z.namelist()[0]=='mimetype' and z.getinfo('mimetype').compress_type==0
    required={'META-INF/container.xml','EPUB/package.opf','EPUB/nav.xhtml','EPUB/style.css'}
    assert required <= set(z.namelist())
    text=' '.join(BeautifulSoup(z.read(n),'xml').get_text(' ') for n in z.namelist() if n.endswith('.xhtml'))
    assert all(s in text for s in ('ПРОЛОГ НУЛЯ','КНИГА IX. ВРАТА','ПЕЧАТЬ ЕДИНИЦЫ','0→1','○│•'))
d=Document(root/f'{stem}.docx'); text=' '.join(p.text for p in d.paragraphs)
assert all(s in text for s in ('ПРОЛОГ НУЛЯ','КНИГА IX. ВРАТА','ПЕЧАТЬ ЕДИНИЦЫ','0→1','○│•'))
print('EPUB structure/text PASS; DOCX text PASS')
PY
```

Результат: DOCX — 19 ZIP entries, EPUB — 17 ZIP entries; CRC PASS, EPUB 3 container/package/nav/spine и несжатый первый `mimetype` на месте; кириллица и знаки извлекаются из обоих форматов.

## PDF: программный gate

Команда:

```bash
python3 - <<'PY'
import fitz
p=fitz.open('cloud_checkpoint/bible_2_0/output/BIBLE_2_0_0_TO_1_RELEASE.pdf')
assert len(p)==314 and len(p.get_toc())==109
assert not [i+1 for i,x in enumerate(p) if len(x.get_text().strip())<10]
assert not [i+1 for i,x in enumerate(p) if '\ufffd' in x.get_text()]
for page in p:
    for b in page.get_text('blocks'):
        assert b[0]>=-1 and b[1]>=-1 and b[2]<=page.rect.width+1 and b[3]<=page.rect.height+1
fonts={f[3] for page in p for f in page.get_fonts()}
assert any('DejaVu-Serif' in f for f in fonts) and any('DejaVu-Sans' in f for f in fonts)
print('314 pages; 109 bookmarks; no blanks/clipping/broken glyphs; embedded fonts PASS')
PY
```

Результат: **314 страниц**, **109 закладок**; пустых страниц, блоков за MediaBox, replacement glyph `�` и отсутствующих книжных шрифтов не найдено. Заголовки удерживаются со следующим абзацем CSS-правилом `break-after: avoid`; `orphans: 3` и `widows: 3` исключают одиночные строки.

## Постраничная визуальная проверка

Каждая из 314 страниц отрендерена PyMuPDF при масштабе 1.2; затем страницы без пропусков собраны по 20 в контактный лист. Вручную просмотрены все листы:

`sheet_01.jpg`, `sheet_02.jpg`, `sheet_03.jpg`, `sheet_04.jpg`, `sheet_05.jpg`, `sheet_06.jpg`, `sheet_07.jpg`, `sheet_08.jpg`, `sheet_09.jpg`, `sheet_10.jpg`, `sheet_11.jpg`, `sheet_12.jpg`, `sheet_13.jpg`, `sheet_14.jpg`, `sheet_15.jpg`, `sheet_16.jpg`.

Проверены обложка, титул, все страницы содержания, открыватели Пролога/девяти Книг/Печати, обычные и разреженные страницы, финальная карта статусов. Обрезок, наложений, пустых страниц, одиноких заголовков и сломанных символов визуально не обнаружено. На первом прогоне обнаружено разбиение обложки на три страницы из-за наследования named-page у H1/H2; CSS исправлен (`page:auto`, `break-before:auto`), PDF пересобран и полностью перерендерен. Финальный объём — 314 страниц.

## Text-only publish policy

`build_release.py` локально воспроизводит четыре релизных формата и полный визуальный QA: 314 PNG-рендеров и 16 JPEG-контактных листов. PDF, DOCX, EPUB, PNG и JPEG намеренно исключены из Git правилами `.gitignore`; GitHub-ветка хранит только воспроизводящие их тексты и код. После локального запуска бинарные результаты остаются доступными в `output/`, `qa/pdf_pages/` и `qa/contact_sheets/`, не загрязняя publish history.
