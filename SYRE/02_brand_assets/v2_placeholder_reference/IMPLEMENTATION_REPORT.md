# SYRE V2 — Implementation Report

**Status:** SYRE_V2_SYRE_ONLY_CORRECTION_READY
**Date:** 2026-07-29
**Parent baseline commit:** c792a99b07669519562ac38eca784cc9a9e878ec
**Parent baseline tree:** 486570b72364abdf85a37f13256e9d49aa427839
**Final identity:** established by external Conductor freeze
**Branch:** master

---

## 1. Implementation Summary

One static HTML/CSS/vanilla JavaScript rebranding placeholder at `work/syre-v2-best/`.
Built from Run95 storyboard decision (C5 Drift primary, C1 Rain fallback).
All assets sourced from verified Run85 baseline. Zero external runtime dependencies.

## 2. File Manifest

| File | SHA-256 | Bytes | Description |
|---|---|---|---|
| .gitignore | 461ef6dc28ef8d54d9bb039577b8fd1e30186ea74f0a7f94104384e69b58b50b | 75 | |
| README.md | 5fc72c945236abc2e1f8ff3d888de6627bac37ef880c015faca053fd5d56130a | 3610 | |
| SYRE_DESIGN.md | 1604802e0d4d7d87cfc0162ad80f0c0f29b6e6a13186fef8f41a098833a73594 | 7783 | |
| app.js | 1614aa0dbc779f2be8ea20dd741571a5e6404155093fdefbfdc4bdda46748b58 | 12462 | |
| assets/frame-01.png | ac3fb314bec4d85d575de817fd3b2d40100161584e34933874f90ec578e75d31 | 1157322 | Syre-only clean — frames 01-14 |
| assets/frame-02.png | ab83e25bd47182b75b26d861e7dc7908b08c90009184e4dd46c1ce8696260e01 | 1162773 | |
| assets/frame-03.png | 98a06fa59ec15a554078b8b5c554f68f328e72e8b3e89c8a52f33e31402b188c | 1154566 | |
| assets/frame-04.png | f0f3ff64d6a2359967f5a7db6c66e4b8c6ad850de66ff7503ebe21b37b4c6957 | 1157148 | |
| assets/frame-05.png | 7ef9f2e30eeb623d1d6910c588d6e0a365084fd57a4fcc94b0e31f88c84b1882 | 1156930 | |
| assets/frame-06.png | 8553bdea636096621ba1921dcad7fb8925006527e2e40a373a55f9676723b849 | 1165819 | |
| assets/frame-07.png | 217426a5c21d59415e8ef6ad0cd609ce5cba0cde3703172e874e94c59c1f2acf | 1163482 | |
| assets/frame-08.png | 38e14ebb8e53c879268c2324bd2b7616f58358e9344dfcbc872b22574822b27f | 1157260 | |
| assets/frame-09.png | e15ff65e9f242b81f379c6aa7f11023b331ad5bf0dd539cd1f8e3f8dab70cbbd | 1156187 | |
| assets/frame-10.png | d614d0d973aae3a4f003a081ddd625912dcd8c3161350497ec644f09e13ab257 | 1159077 | |
| assets/frame-11.png | 0b177ac2c87063e259f8988ec6d25b0957c9ad212dd9510b10660b3567ca3200 | 1152306 | |
| assets/frame-12.png | 0de69bde7523a84992edff63caf2a3327107dd2e21d7c94351a62016d5f23e5e | 1157900 | |
| assets/frame-13.png | b60366aafd9280398eb29504e1daadf0f0cf5cd47f106cadaca57207e47fcdee | 1157257 | |
| assets/frame-14.png | 3433690bbcb90adab5f6de15648e154344c8ad61828dbf72ed03dd1a719c3ab3 | 1158917 | |
| assets/syre-logo-dark.svg | 0f5decd8594efb5cb720c4a0346de9a717cd4fcd6d559f333c31270d583091d0 | 10759 | |
| assets/syre-logo-white.svg | 92e69605d590782df0c5cd0a070750a2a810f4d9a18ddca8cdbda88458278a7c | 10781 | |
| index.html | 7821268ff8cc2735f704621deb7908323c58e75df04253cceb963b61e7bf313b | 4283 | |
| styles.css | 391247068c3c917db8829c29d2033b2c0754d39f928247e34b4cf0bbec76dbe7 | 6599 | |
| SYRE_ONLY_CLEAN_MANIFEST.json | b301afb1b58106f54fe8fd73f59b66f8d6c78fe68e0318b0d703af3e7fb38019 | 5292 | Source manifest for syre-only assets |
| SYRE_ONLY_CLEAN_CORRECTION_RECEIPT.json | (generated) | — | Correction receipt |

## 3. Storyboard Contract Verification

