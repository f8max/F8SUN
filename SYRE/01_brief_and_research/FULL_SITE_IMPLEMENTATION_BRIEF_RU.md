# SYRE — MASTER PROMPT ДЛЯ ПОЛНОЦЕННОГО PRODUCTION‑САЙТА

Версия: 1.0  
Дата: 2026-07-29  
Назначение: передать этот текст целиком сильному coding/design‑агенту вместе со всеми файлами SYRE. Результатом должен быть работающий production‑проект, а не презентация, набор мокапов или очередной план.

---

## BEGIN PROMPT

Ты работаешь как единая senior‑команда: Creative Director, Brand/Editorial Designer, UX Architect, Motion Designer, Creative Frontend Developer, Full‑Stack Engineer, Accessibility Specialist и QA Lead. Твоя задача — самостоятельно спроектировать, реализовать, проверить и упаковать **полноценный двуязычный сайт SYRE**, сохранив реальную идентичность продукта и превратив инженерные особенности, ручное производство и глубокую кастомизацию в убедительный цифровой опыт.

### Главный принцип выполнения

Не останавливайся на исследовании, концепте, wireframe, дизайн‑описании или статичном hero. После короткого аудита входных материалов переходи к коду и доводи проект до запускаемой, визуально проверенной версии. Каждый этап обязан создавать новый проверяемый файл, экран, функцию или отчёт. Если тест выявил дефект, исправь его напрямую, повтори затронутый тест и выполни одну финальную полную регрессию.

Нельзя объявлять результат готовым, если:

- открывается белый экран;
- работает только `file://`, но отсутствует нормальный HTTP‑запуск;
- есть лишь один лендинг вместо полного сайта;
- конфигуратор визуально ничего не меняет;
- интерактив существует только как заранее записанное видео;
- отсутствует RU или EN;
- в интерфейсе остались lorem ipsum, `TODO`, фиктивные отзывы, случайные метрики или неработающие кнопки;
- нет исходников, инструкций запуска, скриншотов и результатов тестов.

---

# 1. Источники и порядок доверия

Сначала прочитай и проиндексируй все приложенные материалы. Не начинай визуальную генерацию, пока не составлена карта источников и ассетов.

## 1.1. Обязательные локальные источники

1. Транскрипт интервью заказчика:  
   `01_brief_and_research\Транскрипт_Запись.txt`
2. Визуальная доска/скриншот заказчика:  
   `02_brand_assets\references\client-reference-board.png`
3. Стабильный scrape текущего сайта:  
   `03_current_site_reference`  
   SHA‑256: `9dd2a4095bfe129c60454256e7cfc6ccaf4f8dbda1c9269c41aa9bfe34991fc2`
4. Извлечённый scrape:  
   `03_current_site_reference`
5. Исследование UI/web‑референсов:  
   `01_brief_and_research\web-reference-matrix.md`
6. Синтез визуальных и prompt‑паттернов:  
   `01_brief_and_research\prompt-patterns-synthesis.md`
7. Очищенные изображения рам, где сохранён только основной wordmark SYRE и удалены посторонние символы/декали:  
   `02_brand_assets\v2_placeholder_reference\assets`  
   SHA‑256: `caaec18f56935bfd88350175a3a88e0862b802c9c6fdefe0b6d646d575529fdd`
8. Манифест очищенных рам:  
   `02_brand_assets\v2_placeholder_reference\SYRE_ONLY_CLEAN_MANIFEST.json`  
   SHA‑256: `b301afb1b58106f54fe8fd73f59b66f8d6c78fe68e0318b0d703af3e7fb38019`
9. Главный каталог цветов:  
   `02_brand_assets\color_catalog\Каталог цветов Syre (RU).ai`  
   SHA‑256: `f3e3dfa3d30e3973bda42365b8c7acf513414ecb031a69c165cd03dcdbc93bb2`
10. Все дополнительно приложенные фотографии, видео, Instagram‑материалы, логотипы, Illustrator‑файлы, тексты и бренд‑материалы.

## 1.2. Приоритет при конфликте

1. Последние прямые требования заказчика в этом prompt и транскрипте.
2. Приложенные исходники логотипа, рам и продуктовые документы; для палитры — literal данные из `Каталог цветов Syre (RU).ai`.
3. Локальный scrape текущего `ridesyre.com`, включая точные тексты, спецификации и геометрию.
4. Текущий публичный сайт `https://ridesyre.com/` как дополнительная проверка.
5. Референсы — только для композиционных принципов, motion‑грамматики и уровня качества.
6. Собственное дизайнерское решение, если данных выше нет.

Никогда не переносить чужую айдентику, текст, логотип, шрифт, изображение или композицию один в один. В `docs/SOURCE_AUDIT.md` зафиксировать для каждого факта и ассета: источник, путь/URL, назначение, статус использования и ограничения.

## 1.3. Работа с неизвестными данными

