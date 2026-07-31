# SYRE — матрица web/UI‑референсов

Дата исследования: **2026-07-29**  
Объект применения: новая улучшенная итерация сайта SYRE; проверенный `run85` не изменяется.

## Контекст SYRE, от которого нельзя отклоняться

Локальный scrape исходного `ridesyre.com` показывает не абстрактный SaaS, а бренд кастомных карбоновых gravel‑велосипедов:

- главный тезис: **“Only fun, only positive emotions”**;
- продукт: **SYRE Punkcake**, ручное европейское производство;
- сильные доказательства: silicone bladder/preform, направления слоёв carbon fiber, one‑piece front triangle, YOke, геометрия;
- коммерческий путь: **Bike → Innovation → Build Your Syre → Order now**;
- конфигуратор: Frame/Bike, пять размеров, 15 цветов, цена и таблица геометрии;
- визуальная ДНК: крупный округлый логотип, чистые формы, outdoor/action‑фото, чёрный/молочный фон и цвет самого велосипеда.

Следовательно, референсы используются для усиления **кинетического продукта и инженерной истории**, а не для сборки типового лендинга с glassmorphism, bento‑сеткой и случайными neon‑эффектами.

## Решение по минимальному production‑стеку

### Базовый стек

1. **Семантические HTML5 + CSS custom properties + vanilla JavaScript.**
2. **Canvas 2D** — только для существующего поля/физики кадров; один `requestAnimationFrame` loop на видимую сцену.
3. **Motion** — единственная motion‑зависимость:
   - по умолчанию `motion/mini` для навигации, CTA и DOM‑переходов (**2.3 kB**, размер из официальной документации);
   - `scroll()` из того же пакета подключать только для утверждённой scroll‑истории Innovation; официально функция указана как **5.1 kB**;
   - Anime.js, GSAP и Framer Motion как отдельные параллельные рантаймы не подключать.
4. **DESIGN.md + CSS tokens**, созданные по модели Refero, — контракт между агентами, но не runtime‑зависимость.
5. React/Next/Tailwind не вводить только ради одного компонента. Нужные паттерны из 21st.dev, Skiper, Aceternity, Componentry и Kokonut переносить в текущую архитектуру как небольшой проверенный HTML/CSS/Motion‑код.
6. Spline/Unicorn не входят в baseline. Возможен один отложенный Spline‑эксперимент, только если появляется оптимизированная 3D‑модель рамы и он проходит бюджет.

### Бюджеты и общие гейты

- LCP p75 ≤ **2.5 s**, INP p75 ≤ **200 ms**, CLS ≤ **0.10**.
- Добавочный initial JS для оболочки: цель ≤ **10 kB gzip**; тяжёлые сцены не входят в initial path.
- Анимация только `transform`/`opacity`, кроме Canvas‑отрисовки; blur ≤ 10 px и без постоянных full‑viewport фильтров.
- Любая сцена стартует только когда видима, останавливается при `document.hidden`/вне viewport.
- `prefers-reduced-motion: reduce`: остановить физику, parallax, autoplay и крупные перемещения; оставить мгновенное состояние или короткий opacity‑fade.
- В Canvas/WebGL не хранится единственная версия текста, цены, параметров или CTA: всё важное существует в обычном DOM.
- Keyboard, touch и pointer дают один и тот же результат; видимый `:focus-visible`; touch target минимум 44×44 CSS px.
- Каждая внешняя сцена имеет локальный poster/fallback; отсутствие WebGL или сети не блокирует покупку/навигацию.

## Практическая матрица

