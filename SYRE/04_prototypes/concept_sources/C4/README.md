# SYRE website

A complete responsive landing experience for SYRE, built with a small Vite + React + TypeScript stack. The implementation is static, has no external runtime requests, and makes no unapproved client, product, availability, or performance claims.

## Start locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL. The application does not require environment variables. The brief builder is local-only: it writes to the browser clipboard and never sends or stores field content.

## Launch configuration

`src/content/siteContent.ts` is the single content source. `siteContent.contact.href` is the one external launch configuration point. It is intentionally empty until an approved contact URL exists. While empty, the page offers the local working-brief builder instead of fabricating an email address or destination.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run typecheck` | Run the strict TypeScript project checks |
| `npm test` | Run the Vitest component smoke tests once |
| `npm run build` | Typecheck, create `dist/`, and enforce gzip/raw bundle budgets |
| `npm run check:bundle` | Re-check `dist/assets` and write `evidence/bundle-report.json` |
| `npm run preview` | Serve the production bundle locally |
| `npx playwright install chromium` | Install the browser used by evidence checks |
| `npm run evidence` | Build, preview, audit, and capture all evidence viewports |

For a full clean verification:

```sh
npm ci
npx playwright install chromium
npm run lint
npm run typecheck
npm test
npm run build
npm run evidence
```

## Architecture

- `src/App.tsx` — semantic page composition, mobile navigation, FAQ, and local brief interaction.
- `src/components/ErrorBoundary.tsx` — render-failure fallback.
- `src/components/Icons.tsx` — inline, accessible visual system; no remote image dependency.
- `src/content/siteContent.ts` — centralized navigation and landing-page copy. Edit approved content here first.
- `src/styles.css` — explicit design tokens, component styles, responsive breakpoints, focus states, and reduced-motion behavior.
- `src/App.test.tsx` — component-level landmark, content, navigation, menu, FAQ, and brief coverage.
- `tests/e2e/site.spec.ts` — deterministic production-preview interaction, screenshots, accessibility, console, asset, layout-shift, and overflow checks.
- `Dockerfile` + `nginx/nginx.conf` — non-root Cloud Run static bundle on port 8080.
- `scripts/check-bundle.mjs` — enforced JavaScript, CSS, and total-asset budgets.
- `evidence/` — generated screenshots and machine-readable smoke report committed for review.

## Accessibility and responsive behavior

The page includes a keyboard-revealed skip link, labelled navigation landmarks, a single primary heading, focus-managed mobile navigation, native FAQ disclosures, labelled form fields, status announcements, descriptive SVG text, visible focus outlines, ordered content, 44px touch targets, and `prefers-reduced-motion` handling. Layouts are audited at 360 × 800, 390 × 844, 768 × 1024, 1440 × 1000, and 1920 × 1080.

The Playwright evidence check runs axe-core against each viewport, exercises navigation and interactions, fails on browser console/page/failed-request errors, verifies the skip link and mobile-menu focus behavior, measures layout shift, checks local assets, and rejects horizontal overflow.

## Container smoke

```sh
git rev-parse HEAD
docker build --build-arg SOURCE_COMMIT="$(git rev-parse HEAD)" -t syre-web:rc .
docker run --rm --name syre-web-smoke -p 8080:8080 syre-web:rc
curl --fail --silent --show-error http://127.0.0.1:8080/health
curl --fail --silent --show-error --head http://127.0.0.1:8080/
```

The image runs Nginx as the non-root `nginx` user, listens on 8080, serves `/health` with `Cache-Control: no-store`, falls back to `index.html` for client-side paths, gives hashed assets immutable one-year caching, and sends a restrictive CSP plus other safe response headers.

## Cloud Run deploy and rollback

No credentials, project IDs, region, repository, service name, or public domain are embedded. Root should replace only the shell placeholders below.

```sh
export PROJECT_ID='<approved-project-id>'
export REGION='<approved-region>'
export REPOSITORY='<approved-artifact-repository>'
export SERVICE='<approved-cloud-run-service>'
export IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/syre-web:$(git rev-parse --short=12 HEAD)"

gcloud auth configure-docker "$REGION-docker.pkg.dev"
docker build --build-arg SOURCE_COMMIT="$(git rev-parse HEAD)" -t "$IMAGE" .
docker push "$IMAGE"
gcloud run deploy "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --image "$IMAGE" --port 8080 --allow-unauthenticated --cpu 1 --memory 256Mi --min-instances 0 --max-instances 10 --concurrency 80
PUBLIC_URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')"
curl --fail --silent --show-error "$PUBLIC_URL/health"
gcloud run revisions list --service "$SERVICE" --project "$PROJECT_ID" --region "$REGION"
```

Before deployment, record the currently serving revision. Roll back without rebuilding by routing all traffic to that known-good revision:

```sh
export PREVIOUS_REVISION='<known-good-revision-from-revisions-list>'
gcloud run services update-traffic "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --to-revisions "$PREVIOUS_REVISION=100"
```

## Evidence outputs

After `npm run evidence`:

- `evidence/mobile-360x800.png`
- `evidence/mobile-390x844.png`
- `evidence/tablet-768x1024.png`
- `evidence/desktop-1440x1000.png`
- `evidence/wide-1920x1080.png`
- `evidence/smoke-report.json`
- `evidence/bundle-report.json`

Generated dependencies, build output, test reports, browser caches, logs, and environment files remain ignored by Git.