- Не придумывать актуальные цены, сроки производства, доступность опций, адрес, юридические условия, гарантию, доставку, stiffness/aero‑метрики, результаты испытаний и характеристики новых моделей.
- Старые цены `3500 USD` и `300 000 ₽` из scrape считать legacy‑данными и не публиковать как актуальные без свежего подтверждения заказчика.
- Из `Каталог цветов Syre (RU).ai` извлечь literal names, groups и исходные CMYK/RGB/spot values. Каталог имеет приоритет над legacy‑цветами scrape. Для web создать документированные sRGB‑приближения, сохраняя отдельно исходные печатные значения.
- Legacy‑цвета показывать как архивные и не делать заказываемыми, пока они не совпали с каталогом или не подтверждены заказчиком.
- Старые юридические тексты и географические формулировки не переносить автоматически.
- Если backend‑ключи, CRM/webhook или email‑провайдер ещё не заданы, реализовать настоящий валидируемый adapter‑интерфейс и явное состояние «интеграция не настроена» в development‑режиме. Форма не должна показывать ложное успешное отправление.
- Открытые продуктовые вопросы вынести в `docs/OPEN_PRODUCT_DECISIONS.md`; они не должны блокировать создание всех частей, для которых информации достаточно.

---

# 2. Бренд и продукт

SYRE — бутиковый производитель карбоновых велосипедных рам с уникальными окрасками. Рамы изготавливаются вручную. Сайт продаёт не абстрактную «роскошь», а стремление создать максимально быстрый, отзывчивый, технологичный и индивидуальный велосипед.

## 2.1. Голос бренда

- спокойный;
- уверенный;
- точный;
- инженерный;
- человечный;
- без крика, гипербол и агрессивной рекламы;
- каждый технический тезис должен объяснять, какое решение принято, зачем и что чувствует райдер;
- короткие эмоциональные формулировки допустимы, но всегда опираются на продукт.

Сначала создай сильную английскую редакционную версию, затем выполни естественную русскую адаптацию. Русский текст не должен выглядеть машинным дословным переводом.

## 2.2. Подтверждённые темы и факты

- boutique‑производство и ручная работа;
- высокая скорость, динамичность, отзывчивость и характер езды;
- современная геометрия;
- глубокая кастомизация;
- собственные палитры и сложные авторские схемы окраски;
- hydrodip;
- raw carbon;
- опциональные крепёжные бонки;
- выразительная эстетика;
- в интервью указан ориентир веса рамы около `920 г`;
- текущая модель в scrape — `SYRE Punkcake`;
- текущий сайт содержит пять размеров: `510`, `530`, `550`, `570`, `590 мм`;
- текущий сайт содержит 15 legacy‑цветов: `Light Ivory`, `Pink Pig`, `Amazon Blue`, `Gulf Blue`, `China Blue`, `Bahama Yellow`, `Peach Orange`, `Mint Green`, `Soft Green`, `Olive Green`, `Classic Grey`, `Medium Grey`, `Slate Grey`, `Sepia Brown`, `Ruby Star`; это архивный слой, а актуальную order‑палитру определяет Illustrator‑каталог;
- current‑site engineering: silicone bladder/preform, контроль слоёв, направления волокон и толщины стенок, curing, one‑piece front triangle и узел `YOke`;
- legacy‑спецификация Punkcake включает chainstay `420 мм`, BB drop `75 мм`, смещение seat tube `7 мм`, 700C до `50 мм`, 650B до `2,5″`, внутреннюю проводку, T47, варианты 1x/2x и крепёжные точки;
- точные legacy‑таблицы размеров, геометрии и веса брать программно из файлов scrape, не перепечатывать по памяти.

Формулировку «около 920 г» использовать только с корректным контекстом. Подробные веса разных размеров из старого сайта хранить в структурированных данных с отметкой источника; перед публичным релизом числовой конфликт должен быть подтверждён заказчиком.

## 2.3. Главное отличие

Кастомизация — не дополнительный цветовой picker, а центральная продуктовая система. Сайт должен показывать диапазон:

1. curated solid colors;
2. собственные палитры;
3. индивидуальные paint schemes;
4. hydrodip;
5. raw carbon;
6. one‑off/архивные проекты;
7. допустимые крепёжные опции;
8. путь от идеи клиента до утверждённого финиша.

---

# 3. Два разных визуальных режима

Не смешивать требования к временной заглушке и полноценному сайту.

## 3.1. Полноценный сайт

- преимущественно светлый, mineral‑white / warm‑paper фон;
- большие премиальные фотографии;
- много функционального negative space;
- минимум текста в одном экране;
- велосипед или рама — главный объект;
- кинематографичные медленные пролёты;
- макро карбона, стыков, краёв окраски и инженерных деталей;
- регулярный показ инженеров, форм, укладки carbon prepreg, curing и контроля качества;
- editorial‑характер с тёплой культурной интонацией Popeye/Amber Vintage, но без ретро‑маскарада.

## 3.2. Тёмная интерактивная сцена

Тёмный фон применяется:

1. на самостоятельной временной странице `/rebranding`;
2. на всём маршруте `/build`, включая вступительную сцену и основной configurator.

Маршрут `/[locale]/build` целиком использует непрерывную dark carbon / ink‑navy art direction. Интерактивная сцена бесшовно переходит в основной configurator; product preview, controls, summary и order CTA остаются на тёмной поверхности с WCAG‑совместимым контрастом. После intro нельзя переключать configurator на светлый фон.

Сцена обязана содержать:

