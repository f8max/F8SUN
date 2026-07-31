# Рекомендованная сборка нового сайта

## Ранжирование

| Объект | Роль | Решение |
|---|---|---|
| C1 | Editorial marketing + 3-step frame brief | **Основной baseline** |
| C3 | 5-stage Ride Replay, reducer/state-machine | Вынести feature slice |
| C4 | Editable/reorder brief, copy/download export | Вынести lead/configurator module |
| C5 | Intent router/history/reading room | Optional pattern, не IA |
| C2 | Keyboard constellation | Experimental reference |
| V2 | Brownian frame motion + clean assets | Motion reference, не готовая страница |

## Почему C1

C1 лучше остальных переводит инженерную тему в полный marketing flow: hero, engineering,
layup, finish, brief и FAQ. Есть централизованный content layer, responsive/a11y,
unit/e2e tests, Docker/Nginx. Перед production нужно заменить абстрактный line-art реальными
фото/видео, добавить RU, backend/CMS/order/legal/404 и исправить неподтверждённый copy.

## Что брать из C3

- многошаговую state-machine;
- reducer и тестируемые переходы;
- timeline/replay;
- receipt/summary подход.

C3 — feature, а не весь сайт.

## Что брать из C4

- editable cards;
- reorder;
- copy/download brief;
- clipboard fallback;
- локальную preview геометрии.

Брендинг `ATELIER` удалить; palette и copy заменить source-of-truth.

## V2 defects перед переносом

- mobile/desktop overlays в email/labels;
- загрузка всех 14 PNG сразу (~16.2 MB);
- duplicate HTML `id`;
- all-images-fail fallback не запускает loop;
- disclosure про хранение противоречит `localStorage`;
- missing skip-link target;
- нет production form integration.

Брать physics/assets, затем собрать сцену заново в основном стеке.

## Предлагаемая архитектура

1. C1 как shell/design system.
2. Реальный content model с RU/EN.
3. Dark `/build` с V2 motion intro.
4. C3 state-machine для выбора этапов.
5. C4 brief/export как final summary.
6. Backend adapter для лидов/заказов без ложного success state.
7. CMS/media pipeline для workshop, builds и journal.