| Референс | Конкретный паттерн / возможность | Вердикт | Точная зона SYRE | Зависимость и вес | Риск производительности и обязательный guardrail | Accessibility |
|---|---|---|---|---|---|---|
| [Spline](https://spline.design/) / [Viewer docs](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer) / [optimization](https://docs.spline.design/exporting-your-scene/how-to-optimize-your-scene) | Интерактивная 3D‑сцена с states/events, cursor/scroll events и web component `<spline-viewer>`; Viewer lazy‑loads по умолчанию. | **CONDITIONAL** — один proof‑of‑concept, не baseline. Из всех внешних WebGL‑вариантов это лучший кандидат, если есть реальная 3D‑модель рамы. | `Build Your Syre`: поворот рамы и смена 15 цветов; либо `Innovation`: разбор one‑piece front triangle/YOke. Не ставить как декоративный фон hero. | Внешний viewer runtime + `.splinecode`; фактический transfer зависит от сцены и должен быть измерен. Не более одного embed на странице. | Официальные docs предупреждают о CPU/GPU‑цене 3D; уменьшить polygons/objects/materials/textures/lights, включить geometry/image compression, грузить после poster и intersection. Гейт: сцена ≤1.5 MB transfer, не ухудшает LCP/INP, стабильна на среднем mobile GPU. | Сцена `aria-hidden`, если декоративная; если управляемая — отдельные DOM‑кнопки Rotate/Color, клавиатура, текстовое состояние цвета. Reduced motion показывает статичный poster. |
| [Unicorn Studio](https://www.unicorn.studio/) | No‑code WebGL motion assets, shader/interactive backgrounds, embed в любой сайт. | **REJECT для production baseline; CONDITIONAL только как визуальный spike вместо Spline, не вместе с ним.** | Возможный атмосферный hero‑фон для одного концепта; функционально уже перекрыт Canvas 2D и Spline‑кандидатом. | Remote WebGL runtime + project asset; стабильный публичный размер на landing page не указан — измерение обязательно. | Второй WebGL renderer дублирует Canvas/возможный Spline, повышает GPU, battery и риск white screen. Гейт тот же: lazy/idle load, poster, один renderer, mobile profiling. | Декоративный canvas исключить из accessibility tree; контент и CTA — DOM; отключить motion при reduced motion. |
| [21st.dev](https://docs.21st.dev/) | Registry из React/Tailwind/shadcn‑совместимых компонентов; код копируется в repo, а не тянется одной общей библиотекой; есть AI‑ready prompts. | **ADOPT как каталог паттернов/source review, не как framework migration.** | Найти один качественный control для `Build Your Syre`, мобильный drawer и компактный gallery switcher пяти концептов. | Общего runtime нет; вес равен коду и зависимостям конкретного скопированного компонента. Для vanilla‑версии переносить только DOM/CSS‑логику. | Главный риск — “component soup” и случайные зависимости. Перед переносом: список imports, license, keyboard states, DOM count, bundle diff; максимум один заимствованный паттерн на зону. | Не доверять ярлыку “production-ready”: проверить tab order, `aria-*`, focus trap, Escape, contrast и reduced motion в нашем коде. |
| [Framer](https://www.framer.com/) / [performance](https://www.framer.com/performance/) / [optimization guide](https://www.framer.com/help/articles/site-optimization/) | Визуальное построение responsive‑композиций; полезные production‑приёмы: pre-render, responsive images, culling/virtualization тяжёлых элементов, WAAPI, lazy loading. | **ADOPT методы и визуальное QA; REJECT миграцию текущего сайта на hosted Framer.** | Все страницы: responsive breakpoints; остановка Canvas/видео вне viewport; AVIF/WebP; sticky‑storyboard для Innovation. | Как reference — 0 runtime. Миграция означала бы смену платформы и lock‑in, поэтому не нужна. | Framer отдельно предупреждает, что embeds, Spline, shadows/blurs и scroll effects могут замедлять страницу. Применить culling и ≤10 px blur, но не подключать Framer runtime. | Сохранять семантические headings/landmarks, alt, tab order, contrast и reduced‑motion режим в нашем HTML. |
| [vibeui.online](https://vibeui.online/) | Это библиотека **92 UI‑промптов**, а не обязательный component runtime. Полезны структуры “big bold typography”, “floating UI elements”, “scroll-triggered reveal”, “transparent over hero”, “giant logo footer”. | **ADOPT как prompt vocabulary с жёстким SYRE‑контекстом.** | Hero: крупный SYRE wordmark + kinetic frames; Innovation: sticky visual + последовательные этапы; mobile nav; крупный logo/footer. | **0 runtime**, текстовый reference. | Риск — типовой AI‑лендинг. Каждый prompt обязан включать реальные тексты/цвета/размеры/инженерные факты из scrape и запрет на generic SaaS/glass cards. | В prompt явно требовать semantic DOM, keyboard, contrast, reduced motion и DOM‑альтернативу visual effects. |
| [MotionSites AI](https://motionsites.ai/) | Платная библиотека AI‑промптов для 3D/motion‑сайтов; полезна как структура описания сцены и последовательности, не как кодовая база. | **CONDITIONAL reference only.** | Сформулировать scroll‑story: preform → carbon layup → curing → one‑piece triangle → YOke → complete bike. | **0 runtime** от самого reference; сгенерированный код имеет неизвестные зависимости до аудита. | Не принимать сгенерированную сцену целиком. Сначала storyboard и asset list, затем ручной implementation; запрещены одновременно Three/Spline/GSAP/Motion. | Prompt обязан содержать reduced‑motion storyboard, keyboard controls и статические DOM captions. |
| [Recent](https://recent.design/) | Курируемые примеры по Web, Typography, Motion, 3D, Editorial; быстрый moodboard и проверка, выглядит ли композиция актуально. | **ADOPT как moodboard/review gate, не как источник кода.** | Перед реализацией каждого варианта выбрать 2–3 композиционных принципа: editorial scale, negative space, photo/product occlusion, крупная типографика. | **0 runtime**. | Риск — копирование чужой айдентики и постоянная смена стиля. Фиксировать только абстрактный принцип в DESIGN.md, не переносить assets/layout 1:1. | При visual review отдельно проверять readability, contrast и отсутствие смысла, переданного только движением/цветом. |
| [Skiper UI](https://skiper-ui.com/) | 100+ необычных React/shadcn‑паттернов: image reveal, scroll progress, projects showcase, expandable tabs, progressive blur; сайт указывает Next.js + Motion. Отдельные компоненты имеют дополнительные зависимости. | **CONDITIONAL — только один source pattern после dependency audit.** | Лучшие кандидаты: `Image reveal` для кадров производства или `Scroll progress` для Innovation; не использовать cursor trails и тяжёлые carousels поверх существующей физики. | Обычно React/Tailwind/Motion; пример scroll component также требует `react-use-measure`. В vanilla‑сайте паттерн воспроизвести через текущий Motion + CSS, без React migration. | Не брать компоненты с GSAP/Anime/несколькими RAF loops. Blur ограничить, scroll listener заменить `scroll()`/IntersectionObserver, offscreen pause. | Добавить настоящий progress label, `aria-current`, keyboard‑доступ к разделам; reveal не должен скрывать текст при reduced motion или JS failure. |
| [Aceternity UI](https://ui.aceternity.com/) / [utilities](https://ui.aceternity.com/components/add-utilities) | Copy/paste React/Tailwind/Motion‑эффекты: Timeline, Tracing Beam, Hero Parallax, text reveal, backgrounds. | **CONDITIONAL — заимствовать механику, не визуальный стиль целиком.** | `Timeline/Tracing Beam` хорошо соответствует этапам производства; аккуратный `Text Reveal` — для “Only fun…” и инженерных тезисов. Не использовать aurora/globe/sparkles. | Официальный setup: `motion`, `clsx`, `tailwind-merge` плюс React/Tailwind. Для SYRE переносить поведение в vanilla Motion/CSS, поэтому новые framework dependencies = 0. | Большие parallax/background effects конфликтуют с Canvas и LCP. Не более одного scroll effect, transforms/opacity, pause offscreen. | Timeline должен оставаться обычным упорядоченным списком; visible focus; reduced motion показывает конечное состояние сразу. |
| [Refero Styles](https://styles.refero.design/) / [AI-readable systems](https://styles.refero.design/design-md/ai-readable-design-systems) | AI‑читаемый `DESIGN.md`: точные colors, type, spacing, components, semantic roles, accessibility и do/don’t rules. | **ADOPT обязательно.** | Создать `SYRE_DESIGN.md`: исходные logo/fonts, milk/black surfaces, paint swatches, sizes, spacing, nav, CTA, configurator controls, photo treatment, motion rules. Это общий контракт всех агентов. | **0 runtime**; только markdown + CSS variables/tokens. | Главный выигрыш — предотвращение random styles между 5 концептами. Запретить generic glassmorphism, неон, bento‑ради‑bento, чужие brand motifs. | Включить contrast pairs, minimum font/touch sizes, focus tokens, error/success не только цветом, reduced‑motion и alt/caption rules. |
| [Componentry](https://componentry.dev/) / [docs](https://componentry.dev/docs) / [GitHub](https://github.com/harshjdhv/componentry) | React/Tailwind/Motion source components: scroll choreography, sticky cards, dithered logo, WebGL shaders, cursor effects. Код copy/paste; repo заявляет WAI‑ARIA, но некоторые компоненты требуют GSAP. | **CONDITIONAL; baseline не импортирует библиотеку.** | Единственный уместный паттерн — `Scroll Choreography` для фотографий производства или очень лёгкий dither treatment для статичного logo/poster. Не использовать WebGL Liquid/Infinite Field: они конкурируют с продуктом. | React + Tailwind + Motion; `image-trail` и `layered-stack` отдельно требуют GSAP. Такие компоненты исключить, чтобы не дублировать motion runtime и license surface. | WebGL/particle typography добавляют renderer и pointer work. Только порт идеи в существующий Canvas/Motion, с одним loop и профилированием. | Проверить самим: keyboard, labels, pause, reduced motion. Dithered logo не заменяет доступный SVG logo и текстовое имя бренда. |
| [Anime.js](https://animejs.com/) / [module imports](https://animejs.com/documentation/getting-started/module-imports/) / [WAAPI](https://animejs.com/documentation/web-animation-api/when-to-use-waapi/) | Сильный JS animation engine: timeline, stagger, SVG, draggable, scroll observer; modular imports, WAAPI‑вариант. | **REJECT для этой версии** — возможности пересекаются с выбранным Motion. | Нет отдельной зоны: Canvas‑физика остаётся native, DOM/scroll делает Motion. | Официальные docs указывают около **3 kB gzip** для WAAPI и **10 kB** для JS‑варианта в сравнении; даже небольшой вес не оправдывает второй orchestration engine. | Два animation scheduler/API усложняют cleanup, reduced motion и профилирование; запрещён транзитивный Anime.js через copied component. | Исключение второго движка упрощает единый reduced‑motion policy и pause/resume. |
| [Motion](https://motion.dev/) / [`animate()`](https://motion.dev/docs/animate) / [`scroll()`](https://motion.dev/docs/scroll) / [accessibility](https://motion.dev/docs/react-accessibility) | Hybrid WAAPI/JS engine, hardware acceleration, spring, gestures, in-view и scroll‑linked animation; mini‑версия для HTML/SVG. | **ADOPT — единственный motion runtime.** | Morphic nav, section entrances, CTA feedback, gallery transition; optional sticky Innovation storyboard. Canvas frame physics остаётся native и не переписывается в Motion. | `motion/mini` **2.3 kB**; hybrid `animate` **18 kB**; `scroll()` указан как **5.1 kB**. Начать с mini; расширять импорт только по измеренной необходимости. | Анимировать transform/opacity; `position: sticky` для pinning; cleanup всех observers/animations; offscreen/document hidden pause. Не импортировать React API в vanilla site. | Site-wide `prefers-reduced-motion`; крупные x/y/parallax заменять opacity или instant state; autoplay выключать. |
| [Kokonut UI — Morphic Navbar](https://kokonutui.com/docs/navigation/morphic-navbar) | Active link морфится в rounded pill через smooth CSS transitions; оригинал построен на React/Next Link/Tailwind. | **ADOPT паттерн, реализовать CSS‑only.** | Fixed header: `BIKES / INNOVATION / BUILD / CONTACT`; активный раздел получает компактную светлую/тёмную pill, логотип и `Order now` остаются стабильными. На mobile — раскрываемая панель, не горизонтальный overflow. | Новая runtime‑зависимость **0**; HTML nav + CSS transitions + небольшой IntersectionObserver для `aria-current`. | Не использовать layout‑thrashing “magic indicator”; перемещать indicator transform‑ом или менять фон активной ссылки. Blur/backdrop не обязателен. | `<nav aria-label>`, обычные `<a>`, `aria-current="page|location"`, видимый focus, Escape для mobile menu, target 44×44; reduced motion отключает morph. |
| [Bklit](https://bklit.com/) | Компоненты charts/data visualization: area, bar, candlestick, heatmap, line, Sankey и др. | **REJECT для публичного SYRE сайта.** | Ни hero, ни Innovation, ни конфигуратор не требуют chart runtime. Геометрию велосипеда показать доступной HTML‑таблицей и SVG‑схемой, а не dashboard chart. | Исключение означает **0 added dependency/weight**. Возможен отдельный будущий analytics/admin продукт, но не эта задача. | Chart renderer увеличил бы bundle без пользовательской ценности и сделал бы engineering section похожим на dashboard. | Существующая таблица размеров должна иметь `<caption>`, row/column headers и горизонтальный mobile scroll; SVG‑схема — с текстовым описанием. |

## Как применить матрицу к новой версии

### 1. Hero / первый экран

- Полноэкранное action‑фото или video poster из исходных материалов, но video не autoplay при reduced motion.
- Крупный SYRE wordmark и реальный тезис “Only fun, only positive emotions”.
- Один Canvas‑слой с кадрами/физикой; не накладывать второй WebGL shader.
- Явный `Build yours` и вторичный `Why it rides different`.
- Transparent header → solid header после hero; Morphic active state — CSS.

### 2. Product / Punkcake

- Крупная рама как главный объект, цвет — единственный яркий акцент.
- Negative space и editorial typography вместо карточек.
- 420 mm chainstay, 75 mm BB drop, 2.5" tire clearance и frame weight — как доказательные micro‑facts рядом с соответствующей частью рамы.
- Cursor/scroll effects не перекрывают product silhouette и текст.

### 3. Innovation

- Sticky visual + последовательность из шести реальных этапов производства.
- Motion `scroll()` используется только здесь и только после baseline без JS.
- На reduced motion — обычный вертикальный список с финальными статичными изображениями.
- Если будет настоящая оптимизированная 3D‑модель, Spline сравнивается с 2D image sequence; побеждает вариант с лучшими LCP/INP и ясностью.

### 4. Build Your Syre

- Постоянно видимая рама слева/сверху; справа — Frame/Bike, Size, Color, цена, CTA.
- Все swatches — настоящие radio controls с читаемыми названиями, selected/focus state и live text.
- Изменение цвета — мгновенный CSS/SVG/Canvas update; не требует WebGL.
- Geometry — semantic table + схема; mobile: sticky summary и горизонтально прокручиваемая таблица.

### 5. Финальный контроль

Новая итерация принимается только если:

1. выглядит именно как SYRE/carbon gravel bike, а не как template gallery;
2. все исходные product facts и purchase path сохранены;
3. нет React/Next/Tailwind миграции ради декоративного компонента;
4. в production bundle присутствует максимум один motion package — `motion`;
5. Canvas/WebGL failure оставляет полноценный сайт;
6. desktop/mobile/keyboard/touch/reduced‑motion проходят функциональный и визуальный QA;
7. Lighthouse/field‑ориентированные бюджеты не ухудшены тяжёлыми embeds.

## Итоговый выбор

- **Использовать сейчас:** Refero‑подход к `DESIGN.md`, Motion как единственный motion runtime, CSS‑версию Morphic Navbar, VibeUI prompt structures, Framer performance practices, 21st/Recent как контролируемые каталоги.
- **Использовать точечно после аудита:** один паттерн из Skiper/Aceternity/Componentry.
- **Экспериментировать только при наличии 3D‑asset и бюджета:** один Spline viewer.
- **Не включать в production:** Unicorn рядом со Spline/Canvas, Anime.js рядом с Motion, GSAP‑зависимые copied components, Bklit charts и любые случайные shader/background effects.