- очень крупный логотип SYRE справа;
- 6–12 точных прозрачных изображений рам на desktop и 4–6 на mobile;
- рамы разных подтверждённых цветов;
- движение, падение, выезд и контролируемое вращение;
- заметную, но не хаотичную реакцию на pointer;
- эквивалентную touch‑реакцию;
- возможность рам перекрывать wordmark;
- возможность расчистить его движением pointer/touch;
- freeze/resume;
- статичную полноценную композицию при no‑JS и reduced motion.

Использовать только очищенные frame‑only assets. На рамах сохраняется основной wordmark SYRE. Посторонние значки, случайные надписи, деревья, маленькие пиктограммы и прочие удалённые символы не возвращать.

---

# 4. Информационная архитектура

Реализуй полноценный сайт со следующими маршрутами. URL должны иметь локализованный сегмент `/en` и `/ru`, кроме технической preview‑страницы `/rebranding`, которая также предоставляет переключатель языка.

Для каждого content‑driven маршрута действует publication gate. Если реальных материалов недостаточно, реализовать data‑driven route и локальный preview fixture, но скрыть маршрут из production navigation, sitemap и публичной сборки. В `docs/CONTENT_MATRIX.md` точно указать недостающие материалы. Пустые страницы и вымышленный контент не публиковать.

## 4.1. `/[locale]` — Home

Последовательность:

1. **Hero / Object first**
   - giant SYRE wordmark как пространственный слой;
   - точная рама или велосипед center‑right;
   - короткое brand statement слева;
   - один primary CTA `Build your SYRE / Создать свой SYRE`;
   - один secondary CTA `Engineering / Инженерия`;
   - hero читается за три секунды без движения.
2. **Ride character**
   - крупная action‑фотография или кинематографичный still;
   - короткий инженерный тезис о скорости, контроле и отзывчивости;
   - без неподтверждённых цифр.
3. **Customization spectrum**
   - raw carbon → color → custom paint → hydrodip;
   - реальное визуальное изменение рамы;
   - CTA в Atelier и Build.
4. **One primary engineering scroll story**
   - Preform → Layup → Cure → One‑piece triangle / YOke → Paint & QC;
   - пять осмысленных beats;
   - один sticky‑эпизод, а не серия бесконечных scroll‑трюков.
5. **Product proof**
   - Punkcake;
   - геометрия и выбранные спецификации;
   - ссылка на полную модель.
6. **Workshop**
   - люди, руки, материалы и контроль качества;
   - editorial gallery с подписями.
7. **Selected builds / Journal**
   - архив окраски, проекты, поездки, коллаборации;
   - только предоставленные материалы.
8. **Final CTA**
   - собрать конфигурацию;
   - связаться с командой.

## 4.2. `/[locale]/bikes` и `/[locale]/bikes/punkcake`

- спокойная продуктовая страница;
- полный визуальный портрет Punkcake;
- ride character;
- точная legacy‑геометрия из scrape как структурированная таблица;
- адаптивная size chart;
- engineering details;
- clear look, YOke, internal routing, seatpost clamp, hanger, tire clearance, mounting options;
- specification accordion/sections;
- связанные статьи производства и кастомизации;
- CTA в конфигуратор.

Если приложены новые модели, построить data‑driven шаблон и добавить их только по реальным данным.

## 4.3. `/[locale]/build` — интерактивный конфигуратор

### Вступление

- тёмная сцена;
- рамы красиво входят по scroll‑progress;
- pointer/touch слегка меняет вектор, rotation и параллакс;
- пользователь всегда может продолжить обычный вертикальный scroll;
- никакого scroll hijacking.

### Основной configurator

Весь основной configurator продолжает dark carbon / ink‑navy visual system вступления. Preview, controls, tables, summary и form states проектируются для тёмной поверхности; светлая секция внутри `/build` отсутствует.

Desktop:

- sticky product preview слева или center‑right;
- guided controls справа;
- summary и CTA всегда доступны.

Mobile:

- preview сверху;
- stepper или доступный bottom sheet;
- закреплённая компактная summary‑строка;
- никакой зависимости от hover.

Шаги:

1. `Product`: Frame / Bike — только если оба режима подтверждены входными данными.
2. `Fit`: размеры `510 / 530 / 550 / 570 / 590 мм`, size chart и geometry comparison.
3. `Finish`: raw carbon, solid, custom scheme, hydrodip — включать как order‑опции только при подтверждении; иначе показывать как inquiry‑направления Atelier.
4. `Color`: реальные swatches и визуалы из `Каталог цветов Syre (RU).ai`; legacy‑цвета из scrape держать отдельным архивным набором и не смешивать с подтверждённой order‑палитрой.
5. `Paint / Pattern`: только доступные реальные схемы.
6. `Mounts / Details`: только подтверждённые варианты.
7. `Summary`: изображение, все выбранные поля, source‑aware цена или `Request specification`, share link и order inquiry.

### Функциональный контракт

- любое изменение color/finish реально меняет визуал рамы;
- предпочтительно использовать approved aligned renders/layers;
- не использовать CSS `hue-rotate` на продуктовых фотографиях;
- если 3D нет, использовать точные 2D layers, masks и transparent frame assets;
- decals, геометрия, пропорции, свет и границы окраски остаются стабильными;
- selected state сериализуется в URL;
- refresh/back/forward восстанавливают состояние;
- есть reset и undo;
- выбранные значения доступны keyboard;
- изменения объявляются через доступный live region;
- поддерживается shareable configuration;
- order payload содержит versioned configuration JSON;
- price и availability приходят только из подтверждённого content source;
- не показывать фальшивую успешную оплату или отправку.

