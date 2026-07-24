# F8SUN

F8SUN is currently a multi-product editorial workspace. The default branch is
the canonical source only for the public meditation, yoga, and tea archive.
The other products remain isolated in their own branches and draft pull
requests until they are reviewed and deliberately promoted.

## Product map

| Product | Canonical or working branch | Current status |
| --- | --- | --- |
| Meditation, yoga, and tea archive | `main` | Published source on the default branch: `МЕДИТАЦИЯ_ЙОГА_и_ЧАЙ_MAXIMUS.md`. |
| Bible 2.0 | `codex-cloud-bible-full-20260720` and `codex-cloud-bible-2-0-20260720` | Editorial work is isolated from `main`; draft PR #2 targets `codex-cloud-bible-full-20260720`. |
| G-Guide | `codex-cloud-g-guide-full-20260720` | Editorial work is isolated from `main`; draft PR #1 targets this product branch. |
| Anti-Fraud Guide 2026 | `codex/create-ultimate-anti-fraud-guide-2026` and `codex/create-ultimate-anti-fraud-guide-2026-rfbaxs` | Two draft alternatives, PR #3 and PR #4, target `main`; neither is a release until reviewed and merged. |

This table describes repository topology, not a release guarantee. Before
using a product, verify its pull-request status, QA evidence, provenance, and
licensing.

## Repository status

- Governance is enforced through `scripts/validate_repository.py`.
- Raw third-party chat exports and personal data are prohibited by
  [DATA_POLICY.md](DATA_POLICY.md).
- Contributions must follow [CONTRIBUTING.md](CONTRIBUTING.md).
- Security reports must follow [SECURITY.md](SECURITY.md).
- No repository-wide open-source license has been selected. Do not assume
  permission to reuse content beyond applicable law or explicit permission.

## Local validation

```bash
python scripts/validate_repository.py
```

The same command runs in GitHub Actions for pushes and pull requests.
