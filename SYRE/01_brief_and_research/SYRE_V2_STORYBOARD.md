# SYRE V2 — Best Placeholder Visual Decision Record

**Status:** SYRE_V2_WEB_STORYBOARD_READY_FOR_IMPL
**Author:** WEB (topic 457)
**Date:** 2026-07-29
**Based on:** Conductor Handoff Section 8, Run85 baseline, reference study contracts

---

## 1. CONTRACT HASH VERIFICATION

| Contract File | Required SHA-256 | Actual SHA-256 | Match |
|---|---|---|---|
| CONDUCTOR_SYRE_V2_HANDOFF.md | 82d9f256f81f1d8c691642febaf07d92a5a74badd4c433decfb23e605906bf58 | 82d9f256f81f1d8c691642febaf07d92a5a74badd4c433decfb23e605906bf58 | YES |
| prompt-patterns-synthesis.md | 1fbd719be777e68f396beabe00911f5e46ffee09cdd9663d1b5673a0fd1bcd71 | 1fbd719be777e68f396beabe00911f5e46ffee09cdd9663d1b5673a0fd1bcd71 | YES |
| web-reference-matrix.md | e069d7ba5157ca2d1247a829f5e19b50911f1c0dcd99d713fef2b11f51fe95ca | e069d7ba5157ca2d1247a829f5e19b50911f1c0dcd99d713fef2b11f51fe95ca | YES |

**Run85 Identity (immutable):**
- Commit: f45f31ccb619adfdbb4ecb8d247a1b87c7fb7fb0
- Tree: d2a978edbbd0675426e9dcf5f4fbaae54639a1a2
- Aggregate: 58c27ea6f8ea9764492628d6e55f78610d87f08ef78923640c0ea4f7641dc37d
- Drift: NONE (confirmed by t_9d4111ef regress)

---

## 2. C5 DRIFT vs C1 RAIN — MECHANICS COMPARISON

### 2.1 Source Mechanics (from Run85 candidate code)

| Property | C5 Drift | C1 Rain |
|---|---|---|
| **Physics model** | Brownian motion + cursor nudge | Gravity-driven fall + cursor wind |
| **Frame count (desktop/mobile)** | 14 / 7 | 14 / 7 |
| **Frame lifecycle** | Persistent (edge wrap) | Removed at bottom +200px, respawn from top |
| **Cursor influence** | Subtle nudge | Strong wind |
| **Cursor force formula** | 80/(dist+100)*0.008 + mdx*0.0003 | 180/(dist+40)*0.025 + mdx*0.0008 |
| **Damping** | vx*0.995, vy*0.995 | vx*0.996 |
| **Speed cap** | 1.5 px/frame | 3.5 px/frame |
| **Gravity** | None (Brownian) | 0.12 constant downward |
| **Random drift** | +/-0.015 per axis per frame | +/-0.01 horizontal only |
| **Rotation** | cursorForce*0.0003, damped *0.997 | cursorForce*0.008*0.001, damped *0.999 |
| **Frame scale range** | 0.12-0.20 | 0.10-0.17 |
| **Frame alpha** | 0.75 | 0.82 |
| **Interaction hint** | "Move cursor to nudge · Space or double-click to freeze" | "Move cursor · Space or double-click to freeze" |
| **Screenshot bytes (desktop)** | 310,347 | 231,581 |
| **Character** | Controlled, meditative, engineered | Naturalistic, falling, fluid |

### 2.2 Visual Evidence from Controller Screenshots