## 4.4. `/[locale]/custom` — SYRE Atelier

- raw carbon;
- curated palette;
- custom palette;
- авторские paint schemes;
- hydrodip;
- selected one‑off projects;
- процесс: brief → palette → preview → approval → paint → QC;
- material/finish macro;
- compare interaction без искажения продукта;
- CTA `Start a paint conversation`.

## 4.5. `/[locale]/engineering`

Сделай numbered narrative:

1. Silicone preform.
2. Carbon layup.
3. Curing and inner surface control.
4. One‑piece front triangle.
5. YOke and packaging constraints.
6. Finishing and quality control.

Каждая глава содержит:

- один проверяемый тезис;
- объяснение решения;
- визуальное доказательство;
- инженерную подпись/цитату только из реального материала;
- связанное влияние на ride или build compatibility.

Обычный document flow сохраняется даже при отключённом JavaScript.

## 4.6. `/[locale]/journal`

Editorial/product dual rail:

- rides;
- makers;
- workshop films;
- paint stories;
- collaborations;
- one‑off frames;
- release notes.

Система должна быть CMS‑ready, но при отсутствии подключённой CMS работать на локальном typed content.

## 4.7. `/[locale]/about`, `/[locale]/contact`, `/[locale]/order`

- короткая история и подход SYRE;
- ручное производство;
- команда/инженеры только по реальным материалам;
- контактная форма;
- order inquiry с configuration summary;
- email `order@ridesyre.com` допустим как legacy‑контакт из scrape, но перед production‑публикацией должен быть подтверждён;
- privacy/consent;
- ясные success/error/pending states;
- без прямого payment flow, пока заказчик не утвердил merchant и legal requirements.

## 4.8. `/rebranding`

Самостоятельная временная заглушка:

- full viewport;
- тёмное поле;
- очень большой SYRE logo справа;
- падающие/летящие/вращающиеся цветные рамы;
- pointer/touch forces;
- рамы перекрывают logo, движение раскрывает его;
- минимум текста;
- optional email capture за feature flag;
- один restrained easter egg: удержание `S` примерно `800 ms` мягко очищает коридор вокруг wordmark, отпускание возвращает рамы;
- `Space` и double click/tap переключают freeze/resume;
- visible unobtrusive hint;
- static poster fallback.

## 4.9. Пять реально запускаемых концепций `/rebranding`

До фиксации финальной art direction создать пять визуально и механически различимых вариантов на одних проверенных SYRE assets:

- `/rebranding/concept-01` — controlled vertical rain;
- `/rebranding/concept-02` — diagonal drift;
- `/rebranding/concept-03` — orbital field around the wordmark;
- `/rebranding/concept-04` — scroll‑released frame layers;
- `/rebranding/concept-05` — sparse editorial collision.

Это пять работающих first‑viewport prototypes, а не пять текстовых moodboards и не пять копий с заменённым цветом. Каждый вариант обязан:

- работать по HTTP;
- иметь собственную композицию, motion rule и pointer/touch response;
- сохранять literal ТЗ: тёмный фон, крупный logo справа, цветные рамы поверх logo и возможность раскрыть logo;
- иметь reduced‑motion/static fallback;
- использовать только одни и те же проверенные frame/logo assets;
- иметь desktop и mobile screenshot;
- содержать короткий trade‑off: visual impact, readability, motion cost и mobile risk.

После сравнения самостоятельно выбрать strongest default `/rebranding` и продолжить полный сайт, не останавливая работу в ожидании выбора. Все пять preview‑маршрутов сохранить для демонстрации заказчику.

---

# 5. Art direction и дизайн‑система

## 5.1. Общая концепция: Editorial Engineering

Сайт должен ощущаться как совместная работа инженеров, фотографов и редакторов, а не как generic luxury‑tech template.

### Цвет

- base: mineral white / warm paper;
- dark scenes: carbon black / ink navy;
- text: near‑black, не абсолютный #000 на всех поверхностях;
- accent: один подтверждённый SYRE color на сцену;
- UI‑статусы отделять не только цветом;
- окончательные значения извлечь из реальных ассетов и оформить как CSS tokens.

### Композиция

- 12‑column grid desktop;
- 4‑column grid mobile;
- 35–50% осмысленного negative space на больших экранах;
- hero product center‑right;
- statement upper‑left;
- oversized wordmark может проходить за рамой;
- body copy никогда не перекрывается продуктом;
- один доминирующий объект на viewport;
- никаких стен из карточек.

### Типографика

Три роли:

1. Display — выразительный condensed/grotesk или текущий лицензированный brand face.
2. Text — нейтральный humanist grotesk.
3. Technical — mono для размеров, sequence numbers и engineering labels.

Сначала проверить приложенные Houschka/Montserrat‑файлы и право их использования. Шрифты self‑hosted, WOFF2, subset, с metric‑compatible fallback.

Ориентиры:

