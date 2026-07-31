# SYRE — source of truth

Этот документ отделяет подтверждённые сведения от legacy и prototype-copy.

## Приоритет источников

1. Последние прямые требования и транскрипт интервью.
2. `Каталог цветов Syre (RU).ai`, clean-frame manifest и оригинальные бренд-ассеты.
3. Stable scrape текущего сайта — для исторических текстов, геометрии и спецификации.
4. Research/концепты — только для UX, композиции и mechanics.

## Подтверждённое направление

- SYRE — бутиковое ручное производство карбоновых велосипедных рам.
- Коммуникация: спокойная, уверенная, инженерная, без крикливого luxury-copy.
- Главные темы: ride character, скорость/отзывчивость, современная геометрия,
  ручная укладка, глубокая кастомизация, solid colors, custom paint, hydrodip и raw carbon.
- Полноценный сайт — преимущественно светлый, с крупными фото и negative space.
- `/rebranding` и весь `/build` — непрерывная тёмная сцена.
- Нужны естественные RU и EN версии.
- Кастомизация должна быть центральной продуктовой системой, а не декоративным color picker.

## Подтверждённые legacy-данные

Текущий scrape фиксирует модель `Punkcake`, размеры 510/530/550/570/590, геометрию,
YOke, one-piece front triangle, silicone preform, chainstay 420 mm, BB drop 75 mm,
seat-tube offset 7 mm, 700C до 50 mm, 650B до 2.5", T47 и внутреннюю проводку.
Exact export находится в `03_current_site_reference/legacy_product_data.json`.

Эти данные следует хранить с provenance и подтверждать перед публикацией как актуальные.

## Критические конфликты

### Палитра: 15, не 39

AI-каталог literal показывает **15 базовых цветов**:
Light Ivory, Pink Pig, Amazon Blue, Gulf Blue, China Blue, Bahama Yellow,
Peach Orange, Mint Green, Soft Green, Olive Green, Classic Grey, Medium Grey,
Slate Grey, Sepia Brown, Ruby Star.

Также отдельно показаны raw carbon и special paint. Заявление о 39 цветах в C1-C5 —
prototype fabrication и не является продуктовым фактом.

### Вес

Интервью даёт ориентир около 920 г. Legacy-сайт фиксирует веса без покраски по размерам:
910 / 935 / 1015 / 998 / 1030 г. На публичном сайте число 920 г допустимо только после
подтверждения модели, размера и состава измерения.

### Цена

3500 USD и 300,000 RUB — старые значения из scrape. AI-каталог показывает доплаты за
special paint, но актуальность и коммерческие условия всё равно следует подтвердить.

### География и legal

RU legacy-copy говорит о Санкт-Петербурге/России, EN copy — о Европе. Автоматически
переносить ни одну версию нельзя. То же относится к старым legal, warranty, delivery
и payment формулировкам.

## Правила использования ассетов

- Новый UI: `02_brand_assets/v2_placeholder_reference/assets/frame-*.png`.
- Главные SVG: из той же папки.
- Палитра: AI-каталог и его previews.
- `03_current_site_reference/legacy_images_reference_only`: visual/provenance only;
  отдельные renders содержат символы, удалённые в clean assets.
- C1/C3/C4: переносить механику и композицию, а copy сверять с этим документом.
