# Дизайн-система книги

Выбран ровно один базовый preset: **`narrative_proposal`**. Все отклонения ниже образуют единый именованный override **`codex_a5_manuscript`**. Паттерн первой страницы: **`editorial_cover`**, переработанный под найденный манускрипт будущего.

## Геометрия `codex_a5_manuscript`

| Токен | Значение |
|---|---|
| Страница | A5 portrait, 148×210 мм, `8391×11906 DXA` |
| Поля | inside 18 мм / `1020 DXA`; outside 15 мм / `850 DXA`; top 17 мм / `964 DXA`; bottom 19 мм / `1077 DXA` |
| Зеркальные поля | включены |
| Header distance | 7 мм / `397 DXA` |
| Footer distance | 8 мм / `454 DXA` |
| Рабочая ширина | `6521 DXA` / 4.528 in |
| Основная таблица | `6521 DXA`, `tblInd=100 DXA`, fixed DXA |
| Ячейки | top/bottom 70 DXA; start/end 100 DXA |

## Типографика

| Компонент | Шрифт и кегль | Параграф |
|---|---|---|
| Тело | Palatino Linotype 10.5 pt | justified; before 0; after 4.5 pt; line 1.18 |
| Лид/канонический голос | Palatino Linotype 12 pt italic | left; after 9 pt; line 1.22 |
| Титул | Segoe UI Semibold 29 pt | centered; after 8 pt |
| Подзаголовок | Palatino Linotype 13.5 pt italic | centered; after 26 pt |
| H1 / книга | Segoe UI Semibold 24 pt | before 0; after 14 pt; page break before |
| H2 / глава | Segoe UI Semibold 16 pt | before 14 pt; after 8 pt; keep with next |
| H3 / пластина | Segoe UI Semibold 11.5 pt, tracking visually spacious | before 10 pt; after 4 pt |
| Эпиграф | Palatino Linotype 10 pt italic | left indent 0.35 in; after 10 pt |
| Малая подпись | Segoe UI 8 pt | after 3 pt; color muted |
| ИСТОК | Segoe UI Semibold 8 pt uppercase | blue `#244B78`, прямой |
| РЕЗОНАНС | Palatino Linotype 9 pt italic | copper `#B6643A` |

Все run fonts кодируются в `w:rFonts` для `ascii`, `hAnsi`, `eastAsia` и `cs`. Язык текста — `ru-RU`.

## Списки и таблицы

Списки используются редко. Реальные numbering definitions, не ручные маркеры.

- Bullet: marker at 0.181 in; text at 0.375 in; hanging 0.194 in; after 4 pt; line 1.208.
- Decimal: те же отступы; after 4 pt; line 1.208.
- Таблицы только для числового канона, SOURCE_MAP и точных сопоставлений; обычная проза не упаковывается в таблицы.
- Базовая ширина `6521 DXA`; двухколоночные схемы `1956 + 4565`; равное сравнение `3260 + 3261`; три колонки `1500 + 2510 + 2511`.

## Палитра и мебель

- Ink: `#171B22`.
- Parchment: `#F4F0E6`.
- Muted: `#6D6964`.
- Rule: `#B9B1A3`.
- ИСТОК blue: `#244B78`.
- РЕЗОНАНС copper: `#B6643A`.
- Цвета девяти книг заданы в `CANON_STYLE_BIBLE.md` и считаются именованным динамическим override заголовков/пластин.

Running header: слева название книги, справа `0→1`; 7.5 pt Segoe UI, без тяжёлой рамки, тонкая линия `#B9B1A3`. Footer: наружный номер страницы и маленький знак текущей книги. На первой странице и полноформатных открывателях колонтитулы скрыты.

## Паттерны страниц

1. **Editorial cover:** тёмное поле, центральный сигил Ноля и Оси, название, формула и дата редакции; без метаданных-таблиц.
2. **Открытие книги:** цветная полноформатная пластина внутри полей, номер/материал/знак, короткий пророческий текст.
3. **Обычная глава:** тезис, литературная форма, один визуальный аргумент или каноническая буквица; без шаблонного заключения.
4. **Пластина:** 65–80% страницы занимает схема; подписи являются частью рассуждения.
5. **Притча/письмо:** увеличенное белое поле, короткие абзацы, минимум мебели.
6. **Числовые врата:** фиксированная шестичастная геометрия, но не повторяется в 81 главе.

## Проверка preset-а

Перед финальным рендером аудит проверяет section properties, стили Normal/Heading 1–3, numbering XML, зеркальные поля, fixed DXA таблиц, `tblW/tblGrid/tcW`, колонтитулы, отсутствие прямого форматирования без named override и фактическое наличие выбранных шрифтов.