**C5 Drift Desktop (1440x900):**
- Dark field (#050505) dominates ~50% of viewport as deliberate negative space
- Very large white SYRE logo centered at [220,207] rendered at 1000x482px (69.4% viewport width), opacity 0.22
- 14 colored bicycle frames distributed across the canvas in gentle lateral drift positions
- Frame colors visible: red, green, blue, white, orange, yellow, teal across the 14-frame palette
- Frames partially occlude the logo — silhouettes cross the wordmark creating the prescribed reveal mechanic
- No text, no CTA, no UI chrome beyond bottom hint bar
- Overall impression: calm, engineered, sculptural — product frames as visual protagonists

**C1 Rain Desktop (1440x900):**
- Same dark field and logo placement
- Frames appear in vertical fall pattern — higher density in mid-to-lower viewport
- More chaotic distribution due to gravity mechanics
- Slightly brighter frames (alpha 0.82 vs 0.75)
- Overall impression: dynamic, natural, falling — but less controlled frame silhouette readability

### 2.3 Decision

**PRIMARY MECHANICS REFERENCE: C5 DRIFT**

Reasoning:
1. C5 Drift's Brownian motion + nudge produces controlled, readable frame silhouettes — frames remain on screen long enough for the user to recognize each frame shape, preserving product legibility.
2. The persistent frame set with edge wrap creates deliberate composition rather than a constant churn of respawning frames. This matches the conductor's directive: "fewer, larger objects instead of a dense central pile."
3. Cursor influence is subtle ("nudge") rather than dominant ("wind"), keeping frame motion shallow and controlled per Section 6 of the handoff.
4. Lower alpha (0.75) and larger scale range (0.12-0.20) produce fewer but more visually substantial frames.
5. Drift's gentle lateral movement creates better negative-space management — frames spread across the canvas rather than stacking at the bottom.

**FALLBACK: C1 RAIN**

Used only if literal evidence proves Drift cannot satisfy a specific requirement. Rain's gravity-respawn model is the backup — not the primary.

---

## 3. FIXED VISUAL SPECIFICATION

### 3.1 Frame Density

| Breakpoint | Frame Count | Rationale |
|---|---|---|
| Desktop (768-1920px) | 8-12 | Handoff Section 6: "8-12 visible frame compositions" |
| Mobile (320-767px) | 5-7 | Handoff Section 6: "5-7" mobile |

**V2 target:** 10 desktop, 6 mobile — midpoint of the prescribed ranges.

### 3.2 Object Scale

- Frame scale range: 0.14-0.22 (slightly larger than C5 Drift's 0.12-0.20 per conductor's "fewer, larger objects")
- Logo: min(82vw, 1000px) desktop — preserved from Run85 C5
- Logo: 82vw on mobile (320px logo width at 390px viewport = 82%)

### 3.3 Negative Space

- Desktop target: 35-50% of viewport area as deliberate negative space
- Mobile target: 20-30% negative space
- Achieved through: right-side logo placement leaving left 40-50% clear, frame distribution avoiding bottom-center

### 3.4 Giant Right-Side Logo Placement

**Desktop (1440x900 reference):**
- Position: center-right — shift logo center to 55-60% horizontal instead of 50%
- DOM rect approximate: [320, 209, 1000, 482]
- z-index: 1 (behind canvas at z-index:2)
- Opacity: 0.22
- CSS: position:absolute; top:50%; left:55%; transform:translate(-55%,-50%); width:min(82vw,1000px)

**V2 refinement:** Logo spans approximately right 60-70% of viewport width, creating more negative space on left for copy and CTA.

### 3.5 Minimal Copy Placement

**Desktop copy zones:**
- **Zone A (top-left):** Optional headline "Only fun, only positive emotions" — upper-left, 64px from edges. Font: condensed grotesk, white/#ccc, clamp(24px,1.8vw,32px).
- **Zone B (bottom-left):** Technical labels — mono text: HAND-LAID CARBON / CUSTOM FINISH / REBRANDING 2026 — bottom ~80px, 11-13px, uppercase, tracking 0.12-0.24em, color #555.
- **Zone C (bottom-center):** Hint text — "Move cursor to nudge · Space to freeze · Hold S for 0.8s to reveal" — centered, bottom 24px, 12px, color #666, dismissible.

**Mobile copy zones:**
- Zone A: top-center, centered
- Zone B: below logo, centered
- Zone C: bottom, above safe area

### 3.6 One Verified SYRE Frame Color

**Primary accent:** Raw carbon / teal-mint (#2d8a7a) — extracted from Run85 frame-14.png visual palette and original site brand color range.

**Color token:** --syre-accent: #2d8a7a used for hint highlight, toast accent, S-hold corridor border, optional headline underline.

**Background:** #050505 (carbon/ink black) with subtle mineral/engineering-dot texture only in empty areas.

### 3.7 Fallback Poster

**No-JS / no-Canvas poster state:**
- Full SYRE logo as static DOM image (white SVG on #050505 background)
- One curated static frame — frame-01.png centered right, scale ~0.35
- Headline "Only fun, only positive emotions" visible
- Email capture field present but non-functional
- "Rebranding 2026 · Coming soon" label
- All content in DOM — no Canvas or JS dependency

**Poster assets:**
- frame-01.png (SHA-256: d04f73afa0d1f61a7f4a29bf1c65e1e047a9d3224ae45771de6a359459118ef2)
- syre-logo-white.svg (SHA-256: 92e69605d590782df0c5cd0a070750a2a810f4d9a18ddca8cdbda88458278a7c)

### 3.8 Hint System

**Default hint (visible until first interaction):**
> Move cursor to nudge · Space to freeze · Hold S for 0.8s to reveal

- Position: bottom-center, 24px from bottom
- Font: 12px system-ui, color #666
- Opacity: 1, fades to 0 over 1.5s after first interaction

**Toast (on freeze/resume):**
- "Freeze: Frozen — Space/double-click to resume" / "Resume: Resumed"
- Duration: 2 seconds
- Background: rgba(255,255,255,0.10), color #888

### 3.9 Email/CTA State

**Email capture (optional):**
- Position: bottom-left zone (desktop) / bottom-center (mobile)
- Input[type=email] + "Notify me" button
- State: Hidden → Visible → Submitted (localStorage only) → Error
- Disclosure: "Your email stays on your device. This is a placeholder — nothing is sent or stored."
- DOM-only, never canvas

**Secondary CTA:** "Learn more →" linking to ridesyre.com (external, new tab)

### 3.10 S-Hold Corridor Easter Egg

**Mechanic:**
- Holding S key for >=800ms activates corridor reveal
- Vertical corridor (~250px wide) centered on logo clears frames from zone
- Frames within corridor gently pushed outward
- Logo becomes fully visible through cleared corridor
- Corridor border: 1px dashed #2d8a7a at opacity 0.3, fades in over 800ms
- On release: frames drift back naturally

---

## 4. ASSET BINDING

Every selected asset is bound to an exact local path and source URL/hash from either the Run85 baseline or the original scrape manifest. See output/SYRE_V2_ASSET_MANIFEST.json for the complete binding.

### 4.1 Logo Assets

| Asset | Local Path | SHA-256 |
|---|---|---|
| SYRE logo white | input/run85-baseline/candidate/deliverables/shared/assets/syre-logo-white.svg | 92e69605d590782df0c5cd0a070750a2a810f4d9a18ddca8cdbda88458278a7c |
| SYRE logo dark | input/run85-baseline/candidate/deliverables/shared/assets/syre-logo-dark.svg | 0f5decd8594efb5cb720c4a0346de9a717cd4fcd6d559f333c31270d583091d0 |

### 4.2 Frame Assets (Run85 — reused as-is)

All 14 frame PNGs from shared/assets/ (frame-01.png through frame-14.png) with verified SHA-256 in BASELINE_MANIFEST.json. See manifest for per-frame hashes.

### 4.3 Content References (from original scrape)

- Original site logo: https://ridesyre.com/wp-content/uploads/2022/07/logo.svg
- Original hero image alt text: "Only fun, only positive emotions"
- Original brand fonts: HouschkaPro / Montserrat (self-hosted)

### 4.4 No Invented Claims

- No performance numbers, testimonials, product specs beyond brief, invented color names, customer counts, awards, or contact details.

---

## 5. WIREFRAME SPECIFICATIONS

### 5.1 Desktop Wireframe (1440x900)

See: output/WIREFRAME_DESKTOP.svg

**Spatial coordinates (CSS px):**

| Layer | Element | z-index | Position | Dimensions |
|---|---|---|---|---|
| 0 | Background | 0 | 0,0 | 1440x900, fill #050505 |
| 1 | Logo layer | 1 | 320,209 | 1000x482, opacity 0.22 |
| 2 | Canvas (frame field) | 2 | 0,0 | 1440x900 |
| 3 | Zone A (headline) | 3 | 64,64 | max 480px wide |
| 3 | Zone B (tech labels) | 3 | 64,810 | 200px wide |
| 3 | Zone C (hint) | 3 | 720,876 (center-x) | auto |
| 4 | Toast | 10 | center-x, 868 | auto |
| 5 | Email/CTA zone | 3 | 64,830 | 280px wide |

**Negative space:** ~45% at rest (within 35-50% target)

### 5.2 Mobile Wireframe (390x844)

See: output/WIREFRAME_MOBILE.svg

| Layer | Element | z-index | Position | Dimensions |
|---|---|---|---|---|
| 0 | Background | 0 | 0,0 | 390x844, fill #050505 |
| 1 | Logo layer | 1 | 35,345 | 320x154, opacity 0.22 |
| 2 | Canvas (frame field) | 2 | 0,0 | 390x844 |
| 3 | Zone A (headline) | 3 | center-x, 40 | max 320px |
| 3 | Zone B (tech labels) | 3 | center-x, 520 | auto |
| 3 | Zone C (hint) | 3 | center-x, 820 | auto |
| 4 | Toast | 10 | center-x, 810 | auto |

**Negative space:** ~25% (within 20-30% target)

---

## 6. ONE-SCREEN STORYBOARD

See: output/STORYBOARD_BOARD.svg

**Five states in temporal sequence:**

1. **INITIAL (0-300ms):** Static poster — logo, one curated frame, headline, hint. No-JS fallback.
2. **ACTIVE (300ms+):** 10 frames enter via fade-in. Brownian drift begins. Hint visible.
3. **INTERACTION (2s+):** Cursor nudge active. Hint fades out. Logo partially occluded/revealed.
4. **FREEZE:** All motion stops. Toast notification. Frames hold position.
5. **CORRIDOR (S-HOLD):** Vertical corridor clears around logo. Dashed border appears. Logo fully visible.

---

## 7. IMPLEMENTATION-READY ACCEPTANCE CHECKLIST

### 7.1 No-JS / No-Canvas
- [ ] Static poster renders: logo, one frame, headline, hint
- [ ] Email input visible (placeholder)
- [ ] All essential content in DOM — never canvas-only
- [ ] <noscript> fallback present
- [ ] Canvas absence does not produce white screen

### 7.2 Reduced Motion
- [ ] prefers-reduced-motion detected via CSS + JS
- [ ] No falling/spinning/parallax when reduced
- [ ] Canvas dims to opacity 0.25
- [ ] Freeze/resume control available
- [ ] All copy, logo, controls remain accessible
- [ ] No extended sticky height
- [ ] User-started motion only after explicit action

### 7.3 Responsive Breakpoints
- [ ] 320px: No overflow, logo ~262px, 5 frames, line-breaks ok
- [ ] 390px: Logo 320x154px, 6 frames, hint single-line, safe-area
- [ ] 768px: Transition — 8 frames, logo right-aligned, copy left
- [ ] 1440px: 10 frames, logo 1000x482px, full layout
- [ ] 1920px: Logo capped at 1000px, no overflow

### 7.4 Canvas DPR <= 2
- [ ] c.width/c.height uses min(devicePixelRatio, 2)
- [ ] Visual quality acceptable on 3x DPR devices

### 7.5 Visibility Pause
- [ ] visibilitychange pauses loop when hidden
- [ ] document.hidden check in animation loop
- [ ] Resume from deterministic prior state
- [ ] Frame positions preserved during pause

### 7.6 Local Assets Only
- [ ] All 14 frame PNGs from local shared/assets/
- [ ] Both SVG logos served locally
- [ ] No external font CDN — self-hosted fonts
- [ ] No hotlinked images, scripts, or stylesheets

### 7.7 Copy Verification
- [ ] Headline "Only fun, only positive emotions"
- [ ] Labels: "HAND-LAID CARBON", "CUSTOM FINISH", "REBRANDING 2026"
- [ ] No invented claims or fake testimonials
- [ ] Email disclosure text present

### 7.8 Performance Budgets
- [ ] LCP <= 2.5s on mid-range mobile
- [ ] INP <= 200ms
- [ ] CLS <= 0.05
- [ ] Initial shell JS <= 10kB gzip
- [ ] No asset decode inside pointer/scroll handler
- [ ] Canvas resize only when DPR changes
- [ ] Poster renders before frame assets load
- [ ] Zero page errors, zero blocking console errors

### 7.9 Run85 Immutability
- [ ] Run85 commit f45f31c unchanged
- [ ] Run85 tree d2a978e unchanged
- [ ] All 29 Run85 files byte-identical
- [ ] Run85 ZIP c5af0f2 unchanged
- [ ] V2 in separate workspace/branch/output

### 7.10 Interaction Verification
- [ ] Pointer nudge — measurable trajectory change
- [ ] Touch — state change without hover
- [ ] Space toggles freeze/resume
- [ ] Double-click/double-tap toggles freeze/resume
- [ ] S hold (800ms) — corridor clear + visual indicator
- [ ] S release — frames drift back
- [ ] Hint dismisses after first interaction
- [ ] Toast appears for freeze/resume (2s)
- [ ] Freeze preserves frame positions exactly
- [ ] Resume continues deterministically

---

## 8. TERMINAL LITERAL

**SYRE_V2_WEB_STORYBOARD_READY_FOR_IMPL**

---

*This document is a decision artifact per Conductor Handoff Section 8. No HTML/CSS/JS implementation exists in this workspace. The impl worker (topic 4) receives this storyboard as its sole specification.*