| Contract File | Expected SHA-256 | Actual SHA-256 | Match |
|---|---|---|---|
| SYRE_V2_STORYBOARD.md | 8aca6261... | 8aca6261e43ad886f0a7061c2bc228587fd92e6d463034c328a135ce0ae6497b | YES |
| SYRE_V2_DECISION.json | 0abcb8f8... | 0abcb8f8fe252d1d6acd519d2df6352d250a7d726d0336161eb5cd67f1039cfa | YES |
| SYRE_V2_ASSET_MANIFEST.json | 81062cf4... | 81062cf45fbe3478e8d8c38533117eb8589c66d193333a4a5f6974d18958f62d | YES |
| STORYBOARD_BOARD.svg | 892a7be0... | 892a7be020dae748b9016af6d5f3aeb5cd9b7caf7f6bd6be696189d06ca69334 | YES |

## 4. Asset Verification

All 16 assets (14 frame PNGs + 2 logo SVGs) now syre-only clean — frame/fork geometry and main Syre wordmark only. Verified at manifest SHA-256 hashes. Sourced from cleaned deterministic repaint with dilated wordmark protection.

## 5. Mechanics Implementation

- **Primary:** C5 Drift (Brownian motion + cursor nudge)
- **Fallback:** C1 Rain (not implemented — C5 Drift satisfies all requirements)
- **Physics:** Identical to Run85 C5 reference: cursor force 80/(dist+100)*0.008 + mdx*0.0003, Brownian drift +/-0.015, damping 0.995, speed cap 1.5, no gravity
- **Frame lifecycle:** Persistent with edge wrap (no respawn)
- **Frame count:** 10 desktop / 6 mobile (V2 spec targets)
- **Scale range:** 0.14-0.22 (V2 "fewer, larger objects" directive)
- **Alpha:** 0.75
- **Rotation:** cursorForce*0.0003, damped *0.997
- **Animation:** Single requestAnimationFrame loop, DPR capped at 2, paused on document.hidden

## 6. Interaction Verification

| Feature | Status | Notes |
|---|---|---|
| Pointer nudge | IMPLEMENTED | Mouse mousemove + touchmove, shallow trajectory |
| Space freeze/resume | IMPLEMENTED | Toggle with toast notification |
| Double-click freeze/resume | IMPLEMENTED | 400ms double-click detection |
| S-hold corridor (800ms) | IMPLEMENTED | Dashed #2d8a7a border, frames pushed from center |
| S-release deactivate | IMPLEMENTED | Border fades, frames drift back |
| Hint dismissal | IMPLEMENTED | Fades after first pointer/key interaction |
| Visibility pause | IMPLEMENTED | document.hidden check in rAF loop |
| No-JS poster | IMPLEMENTED | <noscript> with logo, frame-01, headline, labels |
| Reduced motion | IMPLEMENTED | Canvas opacity 0.25, motion frozen, user toggle |

## 7. Visual Specification Conformance

| Spec | Value | Implemented |
|---|---|---|
| Background | #050505 | YES |
| Accent | #2d8a7a (single) | YES |
| Logo position | top:50%; left:55% desktop | YES |
| Logo width | min(82vw, 1000px) | YES |
| Logo opacity | 0.22 | YES |
| Logo z-index | 1 (behind canvas at 2) | YES |
| Negative space (desktop) | 35-50% | YES (right-side logo + frame distribution) |
| Frame count desktop | 10 | YES |
| Frame count mobile | 6 | YES |
| Frame alpha | 0.75 | YES |
| DPR cap | 2 | YES |
| Single rAF loop | 1 | YES |

## 8. Responsive Breakpoints

| Breakpoint | Logo | Frame count | Copy layout |
|---|---|---|---|
| 320px | min(82vw, 262px) | 6 | Centered |
| 390px | 82vw (~320px) | 6 | Centered |
| 768px | 58% right | 8-10 | Left copy, right logo |
| 1440px | min(82vw, 1000px) | 10 | Full desktop |
| 1920px | 1000px cap | 10 | Full desktop, capped logo |

## 9. Security & Integrity

- Zero external runtime URLs (only ridesyre.com as informational link)
- Zero API keys, tokens, or secrets in any file
- All assets verified at known SHA-256 hashes
- No invented claims, testimonials, or product specifications
- Email input: localStorage only, explicit disclosure, no live send
- Clean git status, no untracked or modified files

## 10. Terminal Literal

**SYRE_V2_SYRE_ONLY_CORRECTION_READY**

---

## Syre-Only Clean Correction — 2026-07-29

**Status:** SYRE_V2_SYRE_ONLY_CORRECTION_READY
**Parent commit:** c792a99b07669519562ac38eca784cc9a9e878ec
**Parent tree:** 486570b72364abdf85a37f13256e9d49aa427839
**Final identity:** established by external Conductor freeze

### Correction Summary

Bounded syre-only clean asset replacement. 14 frame PNGs replaced with exact verified
bytes from repainted single-source clean master. Visible content is only the bicycle
frame/fork, stock geometry, source colors, transparent background, and main `Syre`
wordmark. Five marked elements removed from every frame:

