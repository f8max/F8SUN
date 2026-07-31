# SYRE V2 — Design Tokens & Specification

**Version:** V2 Best Placeholder, Run95 Storyboard
**Status:** SYRE_V2_WEB_STORYBOARD_READY_FOR_IMPL (implemented)
**Date:** 2026-07-29
**Based on:** Run85 C5 Drift reference, conductor handoff Section 8

---

## 1. COLOR TOKENS

| Token | Value | Usage |
|---|---|---|
| `--syre-bg` | `#050505` | Full viewport background (carbon/ink black) |
| `--syre-accent` | `#2d8a7a` | Single verified accent (teal-mint from frame-14 palette) |
| `--syre-text-primary` | `#ccc` | Headlines, primary copy |
| `--syre-text-secondary` | `#555` | Technical labels, secondary copy |
| `--syre-text-hint` | `#666` | Interaction hints |
| `--syre-toast-bg` | `rgba(255,255,255,0.10)` | Toast background |
| `--syre-toast-text` | `#888` | Toast text |
| `--syre-input-bg` | `rgba(255,255,255,0.06)` | Email input background |
| `--syre-input-border` | `rgba(255,255,255,0.12)` | Email input border |
| `--syre-logo-opacity` | `0.22` | Logo watermark opacity |

---

## 2. TYPOGRAPHY TOKENS

| Token | Stack | Usage |
|---|---|---|
| Display | `'Arial Narrow', 'Helvetica Neue Condensed', system-ui` | Headline (Zone A) |
| Text | `system-ui, -apple-system, 'Segoe UI', Roboto` | Body, hint, toast, inputs |
| Technical | `'Courier New', 'Liberation Mono', monospace` | Zone B tech labels |

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Headline (desktop) | `clamp(24px, 1.8vw, 32px)` | 700 | 0.02em |
| Headline (mobile) | `clamp(18px, 4.5vw, 24px)` | 700 | 0.02em |
| Tech labels (desktop) | `11px` | 400 | 0.12em |
| Tech labels (mobile) | `10px` | 400 | 0.08em |
| Hint | `12px` desktop / `10px` mobile | 400 | 0 |
| Toast | `12px` desktop / `10px` mobile | 400 | 0 |
| Email input | `13px` desktop / `11px` mobile | 400 | 0 |

---

## 3. SPATIAL LAYOUT TOKENS

### Desktop (1440x900 reference)

| Element | Position | Dimensions | z-index |
|---|---|---|---|
| Background | `0, 0` | `1440x900, fill #050505` | 0 |
| Logo | `top:50%; left:55%; translate(-55%,-50%)` | `min(82vw, 1000px)` | 1 |
| Canvas | `0, 0` | `100% x 100%` | 2 |
| Zone A (headline) | `top:64px; left:64px` | `max-width 480px` | 3 |
| Zone B (labels) | `bottom:80px; left:64px` | auto | 3 |
| Zone C (hint) | `bottom:24px; center-x` | auto | 3 |
| Email/CTA | `bottom:100px; left:64px` | `200px input + button` | 3 |
| Learn more | `bottom:120px; left:64px` | auto | 3 |
| Corridor | `center-x` | `250px wide, full height` | 5 |
| Toast | `bottom:3.5rem; center-x` | auto | 10 |

### Mobile (390x844 reference)

| Element | Position | Dimensions | z-index |
|---|---|---|---|
| Logo | `50%, 50%; translate(-50%,-50%)` | `82vw` | 1 |
| Zone A | `top:32px; center-x` | `max-width 320px` | 3 |
| Zone B | `bottom:100px; center-x` | auto | 3 |
| Zone C | `bottom:16px; center-x` | `max-width 280px` | 3 |
| Email/CTA | `bottom:84px; center-x` | `140px input` | 3 |
| Corridor | `center-x` | `180px wide` | 5 |

### Negative Space Targets

- Desktop: 35-50% viewport area (achieved via right-side logo + frame distribution)
- Mobile: 20-30% viewport area

---

## 4. MOTION & PHYSICS TOKENS (C5 DRIFT)

### Physics Model

| Property | Value | Source |
|---|---|---|
| Physics model | Brownian motion + cursor nudge | C5 Drift |
| Frame count (desktop) | 10 | V2 target |
| Frame count (mobile) | 6 | V2 target |
| Frame lifecycle | Persistent (edge wrap) | C5 Drift |
| Cursor force formula | `80/(dist+100)*0.008 + mdx*0.0003` | C5 Drift |
| Brownian drift | `+/-0.015 per axis per frame` | C5 Drift |
| Damping | `vx*0.995, vy*0.995` | C5 Drift |
| Speed cap | `1.5 px/frame` | C5 Drift |
| Gravity | None | C5 Drift |
| Rotation | `cursorForce*0.0003, damped *0.997` | C5 Drift |

