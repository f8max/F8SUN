# SYRE V2 — Best Placeholder

**SYRE rebranding placeholder page — static HTML/CSS/vanilla JavaScript.**

## What This Is

A single-page interactive placeholder for the SYRE bicycle brand rebranding (2026). Displays a dark field with drifting bicycle frame silhouettes that respond to cursor movement. The SYRE logo is partially occluded by frames — move your cursor to reveal glimpses of the wordmark.

## How to Launch (Local Static)

No build step, no package manager, no server required.

### Option A: Open directly
```bash
open index.html
```
or double-click `index.html` in your file manager.

### Option B: Local HTTP server (recommended for full API support)
```bash
python3 -m http.server 8080 --bind 127.0.0.1
# Then open http://127.0.0.1:8080
```

### Option C: Any static file server
```bash
npx serve .
# or
php -S 127.0.0.1:8080
```

## Requirements
- A modern browser (Chrome, Firefox, Safari, Edge — any version from 2020+)
- All assets served from the local `assets/` directory
- No internet connection required

## Interaction Controls

| Action | Result |
|---|---|
| Move cursor / touch | Frames drift (C5 Brownian motion + nudge) |
| Space key | Toggle freeze/resume |
| Double-click / double-tap | Toggle freeze/resume |
| Hold S for 0.8 seconds | Corridor reveal (frames pushed from logo center) |
| Release S | Corridor closes, frames drift back |

## No-JavaScript Fallback

If JavaScript is disabled or unavailable, a static poster renders:
- Full SYRE logo
- One curated frame image
- Headline and rebranding message
- Non-functional email input (placeholder only)

## Reduced Motion

If your system preference is `prefers-reduced-motion: reduce`, frame animation is paused and canvas dims to 25% opacity. Press Space to toggle frame visibility.

## Privacy

- The email input saves to `localStorage` on your device only
- Nothing is sent to any server
- No analytics, tracking, or external requests
- All 16 assets (14 frames + 2 logos) are self-hosted

## File Structure

```
syre-v2-best/
  index.html          — Main HTML document (semantic, accessible)
  styles.css          — All visual styles (responsive, reduced-motion)
  app.js              — C5 Drift physics engine (vanilla JS)
  assets/
    frame-01.png ... frame-14.png  — 14 bicycle frame images
    syre-logo-white.svg            — SYRE white logo SVG
    syre-logo-dark.svg             — SYRE dark logo SVG
  SYRE_DESIGN.md                   — Design tokens, motion spec, do/don't
  README.md                        — This file
  IMPLEMENTATION_REPORT.md         — Implementation evidence and decisions
  IMPLEMENTATION_RECEIPT.json      — Structured receipt with hashes
  QA_SOURCE_ASSERTIONS.json        — Source assertion checks
  SHA256SUMS.txt                   — SHA-256 hashes of all committed files
```

## Implementation

- **Mechanics:** C5 Drift only (Brownian motion + cursor nudge, edge wrap lifecycle)
- **Background:** #050505 carbon black
- **Accent:** #2d8a7a teal-mint (single verified color)
- **Logo:** Right-side giant wordmark at opacity 0.22
- **Frame density:** 10 desktop / 6 mobile
- **Physics:** Single requestAnimationFrame loop, DPR capped at 2
- **Zero external dependencies** — no CDN, no frameworks, no runtime URLs

## Browser Support

- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Mobile Safari, Chrome for Android
- Reduced motion: all browsers that support `prefers-reduced-motion`
- No-JS: all browsers (pure HTML/CSS fallback)

## License

Proprietary — SYRE brand placeholder. All frame images and logos are SYRE intellectual property.