1. headtube squiggle/doodle
2. lower-downtube microtext
3. chainstay tree cluster
4. small lower-downtube black blob
5. bottom yoke word/mark

### Method

- Source ZIP SHA-256: caaec18f56935bfd88350175a3a88e0862b802c9c6fdefe0b6d646d575529fdd
- Manifest SHA-256: b301afb1b58106f54fe8fd73f59b66f8d6c78fe68e0318b0d703af3e7fb38019
- Clean source: deterministic checkerboard extraction from single-source clean master
- Per-source color sampling with dilated protection around main Syre wordmark
- Copy method: exact byte-for-byte replacement from verified input
- Integration added no transformations: exact byte-for-byte copy from verified input package. Supplied package provenance is ImageGen clean master with deterministic checkerboard extraction, per-source color sampling, and paint-only recolor with dilated protection around the main Syre wordmark (per input manifest SHA-256 b301afb1)

### Per-Asset Proof

| Frame | Output SHA-256 | Size | Width | Height | Status |
|---|---|---|---|---|---|
| frame-01.png | ac3fb314bec4d85d575de817fd3b2d40100161584e34933874f90ec578e75d31 | 1157322 | 1529 | 1134 | PASS |
| frame-02.png | ab83e25bd47182b75b26d861e7dc7908b08c90009184e4dd46c1ce8696260e01 | 1162773 | 1527 | 1133 | PASS |
| frame-03.png | 98a06fa59ec15a554078b8b5c554f68f328e72e8b3e89c8a52f33e31402b188c | 1154566 | 1527 | 1132 | PASS |
| frame-04.png | f0f3ff64d6a2359967f5a7db6c66e4b8c6ad850de66ff7503ebe21b37b4c6957 | 1157148 | 1530 | 1134 | PASS |
| frame-05.png | 7ef9f2e30eeb623d1d6910c588d6e0a365084fd57a4fcc94b0e31f88c84b1882 | 1156930 | 1529 | 1132 | PASS |
| frame-06.png | 8553bdea636096621ba1921dcad7fb8925006527e2e40a373a55f9676723b849 | 1165819 | 1529 | 1133 | PASS |
| frame-07.png | 217426a5c21d59415e8ef6ad0cd609ce5cba0cde3703172e874e94c59c1f2acf | 1163482 | 1526 | 1133 | PASS |
| frame-08.png | 38e14ebb8e53c879268c2324bd2b7616f58358e9344dfcbc872b22574822b27f | 1157260 | 1526 | 1133 | PASS |
| frame-09.png | e15ff65e9f242b81f379c6aa7f11023b331ad5bf0dd539cd1f8e3f8dab70cbbd | 1156187 | 1525 | 1133 | PASS |
| frame-10.png | d614d0d973aae3a4f003a081ddd625912dcd8c3161350497ec644f09e13ab257 | 1159077 | 1526 | 1133 | PASS |
| frame-11.png | 0b177ac2c87063e259f8988ec6d25b0957c9ad212dd9510b10660b3567ca3200 | 1152306 | 1524 | 1133 | PASS |
| frame-12.png | 0de69bde7523a84992edff63caf2a3327107dd2e21d7c94351a62016d5f23e5e | 1157900 | 1524 | 1133 | PASS |
| frame-13.png | b60366aafd9280398eb29504e1daadf0f0cf5cd47f106cadaca57207e47fcdee | 1157257 | 1526 | 1133 | PASS |
| frame-14.png | 3433690bbcb90adab5f6de15648e154344c8ad61828dbf72ed03dd1a719c3ab3 | 1158917 | 1526 | 1133 | PASS |

### Deterministic Proof

- input ZIP SHA-256 matches literal: PASS (caaec18f56935bfd88350175a3a88e0862b802c9c6fdefe0b6d646d575529fdd)
- input manifest SHA-256 matches literal: PASS (b301afb1b58106f54fe8fd73f59b66f8d6c78fe68e0318b0d703af3e7fb38019)
- 14/14 destination PNGs byte-identical to supplied input: PASS
- 14/14 PNG SHA-256 match manifest output_sha256: PASS
- all PNG dimensions match manifest: PASS
- non-asset runtime/design files byte-identical to baseline c792a99b: PASS
- no stale can/lid-only claims in evidence: VERIFIED

### Unchanged Files

index.html, styles.css, app.js, SYRE_DESIGN.md, assets/syre-logo-dark.svg,
assets/syre-logo-white.svg, .gitignore, README.md — all byte-identical to baseline.

### Removed Files

FRAME_ONLY_MANIFEST.json, FRAME_ONLY_CORRECTION_RECEIPT.json — superseded.

### Added Files

SYRE_ONLY_CLEAN_MANIFEST.json, SYRE_ONLY_CLEAN_CORRECTION_RECEIPT.json.

### Terminal Literal

**SYRE_V2_SYRE_ONLY_CORRECTION_READY**
