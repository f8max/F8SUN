# RELEASE QA — финальная читательская редакция

**Срез:** 2026-07-21  
**Канонический исходник:** `output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.md`  
**Артефакты:** `dist_release_final/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.{pdf,docx,epub}`

## Решение

- Content gate: **94/100**, `P0=NO`, `ULTIMATE-ELIGIBLE`.
- Independent release validator: **44 PASS, 0 FAIL**; одно информационное предупреждение закрыто отдельным полностраничным Word-рендером.
- EPUBCheck 5.3.0: **0 fatal, 0 error, 0 warning**.
- Финальный статус: **RELEASE CANDIDATE ACCEPTED**.

## Проверенные инварианты

| Область | Результат |
|---|---|
| Рукопись | 19 563 Unicode-слова release-gate; 164 заголовка; 32 таблицы; 5 Mermaid-схем |
| Источники | 54/54 ключа разрешены; unknown 0; orphan 0; cutoff 2026-07-21 |
| Кейсы и операции | 3 полноценных синтетических end-to-end кейса; 7 runbooks × 9 обязательных полей |
| PDF | 121 A5-страница; 164 outline entries; 600 ссылок; blank pages 0 |
| DOCX | 164 Word headings; 164 bookmarks; 32 таблицы; TOC и PAGE fields; 77 hyperlinks; A5 |
| EPUB | EPUB3; 35 spine documents; 164 nav links; 77 external links; 5 PNG-схем; raw Mermaid 0 |
| Безопасная граница | Ровно 1; нет operational carding/bypass instructions или фиксированных атакующих порогов |

## Визуальная проверка

- PDF: отрендерены и просмотрены все 121 страницы; отдельно проверены обложка, оглавление, схемы, широкие таблицы, библиография и заключение.
- DOCX: открыт Microsoft Word в read-only режиме, обновлены поля, экспортировано 130 страниц; просмотрены все страницы. Финальный DOCX побитово совпал с визуально проверенным экземпляром.
- EPUB: после EPUBCheck выборочно отрендерены cover и смысловые главы на viewport 390×844; проверены таблица, длинный текст, диаграмма и поздние главы. Между визуально проверенным и финальным EPUB все XHTML/CSS/assets совпадают; различается только implementation-specific `content.opf`.

## Повторная сборка

Два clean-build запуска с одинаковыми входами и `SOURCE_DATE_EPOCH=1784592000` завершились успешно. DOCX совпал побитово. PDF и EPUB сохранили одинаковую структуру и визуальный raster/content, но SHA различается из-за implementation-specific идентификаторов/метаданных. Поэтому корректное обещание сборщика — `repeatable_not_bit_reproducible`, а не byte-for-byte reproducible.

## Финальные SHA-256

Значения артефактов находятся в `dist_release_final/manifest.json`; manifest дополнительно связывает SHA-256 исходника, реестра источников, claim map, builder, синхронизированных lockfiles, Puppeteer config и инструментов. Канонический SHA-256 рукописи: `470AC149E42AB48ABABD2CD1E36DD5D8F3208CC91F23E50B43897CAE9DF21432`.