### Frame Visual Properties

| Property | Value | Source |
|---|---|---|
| Scale range | `0.14-0.22` | V2 spec (larger than C5's 0.12-0.20) |
| Alpha (opacity) | `0.75` | C5 Drift |
| DPR cap | `2` | V2 spec |
| Animation loop | Single `requestAnimationFrame` | V2 spec |

### Frame Assets

14 PNG frames from Run85 baseline (frame-01.png through frame-14.png), same palette as original.

---

## 5. INTERACTION TOKENS

| Trigger | Action | Visual feedback |
|---|---|---|
| Mouse move | Cursor nudge (shallow trajectory change) | Frame drift changes direction |
| Touch move | Same nudge, passive listener | Frame drift changes direction |
| Space key | Toggle freeze/resume | Toast: "Frozen" / "Resumed" |
| Double-click / double-tap | Toggle freeze/resume | Toast: "Frozen" / "Resumed" |
| Hold S (800ms) | Activate corridor reveal | Dashed #2d8a7a border, frames pushed from center |
| Release S | Deactivate corridor | Border fades, frames drift back |
| First interaction | Dismiss hint | Hint fades out over 1.5s |
| Tab hidden | Pause animation loop | Frames hold position |
| Tab visible | Resume loop deterministically | Frames continue from paused state |

---

## 6. NO-JS FALLBACK (POSTER STATE)

- Full SYRE logo (white SVG) static DOM image
- One curated static frame: `frame-01.png` centered right, scale ~0.35
- Headline: "Only fun, only positive emotions"
- Email capture field (non-functional)
- "Rebranding 2026 · Coming soon" label
- All content in DOM — no Canvas or JavaScript dependency
- `<noscript>` block with complete static layout

---

## 7. REDUCED MOTION TOKENS

| Property | Value |
|---|---|
| Detection | `window.matchMedia('(prefers-reduced-motion: reduce)')` |
| Canvas opacity | `0.25` |
| Frame animation | Frozen (no falling/spinning/parallax) |
| User control | Space to toggle frames explicitly |
| Copy/Logo/Controls | Remain fully accessible |

---

## 8. RESPONSIVE BREAKPOINTS

| Breakpoint | Target | Frame count | Logo width | Copy layout |
|---|---|---|---|---|
| 320px | Small phone | 6 | `min(82vw, 262px)` | Centered |
| 390px | Phone | 6 | `82vw (~320px)` | Centered |
| 768px | Tablet | 8 | Right-aligned, `58%` | Left copy |
| 1440px | Desktop | 10 | `min(82vw, 1000px)` | Full layout |
| 1920px | Large desktop | 10 | Capped `1000px` | Full layout |

All breakpoints: `100svh`, `safe-area` inset, no horizontal overflow.

---

## 9. PERFORMANCE BUDGETS

| Metric | Target |
|---|---|
| Animation loop | Single `requestAnimationFrame` |
| DPR cap | `Math.min(devicePixelRatio, 2)` |
| Visibility pause | `document.hidden` check — skip update/draw |
| Canvas resize | Only on resize/orientationchange events |
| Initial render | Frames start as soon as first PNG loads |
| No asset decode in pointer/scroll handlers | All images preloaded |
| Zero external URLs | All assets local |
| Zero blocking console errors | Clean console |

---

## 10. DO / DON'T

### DO
- Use `#050505` background only
- Use `#2d8a7a` as single accent color
- Render frames at 0.75 alpha, scale 0.14-0.22
- Keep logo at opacity 0.22, right-side, behind canvas
- Maintain 35-50% desktop negative space
- Pause on `document.hidden`
- Cap DPR at 2
- Show poster immediately (no-JS / preload)
- Provide toast feedback for freeze/resume
- Enable S-hold corridor after 800ms
- Use single rAF loop
- Source only local assets from `assets/`

### DON'T
- Don't use C1 Rain gravity-based physics
- Don't add a second physics system (C1 Rain is fallback only)
- Don't use external CDN, fonts, scripts, or stylesheets
- Don't use React, Next, Tailwind, GSAP, Anime, WebGL, or video
- Don't invent claims, testimonials, or product specs
- Don't send emails — localStorage only with disclosure
- Don't exceed `devicePixelRatio` of 2 for canvas
- Don't cause horizontal overflow at any breakpoint
- Don't render frames before DOM content (logo/poster first)

---

*This document defines the exact design, motion, and accessibility tokens of the SYRE V2 best placeholder. All values are pinned to the Run95 storyboard decision and C5 Drift reference implementation.*
