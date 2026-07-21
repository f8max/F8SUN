# SOURCE LEDGER

**Дата проверки ссылок и статуса:** 2026-07-21. **Метод:** повторное исследование официальных сайтов и документов; пользовательский хаб не использовался. Дата проверки означает доступность/актуальность на дату среза, но не юридическое заключение. Для динамических библиотек указан landing page: перед аудитом скачайте текущую подписанную/опубликованную версию. Маркетинговые материалы помечены как vendor example.

| ID | Организация | Документ / версия или дата | Точный URL | Поддерживаемые утверждения | Статус на срез |
|---|---|---|---|---|---|
| S01 | PCI SSC | PCI DSS v4.0.1, June 2024 | https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0_1.pdf | SAD/CVV; req. 6.4.3, 11.6.1; governance, logs | действующая версия; primary standard |
| S02 | PCI SSC | E-commerce Guidance for PCI DSS Requirements 6.4.3 and 11.6.1, Jan 2025 | https://www.pcisecuritystandards.org/document_library/?document=e-commerce-guidance | payment-page scripts, authorization, integrity | active guidance |
| S03 | PCI SSC | Payment Page Security and Preventing E-Skimming guidance | https://www.pcisecuritystandards.org/document_library/?category=guidance | e-skimming controls and resource hub | active landing page |
| S04 | PCI SSC | PCI DSS v4.0.1 Resource Hub / transition FAQ | https://www.pcisecuritystandards.org/standards/pci-dss/ | 4.0 retirement; future-dated requirements transition | active landing page |
| S05 | EMVCo | EMV 3-D Secure overview and specifications | https://www.emvco.com/emv-technologies/3-d-secure/ | ecosystem, RBA, frictionless/challenge, components | current protocol hub |
| S06 | EMVCo | EMV 3DS Specifications | https://www.emvco.com/specifications/emv-3-d-secure/ | normative protocol versions and bulletins | dynamic current library |
| S07 | OWASP | Application Security Verification Standard 5.0.0 | https://owasp.org/www-project-application-security-verification-standard/ | application verification baseline | current OWASP release hub |
| S08 | OWASP | Automated Threat Handbook Web Applications v1.2 | https://owasp.org/www-project-automated-threats-to-web-applications/ | automated threat taxonomy; OAT-001 carding | active project |
| S09 | OWASP | OAT-008 Credential Stuffing | https://owasp.org/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-008_Credential_Stuffing.html | credential stuffing description/controls | active project page |
| S10 | OWASP | Credential Stuffing Prevention Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html | layered ATO defense, MFA, detection | living guidance |
| S11 | OWASP | API Security Top 10 – 2023 | https://owasp.org/API-Security/editions/2023/en/0x11-t10/ | BOLA, broken auth/function auth, business flows | current published edition |
| S12 | IETF | OAuth 2.0 Security Best Current Practice, RFC 9700, Jan 2025 | https://www.rfc-editor.org/rfc/rfc9700.html | OAuth threat mitigation, sender constraints/current BCP | active RFC/BCP |
| S13 | NIST | SP 800-63-4 Digital Identity Guidelines, July 2025 | https://doi.org/10.6028/NIST.SP.800-63-4 | identity assurance and lifecycle | final publication |
| S14 | W3C | Web Authentication Level 3, Candidate Recommendation Snapshot | https://www.w3.org/TR/webauthn-3/ | origin-bound public-key credentials | current W3C specification track |
| S15 | FIDO Alliance | Passkeys overview | https://fidoalliance.org/passkeys/ | phishing-resistant sign-in and passkey deployment context | official industry body guidance |
| S16 | ENISA | ENISA Threat Landscape 2025 | https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025 | current European threat context | official annual report |
| S17 | Europol | Internet Organised Crime Threat Assessment (IOCTA) 2025 | https://www.europol.europa.eu/publication-events/main-reports/internet-organised-crime-threat-assessment-iocta-2025 | organised cybercrime/payment fraud context | official report; contextual |
| S18 | Visa | Visa Secure with EMV 3-D Secure | https://usa.visa.com/run-your-business/small-business-tools/payment-technology/visa-secure.html | scheme implementation example | scheme material; rules prevail |
| S19 | Mastercard | Identity Check / EMV 3DS | https://www.mastercard.com/global/en/business/cybersecurity-fraud-prevention.html | scheme implementation example | scheme material; not independent evidence |
| S20 | American Express | SafeKey merchant information | https://www.americanexpress.com/us/merchant/safekey.html | AmEx 3DS implementation example | scheme material |
| S21 | JCB | J/Secure 2.0 | https://www.global.jcb/en/products/security/jsecure/ | JCB 3DS implementation example | scheme material |
| S22 | PayPal | Fraud Protection documentation | https://developer.paypal.com/studio/checkout/standard/ | vendor rules/filters implementation example | vendor example |
| S23 | Stripe | Radar documentation | https://docs.stripe.com/radar | vendor rules/ML/review implementation example | vendor example, marketing claims not used as facts |
| S24 | EUR-Lex | Delegated Regulation (EU) 2018/389, consolidated text | https://eur-lex.europa.eu/eli/reg_del/2018/389/oj | SCA and exemptions under PSD2 RTS | verify EEA applicability and consolidation |
| S25 | EUR-Lex | GDPR Regulation (EU) 2016/679 | https://eur-lex.europa.eu/eli/reg/2016/679/oj | purpose, minimisation, automated decisions, rights | in force; jurisdiction-specific |
| S27 | РФ | Федеральный закон № 161-ФЗ «О национальной платежной системе», актуальная карточка | https://pravo.gov.ru/proxy/ips/?docbody=&nd=102149279 | legal framework and unauthorized transfers | official legal portal; check current редакция |
| S28 | Банк России | Признаки осуществления перевода денежных средств без добровольного согласия клиента | https://www.cbr.ru/analytics/ib/ | current official list/context of indicators | dynamic regulator page |
| S29 | Банк России | База данных о случаях и попытках переводов без добровольного согласия клиента | https://cbr.ru/faq/information_security/ | procedures and regulator explanations | dynamic official FAQ; exact duties depend on participant |
| S30 | НСПК | Документы платёжной системы «Мир» | https://www.nspk.ru/cards-mir/tech/ | scheme rules/specification access point | dynamic/participant documents; verify current revision |
| S31 | РФ | Федеральный закон № 152-ФЗ «О персональных данных», карточка | https://pravo.gov.ru/proxy/ips/?docbody=&nd=102108261 | purposes, proportionality, security, automated decisions | official legal portal; check current редакция |
| S32 | Роскомнадзор | Портал персональных данных: документы | https://pd.rkn.gov.ru/authority/p146/ | regulator guidance/requirements access point | dynamic official portal |
| S34 | ISO/IEC | ISO/IEC 27001:2022 overview | https://www.iso.org/standard/27001 | ISMS governance context | current standard overview; full text licensed |
| S35 | IETF | HTTP Message Signatures, RFC 9421, Feb 2024 | https://www.rfc-editor.org/rfc/rfc9421.html | standardized HTTP message integrity option | active RFC; use only where threat model warrants |
| S36 | CISA | Secure by Design | https://www.cisa.gov/securebydesign | secure defaults, owner responsibility | official guidance |
| S37 | PCI SSC | Tokenization Product Security Guidelines | https://www.pcisecuritystandards.org/documents/Tokenization_Product_Security_Guidelines.pdf | tokenization concepts/scope caveats | guidance; verify document library revision |
| S38 | EMVCo | EMV Payment Tokenisation | https://www.emvco.com/emv-technologies/payment-tokenisation/ | network/payment token lifecycle concepts | current technology hub |
| S39 | Visa | Visa Account Attack Intelligence / enumeration overview | https://corporate.visa.com/en/solutions/visa-protect.html | scheme vendor implementation example for enumeration detection | vendor/scheme marketing example only |
| S40 | Mastercard | Security Rules and Procedures, current rules hub | https://www.mastercard.us/en-us/business/overview/support/rules.html | scheme rules access point; disputes/security vary by revision | dynamic official rules; obtain current PDF |
| S41 | Visa | Visa Core Rules and Product and Service Rules | https://usa.visa.com/support/consumer/visa-rules.html | current scheme rules access point | dynamic official rules; contract controls |
| S42 | American Express | Merchant Regulations | https://www.americanexpress.com/us/merchant/merchant-regulations.html | disputes and merchant obligations access point | dynamic official rules |
| S43 | UK NCSC | Mitigating malware and ransomware attacks / logging guidance collection | https://www.ncsc.gov.uk/collection/10-steps/logging-and-monitoring | logging and monitoring operational baseline | official guidance |
| S45 | PCI SSC | Important Update to SAQ A, Jan 2025 | https://www.pcisecuritystandards.org/document_library/?category=saqs | SAQ A eligibility nuance; requirements not universally removed | official clarification |
| S46 | EMVCo | EMV 3DS Protocol and Core Functions Specification v2.3.1.1 | https://www.emvco.com/specifications/emv-3-d-secure/?version=2.3.1.1 | stable published 3DS line and draft library | current library; 2.4.0 Draft 1 not GA |
| S47 | EMVCo | EMV Payment Tokenisation Specification v2.4, 09 Jul 2026 | https://www.emvco.com/specifications/emv-payment-tokenisation/ | token specification version/date | current published specification |
| S48 | EMVCo | EMV Secure Remote Commerce specifications | https://www.emvco.com/specifications/emv-secure-remote-commerce/ | SRC API v1.5/CX v1.2; draft status tracked separately | current library |
| S49 | W3C | Web Authentication Level 2, Recommendation, 08 Apr 2021 | https://www.w3.org/TR/webauthn-2/ | stable W3C Recommendation | active Recommendation |
| S50 | NIST | SP 800-61 Rev.3, Incident Response Recommendations and Considerations, Apr 2025 | https://doi.org/10.6028/NIST.SP.800-61r3 | incident-response lifecycle/governance | final publication |
| S51 | Банк России | Поиск нормативных актов | https://www.cbr.ru/na/ | official access for 7282-У, 851-П, 821-П, 7220-У | dynamic official database; verify effective date/addressee |
| S52 | PCI SSC | E-commerce security guidance hub | https://www.pcisecuritystandards.org/document_library/ | current e-commerce resources | official dynamic hub |
| S44 | FIRST | CVSS v4.0 Specification | https://www.first.org/cvss/v4.0/specification-document | vulnerability severity context (not fraud score) | current spec; included to prevent conceptual conflation |

## Как источники отбирались

1. Нормативный текст/стандарт и официальный регулятор выше пересказов.
2. OWASP/NIST/ENISA — guidance и taxonomy, не автоматически обязательные требования.
3. Visa/Mastercard/AmEx/JCB/НСПК — authoritative для собственных scheme rules, но claims о продукте не независимы.
4. PSP/anti-fraud vendor docs используются только как явно маркированные примеры реализации.
5. Статистика не переносится между рынками без denominator, периода и методики.
6. Если официальный landing page динамический или участник получает правила по договору, ledger прямо требует повторной проверки версии.
