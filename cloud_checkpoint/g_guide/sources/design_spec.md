# G-Guide «Символы» — reader-first design specification

## Основа

- Единственный базовый preset: `narrative_proposal`.
- Обложка: `editorial_cover`.
- Жанр: визуальная научно-популярная книга / полевой атлас, а не техническая документация.
- Страница: US Letter, portrait; поля 1 in; header/footer 0.492 in; рабочая ширина 6.5 in / 9360 DXA.

## Типографика preset

- Body: Calibri 11 pt, justified, 0 pt before, 8 pt after, 1.333 line spacing (`w:line=320`, auto).
- H1: 16 pt, `#2E74B5`, 18 pt before, 10 pt after.
- H2: 13 pt, `#2E74B5`, 12 pt before, 6 pt after.
- H3: 12 pt, `#1F4D78`, 8 pt before, 4 pt after.
- Lists: marker at 0.181 in, text at 0.375 in, hanging 0.194 in, 4 pt after, 1.208 line spacing.
- Tables: 9360 DXA, indent 120 DXA, margins 80/80/120/120 DXA, header fill `#F4F6F9`.
- Table citation text: 4 pt before and after.

## Named editorial overrides

- Display/cover/chapter font: Georgia (Cyrillic-capable); body remains Calibri.
- Cover title: Georgia 32 pt bold, `#233041`, centered.
- Cover kicker: Calibri 10 pt bold caps, `#B4822A`, centered.
- Cover subtitle: Georgia 15 pt italic, `#46636A`, centered.
- Chapter opener: Georgia 24 pt bold, `#233041`, 4 pt after; short lead 13 pt, `#46636A`.
- Pull quote / key thought: Georgia 14 pt italic, `#233041`, left rule `#B4822A`.
- Atlas card title: Georgia 16 pt bold; card body Calibri 10.5 pt, 1.2 spacing.
- Captions: Calibri 9 pt, `#65717A`, 3 pt before, 8 pt after.
- Running header: Calibri 8.5 pt, `#65717A`, quiet rule `#D8D2C6`.
- Footer: Calibri 8.5 pt, `#65717A`, page number outside.

## Палитра

- Ink / night: `#233041`.
- Deep teal: `#2F6F6D`.
- Sky: `#6F9FA8`.
- Ochre / gold: `#B4822A`.
- Terracotta: `#A74F3D`.
- Warm sand: `#F3ECDD`.
- Pale blue: `#EAF1F3`.
- Pale green: `#E8F0EC`.
- Warm gray: `#65717A`.
- Warning: `#9B1C1C` on `#FDECEC`.

## Читательские компоненты

- «В двух словах»: одно предложение до 28 слов.
- «Как устроен знак»: рисунок + 3–5 наблюдений о форме.
- «Две стороны»: пара смыслов/напряжение, не бинарное “правильно/неправильно”.
- «Где встречается»: 3–6 культурных/визуальных контекстов.
- «История из корпуса»: короткий живой пример, источник — ненавязчивая сноска.
- «Не путайте»: история/этимология/авторская ассоциация разведены простым языком.
- «Попробуйте увидеть»: безопасное наблюдательное упражнение, без мистических обещаний.
- «Карта связей»: маленькая диаграмма, только если она быстрее объясняет идею, чем абзац.

## Запреты основного текста

- `claim_id`, `source_id`, slug, JSON, schema, predicate, taxonomy pipeline.
- описание bucket, хешей, парсеров, QA и редакционного workflow.
- таблицы, в которых читателю предлагают понять устройство внутренней базы данных.
- стены текста длиннее ~350 слов без визуальной опоры или подзаголовка.
- утверждение «символ означает X» без контекста и вариативности.
- поэтическая игра слов, выданная за историческую этимологию.

## Визуальный ритм

- Не менее одного смыслового визуала на 2–3 страницы.
- Каждый новый раздел открывается большим образом/схемой и коротким человеческим вопросом.
- Большие таблицы заменяются карточками или двумя сопоставленными колонками.
- Фигуры только inline; подпись сразу под ними; alt text обязателен.
- Источники и доказательность остаются в сносках и приложении, не мешая чтению.

## Проверка «для людей»

Каждый разворот проходит пять вопросов:

1. Поймёт ли его человек без подготовки?
2. Есть ли конкретный образ, а не только абстракции?
3. Можно ли пересказать главную мысль одной фразой?
4. Видно ли, где факт, а где авторское чтение?
5. Нет ли на странице служебной информации, нужной только редактору или программе?
