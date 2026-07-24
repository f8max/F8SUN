# Data policy

## Prohibited content

This repository must not contain:

- raw exports of third-party Telegram, WhatsApp, Signal, Discord, email, or
  other private conversations;
- message archives that preserve names, usernames, phone numbers, email
  addresses, account identifiers, reply graphs, reactions, precise locations,
  or other personal data;
- credentials, access tokens, API keys, private keys, session cookies, or
  authentication codes;
- material obtained without a documented lawful basis or permission to
  publish.

Renaming, compressing, encrypting, or placing prohibited data on a non-default
branch does not make it acceptable.

## Acceptable forms

Data may be included only when it is necessary for the repository's declared
purpose and one of the following is true:

- it is synthetic;
- it is owned by the contributor and explicitly intended for publication;
- it is irreversibly anonymized and aggregated so individuals cannot
  reasonably be reidentified;
- publication permission and provenance are documented.

Use the smallest useful dataset. Prefer counts, summaries, schemas, and
synthetic fixtures over message-level records.

## Pre-commit checklist

Before adding data:

1. Record its source, owner, purpose, and usage rights.
2. Classify its sensitivity.
3. Remove direct and indirect identifiers.
4. Confirm that the filename is not a raw messenger-export filename.
5. Run `python scripts/validate_repository.py`.
6. Request owner review for any ambiguous case.

If personal data or a secret is discovered after publication, stop further
distribution, make the repository private if necessary, rotate affected
credentials, preserve an access-controlled incident record, and clean the
Git history using an approved remediation plan.
