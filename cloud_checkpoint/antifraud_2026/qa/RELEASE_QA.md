# RELEASE QA — ULTIMATE ANTI-FRAUD GUIDE 2026

**Release:** Milestone 2, срез 2026-07-21. **Canonical source:** `output/ANTIFRAUD_ULTIMATE_GUIDE_2026_RU.md`. **Scope:** defensive-only; binaries локально собраны и ignored.

## Итоговая матрица

| Проверка | Метод | Результат M2 |
|---|---|---|
| Объём | token-like word regex | PASS: 16 004 содержательных слов |
| Reader routes/goals/summaries | required-section scan + review | PASS |
| Payment lifecycle и stop taxonomy | required-section + editorial review | PASS |
| E2E normal/card-testing/ATO case | required-section + defensive review | PASS |
| Entity/event/Decision API/state model | JSON/code review, no PAN/CVV | PASS |
| Card-testing/ATO/dispute depth | required-section + runbook review | PASS |
| Crosswalk/risk/action/cost/roadmap | editorial coverage | PASS |
| Seven runbooks/profiles/tests | editorial coverage | PASS |
| Россия по фактическим ролям | claim/source/applicability review | PASS с legal re-verification caveat |
| Embedded bibliography | PDF hyperlinks + source count | PASS: 212 PDF links |
| Source URLs | concurrent actual `curl -L` open | PASS: 50 checked; automated-access exceptions recorded |
| Claim/source IDs | set coverage | PASS: every referenced S-ID exists |
| Raw Mermaid/math | artifact text scan | PASS: no raw Mermaid, no display-math delimiters |
| Diagrams | Mermaid CLI → SVG+PNG; ZIP/media inspection | PASS: 5 rendered diagrams in PDF/DOCX/EPUB |
| PDF | PyMuPDF page/geometry/text/link scan | PASS: 103 A5 pages, no empty/replacement-glyph pages |
| DOCX | CRC/XML/media/real TOC field/repeated table headers + LibreOffice independent PDF render | PASS: independently rendered, no empty/replacement-glyph pages |
| EPUB | ZIP CRC, nav titles, SVG assets | PASS |
| Visual inspection | all-page contact sheets | PASS after PDF and DOCX review |

## Defensive-scope

- [x] Граница оставлена ровно один раз во введении.
- [x] Нет purchase/testing card workflow, обхода 3DS/AVS/CVV/fingerprinting/WAF/KYC/лимитов.
- [x] Нет universal operational thresholds, stealth settings или trust-building attacker recipes.
- [x] Synthetic rule/test examples не вызывают реальную оплату и не содержат PAN/CVV.
- [x] Threat descriptions соединены с detection, containment, recovery и customer protection.

## Актуальность и неопределённость

- [x] PCI DSS v4.0.1 и действующие с 2025-03-31 requirements 6.4.3/11.6.1 отражены; SAQ A nuance не назван отменой требований.
- [x] EMV 3DS 2.3.1.1 отделён от 2.4.0 Draft 1; EMV Payment Tokenisation v2.4 датирован 2026-07-09; SRC stable/draft различены.
- [x] ASVS 5.0.0, API Security 2023, NIST 800-63-4/800-61r3, WebAuthn L2/L3 statuses указаны.
- [x] Российские обязанности не перенесены с банка на merchant; law/Bank act/scheme-contract/recommendation/enacted-not-yet-effective разделены.
- [x] Dynamic scheme/legal libraries требуют повторной проверки exact revision/applicability.

## Выполнение

```bash
python -m pip install -r cloud_checkpoint/antifraud_2026/requirements-build.txt
cd cloud_checkpoint/antifraud_2026 && npm ci --ignore-scripts
npx puppeteer browsers install chrome-headless-shell
python cloud_checkpoint/antifraud_2026/build_release.py --clean
python cloud_checkpoint/antifraud_2026/qa/check_release.py
```

System prerequisites: Chromium shared libraries and LibreOffice Writer. `mermaid-puppeteer.json` uses `--no-sandbox` only for this isolated root-run build container; production browser sandboxing must not copy this exception.

## Visual review record

`qa/check_release.py` creates ignored sheets `pdf_contact_*.png` and `docx_contact_*.png`. The reviewer checks every thumbnail and zooms suspicious pages. M2 visual pass covers every PDF page and separately every LibreOffice-rendered DOCX page: headings, Cyrillic, tables, diagrams, page edges, blank pages and replacement glyphs. Exact page counts are emitted by the release check because TOC pagination can change after field updates.

## Honest build claim

The pipeline is described as **repeatable**, not byte-for-byte reproducible: Python/Node dependencies are pinned, but PDF/DOCX/EPUB producers may embed environment-dependent metadata. `manifest.json` records source/artifact SHA-256 for a run. ZIP CRC proves structural integrity only; independent render and all-page inspection provide visual QA.
