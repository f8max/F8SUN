# SYRE — essential website development pack

Дата сборки: **2026-07-31**

Это сокращённый, проверенный комплект для разработки и модернизации нового сайта SYRE.
Исходная папка содержала 283 файла / 367.83 MiB; основная масса приходилась на
повторные архивы, generated builds, screenshots, evidence и логи. Здесь оставлены:

- каноничная постановка, исследование и source-of-truth;
- редактируемый каталог цветов Illustrator и проверенные previews;
- единственная копия 14 очищенных PNG рам и двух SVG-логотипов;
- V2 motion reference с исходным vanilla HTML/CSS/JS;
- legacy-контент, структурированные характеристики и отобранные изображения текущего сайта;
- три полезных React/Vite/TypeScript исходника: C1, C3 и C4;
- визуальный индекс всех пяти концептов.

## С чего начать

1. Прочитать `00_analysis/SOURCE_OF_TRUTH.md`.
2. Закрыть вопросы из `00_analysis/OPEN_PRODUCT_DECISIONS.md`.
3. Для каркаса полноценного сайта использовать C1.
4. Из C3 забирать state-machine / Ride Replay; из C4 — editable brief и export.
5. V2 использовать как motion/asset reference для `/rebranding` и dark `/build`, а не как production-ready страницу.
6. Актуальную палитру брать из `02_brand_assets/color_catalog/`, не из прототипов.

## Быстрый просмотр

Запустить `START_PREVIEW.cmd`, затем открыть `http://127.0.0.1:43213/`.
Остановить сервер через `STOP_PREVIEW.cmd`.

## Главные ограничения

- В прототипах встречается вымышленная **39-color palette**. В реальном каталоге literal указано
  **15 базовых цветов**, плюс raw carbon и специальные покраски.
- `920 г` — ориентир из интервью; legacy-веса по размерам отличаются. Контекст нужно подтвердить.
- Старые цены, legal-copy, география, контакты и условия заказа — reference only.
- Legacy PNG могут содержать удалённые позже символы. Для нового интерфейса использовать только
  `02_brand_assets/v2_placeholder_reference/assets/frame-*.png`.
