# CONTENT GATE — FINAL reader edition

**Оцениваемый файл:** `output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_FINAL.md`  
**Рубрика:** `qa/CONTENT_GATE_LOCAL.md`  
**Дата проверки:** 2026-07-21  
**Состояние снимка:** после source-audit patch; канонический финальный исходник

## Решение

- **P0:** `NO`
- **Ручная semantic-оценка:** **94/100**
- **Категории ниже 50% веса:** нет
- **Статус:** **ULTIMATE-ELIGIBLE**

| ID | Раздел | Балл |
|---|---|---:|
| A | Новичковая понятность | 7/8 |
| B | Платёжные и fraud-основы | 8/8 |
| C | Threat model и control crosswalk | 7/8 |
| D | Actions, states и экономика | 10/10 |
| E | Данные, события и архитектура | 12/12 |
| F | Rules, velocity и card-testing controls | 8/8 |
| G | ML, labels и graph | 8/10 |
| H | Метрики, эксперименты и экономика | 7/8 |
| I | Operations, review и incident response | 10/10 |
| J | Payment/account security, fulfilment, disputes | 6/6 |
| K | РФ: право, privacy и применимость | 6/6 |
| L | Источники, кейсы и самодостаточность | 5/6 |
|  | **Итого** | **94/100** |

## Воспроизводимые счётчики

Проверка выполнялась над UTF-8 Markdown: главы и разделы считались anchored-regex по заголовкам, кейсы — по маркировке `[СИНТЕТИЧЕСКИЙ КЕЙС]`, runbooks — в пределах главы 18, ссылки — как множество ключей `[Sxx]` против строк встроенной библиографии. Кодовые fences проверялись на чётность; отдельно искались `MERGE PENDING`, raw LaTeX, буквальные `\n`, ошибочные строки с `+` и заголовки/остатки после заключения.

| Проверка | Результат |
|---|---:|
| Unicode-слова | 19 563 по release-gate; 20 010 по расширенному editorial-regex |
| Нумерованные главы | 29; непрерывно 1–29 |
| End-to-end cases | 3 |
| Defensive runbooks | 7 |
| Обязательные поля runbook | 9 из 9 в каждом; 63 из 63 |
| Уникальные citation keys | 54 |
| Строки встроенной библиографии | 54 |
| Неразрешённые/неиспользованные ключи | 0 / 0 |
| Mermaid-блоки | 5 |
| Fenced-code markers | 16; сбалансированы |
| Defensive boundary | 1 |
| `MERGE PENDING` / raw LaTeX / literal `\n` / leading `+` | 0 / 0 / 0 / 0 |

Три кейса: card testing, ATO/recovery и refund/payout marketplace. Семь runbooks: card testing; ATO/recovery; e-skimming; refund/payout anomaly; PSP/issuer outage; false-positive spike; stale features/model/data drift. Для каждого подтверждены поля `trigger`, `false alarms`, `owner/RACI`, `triage`, `reversible containment`, `customer fallback`, `evidence`, `recovery/expiry`, `postmortem`.

## P0-проверка

Не обнаружены воспроизводимые атакующие инструкции, универсальные обходные пороги, рекомендации хранить CVV/SAD, смешение issuer outcome с merchant decision или немаркированные «реальные» кейсы. Payment/order states, idempotency, recovery/appeal, роль организации и defensive framing присутствуют. Рукопись содержит ровно одну явную границу материала.

## Неблокирующие gaps

1. Не каждая техническая глава оформляет материал явной тройкой «объяснение → пример → типичная ошибка».
2. Threat-control crosswalk не имеет отдельной колонки `failure mode`, хотя альтернативные гипотезы и отказные режимы разобраны рядом.
3. Часть ML minimum evidence дана прозой, а не отдельными label/evaluation tables и drift decision tree.
4. Не у каждой библиографической записи указаны точный раздел/страница и индивидуальная дата доступа; live HTTP link-check этим снимком не выполнялся.

## Контроль целостности финального исходника

**SHA-256 рукописи после source-audit patch и финальной правки обложки:**  
`470AC149E42AB48ABABD2CD1E36DD5D8F3208CC91F23E50B43897CAE9DF21432`

Source patch заменил неточные динамические ссылки на точные первичные публикации, разделил российские акты по ролям и синхронизировал 54/54 ключа между рукописью, встроенной библиографией и `SOURCE_LEDGER.md`. Повторный release-gate подтвердил структуру, объём, P0 и отсутствие неизвестных или потерянных ключей; semantic score не повышался без повторной полной ручной переоценки рубрики.