- hero: `clamp(56px, 9vw, 152px)`;
- section statement: `clamp(40px, 6vw, 96px)`;
- body: `clamp(16px, 1.25vw, 20px)`, максимум `58ch`;
- technical labels: `11–13px`, tracking `0.12–0.24em`.

Не использовать uppercase для всего текста и не строить всю иерархию на одном Inter.

### Photography / CGI

- точная рама — единственный hero object;
- сохранять геометрию, пропорции труб, dropouts, decals и границы цвета;
- controlled soft key + crisp carbon edge;
- реальные contact/occlusion shadows;
- macro carbon weave, joints, paint edges, finish transitions и workshop details;
- никакого дыма, лишних механизмов, случайного гонщика, фальшивых внутренних деталей или автомобильного CGI‑клише;
- generated media допустима только для атмосферы, если она не подменяет продукт и явно отделена от технического доказательства.

## 5.2. Обязательный `SYRE_DESIGN.md`

Создай `docs/SYRE_DESIGN.md` до массовой сборки страниц. В нём должны быть:

- exact color tokens;
- typography roles и лицензии;
- spacing scale;
- grids и breakpoints;
- radii/borders/shadows;
- navigation;
- buttons/links;
- configurator controls;
- form states;
- imagery treatment;
- motion durations/easing;
- focus states;
- reduced‑motion rules;
- accessibility contrast pairs;
- do/don’t list;
- примеры desktop/mobile.

После фиксации `docs/SYRE_DESIGN.md` самим исполнителем, без ожидания внешнего согласования, все страницы используют единые токены. Пользовательское утверждение требуется только если пользователь явно приостановил выполнение для выбора.

---

# 6. Motion, Canvas, 3D и progressive enhancement

## 6.1. Единая motion‑грамматика

- CSS transitions/WAAPI — для простых hover/focus/color transitions;
- `Motion` — единственный JS motion runtime для DOM, page/section transitions, gestures и scroll‑linked states;
- использовать `LazyMotion` или минимальные imports;
- UI feedback: примерно `180–450 ms`;
- chapter reveals: примерно `700–1200 ms`;
- анимировать преимущественно `transform` и `opacity`;
- никаких одновременных Motion + Anime.js + GSAP;
- никакого Lenis или принудительного smooth scroll по умолчанию;
- View Transitions API допустим как progressive enhancement с нормальным fallback.

## 6.2. Canvas frame field

- native Canvas 2D;
- один `requestAnimationFrame` loop;
- точные local frame sprites;
- deterministic seeded initial state для воспроизводимых screenshots;
- DPR cap `1.5` для physics scene;
- desktop 8–12 sprites;
- mobile 4–6 sprites;
- pause при `document.hidden`;
- pause вне viewport;
- pause при Save‑Data;
- pointer/touch updates не декодируют изображения;
- spatial index не нужен при таком малом количестве объектов;
- canvas является декоративным слоем и имеет `aria-hidden="true"`;
- logo, copy, controls и CTA всегда находятся в DOM;
- при WebGL/canvas failure остаётся полноценный static composition.

Optional OffscreenCanvas worker использовать только после профилирования и доказанного выигрыша. Не усложнять baseline заранее.

## 6.3. Primary scroll story

Только одна большая sticky sequence на странице Home:

| Progress | Visual | Смысл |
|---:|---|---|
| 0–12% | полный static frame portrait | продукт и характер |
| 12–34% | контролируемый light/rotation | hand layup |
| 34–56% | macro/layered material transition | материал и precision |
| 56–78% | verified finish/color transition | customization |
| 78–100% | clean final pose | переход в Build |

- длина примерно `280–360vh` desktop, короче на mobile;
- 60–96 desktop frames и 24–48 mobile frames максимум, либо малое число layered assets;
- poster — frame zero и no‑JS fallback;
- сначала загружаются poster и ключевые переходные кадры;
- bounded decode cache вокруг текущего progress;
- при пропуске кадра удерживать ближайший decoded frame;
- canvas никогда не мигает пустотой;
- колёсико и touch scroll не перехватываются.

## 6.4. Spline / Unicorn / WebGL

Spline или Unicorn Studio не входят в critical baseline.

Один lazy‑loaded эксперимент допустим только если:

- предоставлена точная production GLB/scene с правильными UV и textures;
- сцена действительно улучшает понимание рамы, finish или engineering;
- есть local poster;
- сцена загружается ниже fold или после явного действия;
- не является единственным способом навигации или чтения характеристик;
- работает fallback;
- измерены transfer, CPU, GPU, memory и mobile behavior;
- нет второго fullscreen renderer;
- 3D compressed transfer ≤ `3 MB`;
- scene profiler прошёл.

Если этих условий нет, сделать более точную и быструю 2D‑реализацию. Никогда не реконструировать геометрию SYRE «по похожему велосипеду».

---

# 7. Технологический стек

Создай новый self‑hostable production‑репозиторий:

- current stable `Next.js` App Router;
- `TypeScript` strict;
- React Server Components по умолчанию;
- Client Components только для `FrameField`, configurator, compare и необходимых interactive controls;
- CSS custom properties + CSS Modules;
- Tailwind допустим только как ограниченный utility layer, а не как замена дизайн‑системы;
- `Motion` как единственная DOM animation dependency;
- typed locale dictionaries;
- versioned JSON/TypeScript product schema с runtime validation;
- локальный file‑content adapter по умолчанию;
- CMS adapter interface для будущего headless CMS;
- Server Action или route handler для contact/order inquiry;
- schema validation;
- honeypot + rate limiting adapter;
- transactional email/CRM webhook adapter;
- `.env.example` без секретов;
- CSP и безопасная обработка пользовательского ввода;
- `next/image`/responsive sources, AVIF/WebP, explicit dimensions;
- self‑hosted fonts;
- sitemap, robots, canonical, localized metadata, `hreflang`, OG images;
- JSON‑LD только из подтверждённых данных.

CMS и PostgreSQL подключать, если соответствующие credentials/сервисы реально предоставлены. При их отсутствии локальный content adapter обязан полностью отображать сайт, а test‑adapter — позволять проверять order flow без ложной production‑доставки.

Не мигрировать production в hosted Framer: исходники должны находиться в репозитории и запускаться локально/self‑hosted.

---

# 8. Borrowed patterns и референсы

Изучить:

- `https://spline.design/`
- `https://www.unicorn.studio/`
- `https://21st.dev/`
- `https://www.framer.com/`
- `https://vibeui.online/`
- `https://motionsites.ai/`
- `https://recent.design/`
- `https://skiper-ui.com/`
- `https://ui.aceternity.com/`
- `https://styles.refero.design/`
- `https://componentry.dev/`
- `https://animejs.com/`
- `https://motion.dev/`
- `https://kokonutui.com/docs/navigation/morphic-navbar`
- `https://bklit.com/`
- `https://eli-buildz-s26.notion.site/Landing-Page-Aerospace-35a0680410e980b890c3f2c8763b980a`
- `https://axiomai-etyfcawx.manus.space/`
- `https://manus.im/share/FNsah1dlAtmbg59580nZqO`
- `https://eli-buildz-s26.notion.site/Suspended-Air-Ads-38a0680410e980e4a6b6d4589ec08094`
- `https://eli-buildz-s26.notion.site/Landing-Page-Ski-35a0680410e9807eb2caf9c0750b4eee`
- `https://treelinesup-k7ntvfag.manus.space/`
- `https://eli-buildz-s26.notion.site/Landing-Page-The-Gold-Link-35a0680410e9807bbaf2f3bb2ca08fa9`
- `https://eli-buildz-s26.notion.site/DJ-Turnable-35a0680410e980f58417caadf7a8c0d6`
- `https://manusweb-xhht5whr.manus.space/`
- `https://eli-buildz-s26.notion.site/Model-Campaign-Ad-37e0680410e980b9a88bf27d7bbeeb34`
- `https://eli-buildz-s26.notion.site/Floating-Ad-Effect-36d0680410e9807ca4addff35e3103e3`
- Elliott Cycle Works, Argonaut Cycles, Bastion Cycles, Specialized/S‑Works, Rapha, PAS Normal Studios, SRAM, OPEN, Festka, SATISFY, Popeye и Amber Vintage.

Переносить только абстрактные принципы:

- Argonaut/Bastion/Festka: engineering evidence, process chapters, customization and ownership journey;
- SATISFY: самостоятельная editorial culture и cinematic pacing;
- Popeye/Amber Vintage: человеческое тепло, ритм и неожиданная редакционная деталь;
- Refero: token‑first `DESIGN.md`;
- Framer: responsive media, lazy loading, culling и visual QA;
- 21st.dev, Skiper, Aceternity, Componentry, Kokonut: максимум один тщательно адаптированный pattern на функциональную зону после dependency/license/a11y audit;
- Motion: production runtime;
- Spline/Unicorn: conditional prototype, не baseline;
- Anime.js: не подключать параллельно Motion.

Не использовать:

- generic bento ради bento;
- glassmorphism wall;
- aurora, globe, sparkles;
- фиолетовые SaaS‑градиенты;
- бесконечные cursor trails;
- случайные WebGL particles;
- несколько тяжёлых scroll scenes подряд;
- template‑компоненты без адаптации к SYRE;
- визуальный язык референса один в один.

---

# 9. Пасхалки

Пасхалки должны быть редкими, связанными с брендом и не мешать покупке.

Обязательная:

- hold `S` на `/rebranding` очищает коридор вокруг логотипа.

Допустима ещё одна:

- длительное нажатие на маленький technical label в Atelier на короткое время показывает macro carbon/layup overlay или архивную paint‑схему, только если соответствующий реальный asset предоставлен.

Пасхалки:

- доступны keyboard и touch;
- имеют reduced‑motion вариант;
- не скрывают информацию;
- не запускают громкий звук;
- не ухудшают performance.

---

# 10. Accessibility

Цель: `WCAG 2.2 AA`.

Обязательно:

- semantic landmarks;
- корректная heading hierarchy;
- skip link;
- keyboard navigation;
- visible `:focus-visible`;
- focus не скрывается sticky‑элементами;
- contrast не ниже `4.5:1` для обычного текста и `3:1` для крупного;
- проектировать controls минимум `44×44 CSS px`;
- корректные labels, descriptions и errors;
- status/error не только цветом;
- touch/keyboard equivalent для drag/hover/canvas;
- essential content не помещать только в canvas;
- alt/captions для продуктовых и производственных изображений;
- `lang` и `hreflang`;
- locale switch с сохранением эквивалентного маршрута;
- form errors связываются с полями;
- live region для configurator summary;
- autoplay media отсутствует либо имеет pause;
- no‑JS версия сохраняет контент и CTA.

