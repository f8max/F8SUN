# SYRE — материалы для нового сайта

Пакет раскрыт прямо в репозитории: документы, исходные ассеты и рабочие прототипы можно просматривать отдельно без скачивания ZIP.

## Начать здесь

1. [`README_START_HERE.md`](./README_START_HERE.md) — навигация и порядок работы.
2. [`00_analysis/SOURCE_OF_TRUTH.md`](./00_analysis/SOURCE_OF_TRUTH.md) — иерархия источников.
3. [`00_analysis/CONCEPT_SELECTION.md`](./00_analysis/CONCEPT_SELECTION.md) — выбор концептов.
4. [`00_analysis/OPEN_PRODUCT_DECISIONS.md`](./00_analysis/OPEN_PRODUCT_DECISIONS.md) — что подтвердить перед публикацией.
5. [`index.html`](./index.html) — локальный preview-hub.

## Структура

- [`00_analysis/`](./00_analysis/) — аудит корпуса, manifest, provenance, checksum и решения;
- [`01_brief_and_research/`](./01_brief_and_research/) — интервью, master brief, research, storyboard и wireframes;
- [`02_brand_assets/`](./02_brand_assets/) — каталог цветов, логотипы, очищенные изображения рам и motion-reference;
- [`03_current_site_reference/`](./03_current_site_reference/) — legacy-контент, геометрия и отобранные изображения;
- [`04_prototypes/`](./04_prototypes/) — исходники концептов C1, C3 и C4 и визуальное сравнение;
- [`Tools/`](./Tools/) — локальный сервер предпросмотра.

## Рекомендуемая архитектура

- **C1** — основной production baseline;
- **C3** — источник Ride Replay и интерактивного повествования;
- **C4** — источник Brief Studio и экспорта запроса;
- **V2** — только motion- и asset-reference.

## Локальный просмотр

Из каталога `SYRE` запустить:

```powershell
.\START_PREVIEW.cmd
```

После работы:

```powershell
.\STOP_PREVIEW.cmd
```

## Целостность

Внутренний manifest: [`00_analysis/SHA256SUMS.txt`](./00_analysis/SHA256SUMS.txt). Проверено 216 записей, расхождений нет.

Ключевой контентный конфликт: каталог подтверждает **15 базовых цветов**, а часть прототипов заявляет 39. Вес, цены, гарантию, географию, контакты и юридические сведения также нужно актуализировать перед production-релизом.
