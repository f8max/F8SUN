# Contributing

## Scope

Keep each change focused on one product or one governance concern. Do not mix
unrelated editorial products in a single pull request.

Before contributing:

1. Read [DATA_POLICY.md](DATA_POLICY.md).
2. Start from the intended product branch, not automatically from `main`.
3. Confirm that the material may legally and ethically be stored and shared.
4. Remove credentials, personal data, and private source material.

## Required checks

Run:

```bash
python scripts/validate_repository.py
```

The validator checks governance files, repository size limits, JSON syntax,
common secret patterns, and prohibited raw chat-export filenames. It reports
only a rule name and file path when a possible secret is found; it never
prints the detected value.

## Pull requests

- Explain what changed, why, and which product branch is affected.
- Identify source provenance and usage rights.
- Document the checks performed.
- Use a draft pull request while content or QA is incomplete.
- Do not merge competing product variants until a canonical version is
  explicitly selected.
- Do not bypass failed governance checks.
