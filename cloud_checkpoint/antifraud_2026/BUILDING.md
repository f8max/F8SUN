# Сборка финальной редакции

Канонический исходник: `output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.md`. Сборщик создаёт одноимённые A5 PDF, DOCX и EPUB3 плюс `manifest.json`. Python- и Node-зависимости закреплены в `requirements-build.txt` и `package-lock.json`; manifest дополнительно фиксирует реальные версии и SHA-256 исполняемых инструментов.

## Зависимости

```bash
python -m pip install -r requirements-build.txt
npm ci --ignore-scripts
npx puppeteer browsers install chrome-headless-shell
```

WeasyPrint 69 требует системные библиотеки своего дистрибутива. На Windows можно передать путь к standalone `weasyprint.exe`. Для независимого DOCX-рендера нужен Microsoft Word либо LibreOffice. Финальный EPUB проверяется EPUBCheck 5.3.0 или новее. Флаги `--no-sandbox` в `mermaid-puppeteer.json` предназначены только для изолированного build-контейнера; не копируйте их в пользовательский browser runtime.

## Build

```bash
python build_release_local.py \
  --source output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.md \
  --out-dir dist_release \
  --clean \
  --mmdc node_modules/.bin/mmdc \
  --puppeteer-config mermaid-puppeteer.json \
  --source-date-epoch 1784592000
```

При необходимости добавьте `--weasyprint-bin /exact/path/to/weasyprint`. На PowerShell используйте `node_modules\.bin\mmdc.cmd`.

## Release gate

```bash
python qa/validate_release_local.py . \
  --book output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.md \
  --pdf dist_release/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.pdf \
  --docx dist_release/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.docx \
  --epub dist_release/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.epub \
  --manifest dist_release/manifest.json \
  --epubcheck /exact/path/to/epubcheck
```

На Windows отдельный Word QA:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File qa\render_docx_word.ps1 `
  -InputDocx dist_release\ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.docx `
  -OutputPdf dist_release\qa\WORD_RENDER.pdf
```

Просмотрите все страницы PDF и Word-render PDF и несколько EPUB spine documents на мобильной и планшетной ширине. Затем выполните второй clean build с тем же epoch. Корректное обещание пайплайна — **repeatable, not bit-reproducible**: DOCX может совпасть побитово, а PDF/EPUB способны содержать implementation-specific identifiers при одинаковом визуальном и смысловом результате.
