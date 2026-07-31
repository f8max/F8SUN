# Аудит исходной папки и логика отбора

## Охват

Проанализированы все 283 физических файла в `C:\FATE\WORK\SYRE`, содержимое ZIP/TAR/TAR.GZ,
исходники C1-C5, V2, текущий сайт, исследования, evidence, screenshots, manifests, AI-каталог
и точные SHA-256 дубли.

| Метрика | Результат |
|---|---:|
| Файлов | 283 |
| Папок | 69 |
| Общий объём | 385,698,478 B / 367.83 MiB |
| Групп точных SHA-256 дублей | 53 |
| Лишних физических копий в этих группах | 92 |
| Объём точных физических дублей | 20.12 MiB |
| Десять крупных вложенных архивов | 281.04 MiB |

Exact-hash не отражает всю семантическую избыточность: полный 163.64 MiB ZIP повторяет
текущую папку, `source-archives.tar.gz` повторяет пять отдельных C1-C5 архивов, а архивы
соседствуют с извлечёнными сборками, screenshots и evidence.

## Что вошло

| Блок | Зачем |
|---|---|
| Brief + research | Бренд, UX, motion, IA и production acceptance criteria |
| AI color catalog | Единственный редактируемый и приоритетный источник палитры |
| V2 clean assets | 14 проверенных рам + 2 логотипа без лишних отметок |
| V2 motion source | Рабочая Brownian/cursor механика для dark scene |
| Legacy content export | RU/EN copy, геометрия, спецификация и provenance |
| Legacy selected imagery | Фото, логотипы и 15 исторических configurator renders |
| C1 source | Основной editorial/marketing baseline |
| C3 source | Многошаговый Ride Replay / reducer |
| C4 source | Editable/reorder brief, copy/download |
| Concept visual overview | Быстрое сравнение C1-C5 без установки dependencies |

## Что сознательно исключено

- `SYRE_COMPLETE_USER_PACKAGE_20260729.zip`: повтор существующих файлов.
- `Development/**`, `Evidence/**`, старые manifests и logs: QA provenance без пользы для новой ветки.
- `Website-Concepts-C1-C5/source-archives.tar.gz` и отдельные C1-C5 `.tar.gz`: исходники извлечены lean-whitelist.
- `Rama`, `Prototypes-Clean/shared/assets`, `SYRE_CLEAN_FRAMES.zip`: byte-identical копии тех же 14 рам.
- `Rama/CLEANED_2X`: отдельный производный набор, не входящий в подтверждённые V2 hashes.
- C2/C5 source: интересные эксперименты, но слабее для production IA; отражены в visual overview.
- Старые `node_modules`, build evidence, server logs, stalled runs, receipts и controller output.
- Raw original brief: дублирует транскрипт и содержит внутреннюю ссылку на переписку.
- Legacy JS/CSS/fonts/WordPress runtime: стек устарел и не должен стать новым baseline.

## Fresh code QA

Все пять source-концептов были заново проверены на Node 24/npm 12:

| Concept | lint | typecheck | unit tests | build |
|---|---:|---:|---:|---:|
| C1 | PASS | PASS | 8/8 | PASS |
| C2 | PASS | PASS | 13/13 | PASS |
| C3 | PASS | PASS | 33/33 | PASS |
| C4 | PASS | PASS | 9/9 | PASS |
| C5 | PASS | PASS | 14/14 | PASS |

В pack включены lean source C1/C3/C4. Они используют React 19.1.1, TypeScript 5.9,
Vite 7, Vitest 3, ESLint 9 и Playwright/axe.