При `prefers-reduced-motion: reduce`:

- отключить падение, вращение, cursor forces, inertial easing и parallax;
- sticky sequence заменить static hero + 3–5 normal‑flow panels;
- убрать искусственную большую scroll height;
- сохранить весь текст, proof, navigation, configurator и CTA;
- user‑started motion возможен только после явного действия.

---

# 11. Performance budgets

Официальные CWV цели на p75 mobile:

- LCP ≤ `2.5 s`;
- INP ≤ `200 ms`;
- CLS ≤ `0.10`.

Внутренняя цель CLS: ≤ `0.05`.

CI budgets:

- Lighthouse mobile Performance / Accessibility / SEO ≥ `90`, stretch ≥ `95`;
- initial JS home ≤ `170 KB gzip`;
- initial JS build ≤ `250 KB gzip`;
- initial transfer home ≤ `1.2 MB`;
- initial transfer build ≤ `1.8 MB`;
- hero poster ≤ `350 KB` mobile и ≤ `700 KB` desktop;
- fonts total ≤ `100 KB WOFF2` для первого viewport;
- optional 3D ≤ `3 MB compressed` и только после interaction;
- никакого autoplay video/WebGL в critical path;
- page error count: `0`;
- blocking console error count: `0`;
- horizontal overflow: `0`;
- desktop motion target `60 fps`;
- low‑end mobile минимум `30 fps`;
- texture memory target `<96 MB`;
- heavy scenes прекращают работу offscreen/hidden;
- учитывать `Save-Data`.

Не писать «performance passed» без сохранённого raw Lighthouse/trace результата.

---

# 12. Responsive contract

Визуально и функционально проверить:

- 320×568;
- 390×844;
- 768×1024;
- 1024×768;
- 1440×900;
- 1920×1080.

Обязательно:

- `100svh` и safe areas;
- no horizontal overflow;
- mobile не является уменьшенной desktop‑версией;
- navigation, configurator, tables и forms переразложены осмысленно;
- product silhouette остаётся читаемой;
- wordmark не превращается в случайный обрезанный фрагмент;
- CTA остаётся видимым и доступным;
- geometry table имеет readable mobile mode.

---

# 13. Order/contact backend

Реализуй полный технический путь inquiry:

1. клиент конфигурирует продукт;
2. configuration state валидируется;
3. summary доступно пользователю;
4. форма собирает только необходимые contact‑поля и consent;
5. сервер повторно валидирует payload;
6. adapter отправляет письмо/CRM webhook при наличии настоящей конфигурации;
7. пользователю показывается реальный response state;
8. сервер логирует request ID без утечки персональных данных;
9. retry не создаёт случайных дублей;
10. тестовый adapter работает только в test/development.

Не реализовывать прямую оплату до получения merchant/legal требований.

---

# 14. Обязательный workflow

## Timebox до видимого результата

Phase 0 + Phase 1 вместе занимают максимум 30 минут. До первого vertical slice создать только минимальные provisional‑версии source map, asset inventory, content matrix и design tokens. Первый работающий Home + `/build` viewport по HTTP, desktop/mobile screenshots и одно реальное переключение цвета должны появиться в первой implementation‑итерации. Полные SHA manifests, расширенные исследования и документацию завершать после появления работающего интерфейса.

## Phase 0 — Provisional source audit

Создать:

- `docs/SOURCE_AUDIT.md`;
- `docs/ASSET_INVENTORY.json`;
- `docs/CONTENT_MATRIX.md`;
- `docs/OPEN_PRODUCT_DECISIONS.md`;
- SHA‑256 для всех используемых исходных frame/logo assets.

Проверить изображения визуально и по dimensions/alpha, а не только по имени файла. На этом шаге достаточно provisional‑версий перечисленных документов; после vertical slice их нужно довести до полного состояния.

## Phase 1 — Provisional design decision

Создать:

- `docs/IA.md`;
- `docs/SYRE_DESIGN.md`;
- `docs/MOTION_STORYBOARD.md`;
- desktop/mobile low‑fidelity composition;
- `docs/DESIGN_DECISION.md` с provisional направлением `Editorial Engineering` и критериями сравнения пяти `/rebranding` concepts.

После этого сразу перейти к working vertical slice. Не ждать дополнительного голосования, если пользователь прямо не остановил выполнение.

## Phase 2 — Working vertical slice

Сначала добиться:

- HTTP 200 на Home;
- видимого hero без белого экрана;
- работающего locale switch;
- одного реального color change;
- работающей pointer/touch frame interaction;
- no‑JS/reduced‑motion fallback.

Снять первые desktop/mobile screenshots и затем продолжить полный сайт.

После первого vertical slice реализовать пять маршрутов `/rebranding/concept-01` … `/concept-05`, снять desktop/mobile screenshots, записать trade‑offs и самостоятельно выбрать strongest default. Не задерживать первый видимый Home + `/build` результат ради полного polish всех пяти concepts.

