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
| Authentication, authenticator lifecycle и recovery входят в assurance profile | S13 (NIST SP 800-63B-4) | official guidance | нормативная область NIST ограничена заявленным federal scope; для остальных это baseline, если не включён в договор/policy |
| Tokenization уменьшает распространение PAN, но не обнуляет scope/риск | S37–S38 | guidance + рекомендация | scope подтверждает QSA/assessor |
| SCA/exemptions в EEA регулируются RTS | S24 | требование при применимости | учитывать последующие amendments, national supervision, scheme rules |
| Privacy требует purpose/minimization; automated decisions требуют отдельной оценки | S25; S31–S32 | требование при применимости | GDPR и 152-ФЗ не взаимозаменяемы |
| Для применимых операторов по переводу действуют 161-ФЗ и признаки ОД-2506 | S27–S29 | требование | ОД-2506 действует с 01.01.2026, подпункт 1.2 — с 01.03.2026; merchant не становится адресатом нормы автоматически |
| Правила и Программу безопасности «Мир» надо получать в актуальной редакции НСПК | S30, S54 | договорное/схемное требование | Правила 4.3 датированы 03.12.2025, Программа безопасности — 12.03.2026; применимость идёт через роль и договор с эквайером |
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
| ENISA 2025 и Europol IOCTA 2026 дают threat context, не локальные fraud benchmarks | S16–S17 | данные | нельзя переносить доли без denominator, периода и методологии |
| ОД-2506 и официальные разъяснения Банка России задают признаки/процедуры, а не merchant chargeback benchmark | S28–S29 | требование + regulator guidance | применимость зависит от роли; собственные fraud thresholds выводятся из локальных данных |
| SAQ A update 2025 did not universally remove PCI DSS requirements | S01–S03, S52 | requirement status + guidance | eligibility и site protection подтверждаются по архитектуре и у compliance-accepting entity |
| SAQ A ASV scans распространяются на merchant e-commerce webpages при redirect и embedded iframe | S45 | official clarification | речь о требованиях 11.3.2/11.3.2.1; PCI scan выполняет Approved Scanning Vendor |
| EMV 3DS 2.3.1.1 is stable while 2.4.0 Draft 1 is not GA at cutoff | S05–S06, S46 | version/status fact | verify EMVCo library; draft not a production mandate |
| EMV Payment Tokenisation v2.4 is dated 2026-07-09 | S38, S47 | version/status fact | technical spec; implementation/scheme rules separate |
| WebAuthn L2 is Recommendation and L3 is Candidate Recommendation | S14, S49 | standards maturity fact | do not conflate W3C statuses |
| NIST SP 800-61 Rev.3 is final incident-response guidance | S50 | official guidance | binding status depends on organization/jurisdiction |
| Требования 821-П относятся к прямо названным субъектам НПС, а не к любому merchant или хостеру | S26–S27 | requirement/applicability analysis | роль из пункта 1.1, совмещение функций и договорная цепочка устанавливаются по фактам |
| 7282-У действует с 02.05.2026 и заменило 6828-У для охваченного информационного обмена | S51 | requirement/status fact | применять только к прямо названным адресатам и соответствующим процедурам |
| 851-П устанавливает требования ИБ для кредитных организаций и филиалов иностранных банков в заявленной области | S53 | requirement/applicability analysis | не распространять автоматически на merchant, gateway или иного подрядчика |
| Russian payment duties attach to statutory/factual role, not every merchant | S26–S30, S51, S53 | requirement/applicability analysis | требуется role memo и current full act text; закон, акт регулятора и scheme rule не взаимозаменяемы |
| 7220-У вступает в силу 01.10.2026 и ещё не действует на 2026-07-21 | S33 | enacted-not-yet-effective | учитывать в transition plan, но не в current attestation |
