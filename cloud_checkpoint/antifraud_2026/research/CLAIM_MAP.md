# CLAIM MAP

Дата трассировки: 2026-07-21. Статусы: **требование** — нормативное/договорное при установленной применимости; **данные** — эмпирическая публикация; **рекомендация** — синтез автора/отраслевая практика; **пример вендора** — конкретная реализация без независимого endorsement.

| Ключевое утверждение | Источник | Статус | Ограничение / интерпретация |
|---|---|---|---|
| PCI DSS 4.0.1 запрещает хранить CVV после авторизации | S01, req. 3.3.1.2 | требование | для entities в PCI scope; даже если зашифрован |
| Payment-page scripts надо управлять, авторизовать и контролировать на изменение | S01 req. 6.4.3/11.6.1; S02–S03 | требование + guidance | точная применимость зависит от architecture/SAQ |
| PCI DSS 4.0 retired 2024-12-31; future-dated 4.0.1 requirements effective 2025-03-31 | S04 | данные о статусе стандарта | снова проверить Document Library перед assessment |
| EMV 3DS поддерживает RBA и challenge | S05–S06 | протокольный факт | liability задают scheme rules/рынок, не протокол сам |
| 3DS не заменяет merchant fraud/fulfilment controls | S05–S06 + авторский анализ journey | рекомендация | first-party/fulfilment выходят за доказательство auth |
| Carding и credential stuffing — классы automated threats | S08–S10 | taxonomy/guidance | описание намеренно не операционное |
| API должен проверять object/function authorization | S11 | рекомендация OWASP | OWASP — не закон; адаптировать к threat model |
| OAuth deployments должны следовать current security BCP | S12 | стандарт/рекомендация | применимо при OAuth; profile-specific constraints возможны |
| WebAuthn применяет origin-bound public-key credentials | S14 | стандарт | UX/recovery и authenticator assurance проектируются отдельно |
| Passkeys помогают против phishing | S14–S15 | стандарт + industry guidance | не устраняют stolen session/recovery abuse |
| Identity lifecycle и recovery — часть assurance | S13 | official guidance | NIST обязателен для соответствующего US federal use, baseline для остальных |
| Tokenization уменьшает распространение PAN, но не обнуляет scope/риск | S37–S38 | guidance + рекомендация | scope подтверждает QSA/assessor |
| SCA/exemptions в EEA регулируются RTS | S24 | требование при применимости | учитывать последующие amendments, national supervision, scheme rules |
| Privacy требует purpose/minimization; automated decisions требуют отдельной оценки | S25; S31–S32 | требование при применимости | GDPR и 152-ФЗ не взаимозаменяемы |
| Для применимых субъектов РФ действуют 161-ФЗ и признаки Банка России | S27–S29 | требование | роль и процедура устанавливаются актуальной редакцией/актами |
| Правила «Мир» надо получать в актуальной редакции НСПК | S30 | договорное требование | публичный landing не заменяет participant documents |
| Vendor rules/ML/case tooling существуют как вариант реализации | S22–S23 | пример вендора | эффективность не принята без локального shadow test |
| Scheme-specific 3DS/dispute rules различаются | S18–S21, S40–S42 | договорные документы/примеры | проверять регион, продукт и дату правила |
| Один network/IP/device сигнал не доказывает fraud | авторский синтез S08, S10, S13 | рекомендация | валидировать FP и accessibility/privacy сегменты |
| Многомерные velocity и progressive friction лучше единственного IP-порога | S08–S10 + авторский синтез | рекомендация | пороги выводить из собственной baseline; не публиковать |
| Accuracy вводит в заблуждение при редком классе | математическое следствие; пример автора | рекомендация/обучение | использовать PR, calibration и expected cost |
| Labels от disputes задержаны; нужен maturity window | логика dispute lifecycle + авторская рекомендация | рекомендация | окно зависит от scheme/product/market |
| Point-in-time joins предотвращают leakage | общепринятая ML engineering practice | рекомендация | проверить event time, processing time и backfills |
| Decision policy должна учитывать цену fraud и false positive | формула автора | рекомендация | costs и counterfactual uncertainty документировать |
| Fail-open/fail-closed зависит от обратимости операции | secure design synthesis S36 | рекомендация | legal/safety prohibitions могут исключать fail-open |
| Rule lifecycle требует owner/version/expiry/rollback | S34, S36 + авторский синтез | рекомендация | emergency path всё равно получает audit/review |
| Логи не должны содержать PAN/secrets | S01 + secure logging practice | требование/рекомендация | маскирование и retention зависят от data class |
| HTTP signatures — возможный механизм целостности, не универсальная обязанность | S35 | стандарт/пример | применять только при подходящей trust/key model |
| ENISA/Europol дают threat context, не локальные fraud benchmarks | S16–S17 | данные | нельзя переносить доли без методологии |
| ФинЦЕРТ/Банк России statistics — российский retrospective context | S28–S29 | данные | период/определение не равны merchant chargeback metrics |
| SAQ A eligibility update in 2025 did not universally remove DSS requirements | S01–S03, S45 | requirement status + clarification | confirm SAQ eligibility and site protection with acquirer/assessor |
| EMV 3DS 2.3.1.1 is stable while 2.4.0 Draft 1 is not GA at cutoff | S05–S06, S46 | version/status fact | verify EMVCo library; draft not a production mandate |
| EMV Payment Tokenisation v2.4 is dated 2026-07-09 | S38, S47 | version/status fact | technical spec; implementation/scheme rules separate |
| WebAuthn L2 is Recommendation and L3 is Candidate Recommendation | S14, S49 | standards maturity fact | do not conflate W3C statuses |
| NIST SP 800-61 Rev.3 is final incident-response guidance | S50 | official guidance | binding status depends on organization/jurisdiction |
| Russian payment duties attach to statutory/factual role, not every merchant | S27–S30, S51 | requirement/applicability analysis | obtain legal role memo and current full act text |
| 7220-У begins 2026-10-01 and is not yet effective at 2026-07-21 | S51 | enacted-not-yet-effective | verify official publication and addressee before effective date |
