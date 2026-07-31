# SYRE — essential website development pack

Отобранный и проверенный пакет материалов для разработки и модернизации нового сайта SYRE.

## Скачать

- [`SYRE_SITE_DEV_ESSENTIALS_20260731.zip`](./SYRE_SITE_DEV_ESSENTIALS_20260731.zip) — 35.80 MiB
- [`SYRE_SITE_DEV_ESSENTIALS_20260731.zip.sha256`](./SYRE_SITE_DEV_ESSENTIALS_20260731.zip.sha256) — контрольная сумма

**SHA-256:** `cfb26fe6ef2fc95bf70e47df003f74aac1183f5cea2ec8dc6e5f58865f13b548`

Проверка в PowerShell:

```powershell
(Get-FileHash .\SYRE_SITE_DEV_ESSENTIALS_20260731.zip -Algorithm SHA256).Hash.ToLower()
```

## Что внутри

- `00_analysis/` — аудит корпуса, provenance, manifest, checksum и открытые продуктовые решения;
- `01_brief_and_research/` — интервью, очищенный master brief, research, storyboard и wireframes;
- `02_brand_assets/` — каталог цветов, логотипы, визуальные референсы и motion-assets;
- `03_current_site_reference/` — извлечённый legacy-контент, точные данные продукта и отобранные изображения;
- `04_prototypes/` — рабочие исходники концептов C1, C3 и C4 плюс визуальное сравнение;
- `index.html` и `START_PREVIEW.*` — локальный навигатор по пакету.

## Рекомендуемая сборка

- **C1** — основной production baseline;
- **C3** — перенести модуль Ride Replay / интерактивное повествование;
- **C4** — перенести Brief Studio / формирование запроса;
- **V2** — использовать как motion- и asset-reference, не как готовую production-страницу.

## Критичные факты перед публикацией сайта

1. В исходном каталоге подтверждено **15 базовых цветов**, тогда как часть прототипов заявляет 39 — это нужно исправить или подтвердить новой матрицей.
2. Вес, цены, гарантия, география, контакты и юридические сведения отмечены как требующие актуального подтверждения.
3. WordPress-код старого сайта сохранён только как reference; он не выбран техническим baseline.

Пакет сформирован 2026-07-31. Исходный корпус: 367.83 MiB; итоговый ZIP: 35.80 MiB. CRC, внутренние SHA-256, ссылки preview-hub и отсутствие приватных путей/токенов проверены перед публикацией.