## Phase 3 — Full implementation

Реализовать все маршруты, configurator, content schema, forms, motion, fallbacks, SEO и localization.

## Phase 4 — QA и исправления

Запустить:

- typecheck;
- lint;
- unit tests;
- production build;
- Playwright;
- axe;
- Lighthouse CI;
- visual regression;
- keyboard test;
- touch/pointer tests;
- reduced motion;
- no‑JS;
- missing asset test;
- network error form test;
- back/forward configurator state;
- screenshots на всех целевых разрешениях.

Исправить найденные дефекты. После fixes выполнить одну полную финальную регрессию на одних и тех же замороженных байтах.

## Phase 5 — Packaging

Подготовить:

- production source;
- build/run instructions;
- Windows launchers;
- reports;
- screenshots;
- manifests;
- final source ZIP без `node_modules`, cache и секретов.

---

# 15. Windows‑запуск и защита от белого экрана

Пользователь должен запускать сайт без ручной настройки.

Создать:

- `START_SYRE.cmd` — проверяет зависимости, запускает production preview/server и открывает `http://127.0.0.1:<port>`;
- `STOP_SYRE.cmd` — останавливает только процесс этого проекта;
- `README_RUN.md` — точные команды install/dev/build/start/test;
- health endpoint или проверяемый root response;
- smoke script, который запускает production build, ждёт HTTP 200, проверяет ключевые assets и сохраняет console/page errors.

Не предлагать открывать Next.js build через `file://`. Финальный отчёт обязан содержать проверенный локальный HTTP URL, команду запуска, PID/exit evidence и скриншот первой отрисовки.

---

# 16. Обязательные deliverables

1. Полный source repo.
2. Все страницы из Section 4.
3. RU/EN content dictionaries.
4. Реально работающий configurator.
5. Пять реально работающих `/rebranding/concept-01` … `/concept-05` и выбранный default `/rebranding`.
6. Contact/order backend adapter.
7. `docs/SOURCE_AUDIT.md`.
8. `docs/ASSET_INVENTORY.json`.
9. `docs/CONTENT_MATRIX.md`.
10. `docs/OPEN_PRODUCT_DECISIONS.md`.
11. `docs/IA.md`.
12. `docs/SYRE_DESIGN.md`.
13. `docs/MOTION_STORYBOARD.md`.
14. `docs/ARCHITECTURE.md`.
15. `docs/QA_REPORT.md` с raw command outputs/links.
16. `.env.example`.
17. `START_SYRE.cmd`, `STOP_SYRE.cmd`, `README_RUN.md`.
18. Desktop/mobile screenshots всех основных маршрутов.
19. Playwright/Lighthouse/axe reports.
20. SHA‑256 manifest финальных файлов.
21. Финальный ZIP исходников и документов без secrets/cache/`node_modules`.

---

# 17. Definition of Done

Проект готов только если одновременно выполнено следующее:

1. Home с первого viewport выглядит как SYRE, а не как template gallery.
2. Светлая editorial‑система Home/product/editorial‑разделов разграничена с полностью тёмными `/[locale]/build` и `/rebranding`; весь основной configurator, включая controls, tables, summary и form states, остаётся dark carbon / ink‑navy.
3. Product/frame — главный визуальный объект.
4. На рамах отсутствуют удалённые случайные символы; основной SYRE wordmark сохранён.
5. RU и EN работают на эквивалентных маршрутах.
6. Color selection меняет реальный product visual.
7. Configurator state переживает refresh/back/forward и сериализуется в URL.
8. Geometry/spec data берётся из versioned structured source.
9. Customization раскрыта как центральное преимущество.
10. Engineering показан через Preform/Layup/Cure/One‑piece/YOke/QC.
11. Pointer, touch и keyboard имеют рабочие пути.
12. Canvas/WebGL failure не ломает navigation, CTA или контент.
13. Reduced‑motion путь полноценен.
14. No‑JS путь содержит ключевой контент и CTA.
15. Order form не имитирует отправку.
16. Нет непроверенных цен, фактов, отзывов или метрик.
17. Нет белого экрана при проверенном HTTP‑запуске.
18. Нет горизонтального overflow на целевых разрешениях.
19. Нет page errors и blocking console errors.
20. Production build завершается успешно.
21. Lighthouse, axe и Playwright сохраняют реальные отчёты.
22. CWV/performance budgets измерены.
23. Все critical assets локальные, оптимизированные и присутствуют в manifest.
24. Финальный ZIP воспроизводимо собирается из проверенного source state.
25. Скриншоты доказывают desktop и mobile качество.
26. Пять `/rebranding` concepts реально различаются композицией и motion‑механикой, а не только цветом.

---

# 18. Формат рабочих отчётов

Каждый отчёт короткий и предметный:

```text
Current: <активный объект и стадия>
Changed: <конкретные файлы и видимые изменения>
Verified: <точная команда/тест и результат>
Artifacts: <абсолютные пути>
Next: <один следующий шаг>
```

Не повторять старый статус без нового результата. Не заменять реализацию длинным обсуждением. Не отмечать check как passed без raw evidence.

Начни сейчас с Phase 0, затем без паузы переходи к рабочему vertical slice и полной реализации.

## END PROMPT
