# RELEASE QA — ULTIMATE ANTI-FRAUD GUIDE 2026

**Release:** Milestone 1, срез 2026-07-21.  
**Canonical source:** `output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU.md`.  
**Scope:** defensive-only; binaries локально собраны, но исключены из Git.

## 1. Полнота структуры

| Требование | Где покрыто | Итог |
|---|---|---|
| Деньги, риск, носитель убытка | §1, формула expected cost | PASS |
| Полная таксономия | §2 | PASS |
| End-to-end fraud journey | §3, Mermaid + stage table | PASS |
| Все семейства сигналов, limits/privacy/FP | §4 | PASS |
| Real-time architecture | §5, 2 Mermaid схемы | PASS |
| Allow/challenge/review/limit/hold/decline | §6, decision matrix | PASS |
| ML: labels→graph ML | §8 | PASS |
| Rules/velocity lifecycle | §7 | PASS |
| 3DS/token/CVV/AVS/passkeys/APIs/PCI | §9 | PASS |
| Bot/card-testing defense без bypass detail | §10 | PASS |
| Метрики/экономика/dashboard | §11 | PASS |
| Operations/governance/IR/privacy | §12–13 | PASS |
| Три стека/build-vs-buy | §14 | PASS |
| Cases/anti-patterns | §15 | PASS |
| Standards vs practice vs recommendation | вводная легенда, §16, inline tags | PASS |
| 7-day + 30/60/90/180 + audit/playbook/RFP | §17 | PASS |
| Glossary + FAQ | §18–19 | PASS |
| РФ: 161-ФЗ/ЦБ/НСПК/152-ФЗ | §12.4, §16, ledger S27–S33 | PASS с оговоркой применимости |

## 2. Defensive-scope review

- [x] Граница сформулирована один раз во введении.
- [x] Нет инструкций по приобретению/проверке карт или carding workflow.
- [x] Нет способов обхода 3DS, AVS/CVV, fingerprint, WAF, KYC, антибота, лимитов.
- [x] Нет operational thresholds, stealth settings или attacker trust recipes.
- [x] Attack stages сразу связаны с signals/controls.
- [x] Rule examples синтетические, пороги выводятся из private baseline.
- [x] Purple-team ограничен синтетикой и изолированной средой.

## 3. Источники и claims

- [x] Ledger содержит организацию, документ, URL, версию/дату, дату проверки и поддерживаемые claims.
- [x] Primary/official sources приоритетны.
- [x] Vendor/scheme product pages явно помечены как examples/marketing; claims эффективности не приняты.
- [x] Dynamic documents требуют повторной проверки revision/applicability.
- [x] PCI DSS 4.0.1 и e-commerce guidance включены.
- [x] EMVCo, OWASP ASVS/API/Automated Threats, NIST, ENISA, Europol, IETF/W3C/FIDO включены.
- [x] Visa, Mastercard, AmEx, JCB, PayPal и PSP vendor example включены.
- [x] РФ primary sources включены; юридические формулировки не выданы за индивидуальное заключение.
- [x] Long quotations отсутствуют; текст — самостоятельный синтез.

**Ограничение:** несколько official landing pages динамические, а часть scheme/НСПК rules доступна участникам по договору. Поэтому книга не утверждает универсальный liability shift или точную договорную обязанность без проверки актуального rulebook.

## 4. Терминология и противоречия

- [x] CNP, ATO, RBA, SCA, PAN, PSP объяснены при первом существенном употреблении либо в glossary.
- [x] Fraud, abuse, AML и operational error не смешаны.
- [x] Authorization не назван доказательством good order.
- [x] Authentication, fraud decision и fulfilment decision разделены.
- [x] PCI, privacy law и payment-fraud rules разделены.
- [x] Missing не трактуется как false/mismatch.
- [x] Chargeback metrics требуют scheme-specific denominator/maturity.
- [x] «3DS = гарантированный liability shift» нигде не утверждается.

## 5. Build и визуальный контроль

Выполняемые проверки:

```bash
python -m pip install -r cloud_checkpoint/antifraud_2026/requirements-build.txt
python cloud_checkpoint/antifraud_2026/build_release.py --clean
python cloud_checkpoint/antifraud_2026/qa/check_release.py
```

`check_release.py` проверяет обязательные разделы, ссылки, defensive forbidden-pattern scan, PDF metadata/pages, DOCX/EPUB ZIP CRC и создаёт контактные листы всех PDF-страниц в ignored `qa/rendered/`. Контактные листы должны быть просмотрены человеком/агентом на обрезку, пустые страницы, нечитаемые таблицы и сбои кириллицы.

## 6. Известные ограничения Milestone 1

1. Mermaid остаётся кодовым блоком в статических форматах: схема читаема как source, но не рендерится в SVG, чтобы сборка не зависела от Node/browser.
2. DOCX parser воспроизводимо переносит headings, lists, tables и code, но сложные inline Markdown constructs упрощаются.
3. Юридическая применимость зависит от роли, договора, юрисдикции и изменений после даты среза.
4. Формулы expected cost обучающие; реальные costs требуют finance/risk validation и sensitivity analysis.
