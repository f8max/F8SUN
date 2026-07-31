# SYRE — prompt-pattern synthesis for the improved version

**Status:** production-ready design and motion brief.  
**Scope:** a successor direction informed by the local reference study. This document does not modify, supersede, or re-label Run85.

## 1. Design thesis

Build SYRE as an **editorial engineering experience about a hand-laid carbon frame**, not as a generic luxury landing page and not as a canvas demo with brand text behind it.

The page should communicate three ideas in the first few seconds:

1. the frame is the product and the visual protagonist;
2. its performance comes from deliberate material, geometry, and craft decisions;
3. customization is structural to the brand, not a late color-picker feature.

Working art-direction phrase: **“Engineered motion, individually laid.”**

The visual system should feel precise, physical, contemporary, and quietly confident. Use spectacle only when it explains the object.

---

## 2. Reference patterns: transfer vs. reject

| Source pattern | Transfer as a principle | Do not transfer literally |
|---|---|---|
| Treeline / ski landing | Condensed display type + mono technical metadata; asymmetric hero; one strong accent; progress rail; locally served assets; typography and data reinforcing the product world | Alpine palette, ski vocabulary, 203+232-frame dual sequences, 520vh/480vh scroll traps, all-uppercase copy everywhere |
| Gold Link scrollytelling | One sticky stage; scroll progress mapped to an object sequence; explicit narrative beats; the object remains centered, legible, and unobstructed; “hero → inner truth” progression | Generic Apple/luxury-tech styling, pure-black void as the only visual idea, blocking preload of every frame, arbitrary 120/144-frame requirement |
| Model Campaign | Oversized typography used as spatial architecture; controlled partial occlusion creates depth; minimal set with a single dominant object | Fashion model as a substitute for product story, fake lifestyle staging, giant-object novelty without functional meaning |
| Suspended Air | Freeze-frame clarity; silhouette first; product-facing camera angle; typography interacting with the scene rather than sitting in a card | Generic action-sports energy, “8K/masterpiece” prompt padding, environmental spectacle that competes with the frame |
| Floating Ad | Product identity must remain exact; center-right/lower-middle product staging; upper-left copy zone; realistic material/light; deliberate negative space; concise CTA | Instagram-poster layout as the whole website, outlined CTA in every section, neutral cement palette when it conflicts with SYRE, fake branding or altered frame geometry |
| VACUO / aerospace prompt | Explicit section order, type roles, component contracts, responsive rules, and negative constraints | Glassmorphism on every card, full-screen looping video, generic SaaS grids/FAQ/stats, hidden hero content waiting for animation, unverified marketing metrics |
| Existing Run85 | Five distinct motion behaviours, immediate canvas response, freeze/resume control, touch support, and reduced-motion awareness | Treating the five physics systems as five complete brand/product narratives; placeholder frames as final product photography; motion as the only information layer |

---

## 3. Composition system

### Global grid

- Use a 12-column desktop grid and a 4-column mobile grid.
- Content width: `min(1440px, 100%)`.
- Horizontal padding: `clamp(20px, 4vw, 64px)`.
- Keep at least one large quiet zone in every major viewport. Target **35–50% negative space on desktop** and **20–30% on mobile**.
- One dominant visual, one primary statement, and one proof layer per viewport. Do not show multiple equal-weight cards beside the frame.
- Use restrained radii: 0–12px. The product is sculptural; the interface should not become a field of rounded pills.

### Hero composition

- Place the frame center-right or across the middle third, in a clean three-quarter or drive-side view that preserves its silhouette and brand marks.
- Reserve the upper-left/left-middle for the main statement and the lower-left for one proof line and the primary CTA.
- Allow one oversized word or short phrase behind the frame. It may be occluded by the frame by roughly 10–30%, but critical letters must remain inferable and the frame must never lose its contour.
- Add a thin technical rail or datum line at the far edge for scene progress, frame/scene number, or verified product metadata.
- The initial frame must work as a static poster before JavaScript, fonts, or the motion sequence finish loading.

### Section rhythm

Alternate density rather than repeating cards:

1. **Immersive hero / object stage**
2. **Quiet proof spread** with macro material detail and concise engineering copy
3. **Customization field** using real color/material swatches as a spatial system
4. **Geometry / ride-character explanation** with restrained diagrams or labels
5. **Configurator handoff** with one clear action and a final full-frame portrait

Do not insert generic testimonials, invented counters, FAQ grids, or unrelated lifestyle panels merely to lengthen the page.

---

## 4. Art direction

### Core visual language

- Base: carbon black, ink navy, mineral white, and a warm paper/off-white reading surface.
- Accent: choose **one verified SYRE color per scene** from the recovered brand palette; never use several neon accents at equal strength.
- Surface cues: raw carbon weave, resin depth, cut-edge detail, masking lines, layup templates, hydro-dip boundaries, workshop annotations.
- Lighting: large soft key, crisp edge light on carbon, controlled reflections, real contact/occlusion shadow, no excessive bloom.
- Texture: fine print grain or engineering dot/grid only in empty areas. Never lay a texture over product detail.
- Photography/CG should look like a product study made by engineers and editors, not a generic automotive render.

### Image direction prompt

> Stage the exact SYRE frame as the only hero object. Preserve its geometry, tube proportions, dropouts, surface finish, decals, and color boundaries. Use a deep editorial studio with a quiet solid or subtly textured background. Place the frame in a clean three-quarter/drive-side view with a readable silhouette, precise carbon highlights, restrained contact shadow, and generous copy space on the left. Add no invented components, fake decals, rider, scenery, smoke, or decorative machinery. The result should feel like a material and geometry study: calm, technical, tactile, and premium.

### Customization scene

- Treat color swatches as a curated material archive, not a UI rainbow.
- Show a small number of color chips entering around the frame along intentional axes or bands.
- One selected color can flow across a masked frame region, but the transition must preserve geometry and decals.
- Pair the scene with a concise statement about choice and craft, not a wall of configuration controls.

---

## 5. Typography and hierarchy

Use three clearly separated roles:

1. **Display:** a licensed/self-hosted condensed grotesk with strong vertical structure. Use for the hero and section statements.
2. **Text:** a neutral humanist grotesk for explanatory copy and controls.
3. **Technical:** a mono face for measurements, material labels, sequence numbers, and process receipts.

An optional editorial serif/italic may appear in **one word or short phrase**, never as a competing fourth system.

### Scale

- Hero: `clamp(56px, 9vw, 152px)`, line-height `0.86–0.98`.
- Section statement: `clamp(40px, 6vw, 96px)`, line-height `0.92–1.02`.
- Body: `clamp(16px, 1.25vw, 20px)`, line-height `1.45–1.6`, maximum `58ch`.
- Technical labels: `11–13px`, uppercase, tracking `0.12–0.24em`.

### Rules

- Do not set every sentence in uppercase.
- Avoid a generic Inter-only hierarchy. Type contrast must be visible before color or animation is considered.
- Headline, product, and CTA must be understood within three seconds.
- Each section gets one headline, one supporting paragraph at most, and one proof/data cluster.
- Type may sit behind the frame for depth; body text and controls must never be occluded.

---

## 6. Scroll and canvas sequence

### One primary sequence

Use **one** primary sticky sequence, not two consecutive 400–500vh sequences.

- Section length: approximately `280–360vh` desktop; shorter on small screens.
- Sticky stage: `position: sticky; top: 0; min-height: 100svh`.
- The sequence should explain the frame through five deterministic beats:

| Progress | Visual state | Copy role |
|---:|---|---|
| 0–12% | Static full-frame portrait; clean silhouette | Brand/product statement |
| 12–34% | Slow controlled rotation or parallax; raw carbon light appears | Craft / hand layup |
| 34–56% | Macro or layered material transition, without fake exploded internals | Material proof |
| 56–78% | Verified color/customization treatment enters | Individual finish |
| 78–100% | Frame resolves into final hero/configurator-ready pose | CTA / next action |

- Text enters over the first 10% of its beat, holds, and exits over the last 10%.
- Transitions should feel deliberate and engineered. No random particle storms, uncontrolled spins, or motion blur that hides the product.
- Cursor/touch physics may add shallow parallax or light response, but scroll remains the narrative controller.
- Do not hijack wheel/touch scrolling and do not use mandatory horizontal scroll.

### Sequence implementation contract

- Use a poster image as frame zero and as the no-JS fallback.
- Prefer a short, well-authored sequence: roughly **60–96 desktop frames** and **24–48 mobile frames**, or a small set of layered assets when that produces equal quality.
- Serve assets locally. Use AVIF/WebP where image fidelity permits; retain PNG only for alpha-critical product cutouts.
- Map scroll progress to `0…frameCount - 1`; render at most once per `requestAnimationFrame`.
- Use passive scroll listeners or an observer-driven progress source; always remove listeners on teardown.
- Cap canvas device pixel ratio at `2`; resize only when dimensions/DPR actually change.
- Preload the poster and key transition frames first. Decode a bounded window around the current frame; do **not** block first render while every frame downloads.
- Keep the most recent decoded frames in a bounded cache and evict distant frames.
- If a frame is unavailable, hold the nearest decoded frame; never flash a blank canvas.
- Preserve frame aspect ratio with explicit `contain`/`cover` rules per breakpoint.

---

## 7. Product/object staging rules

- The SYRE frame is always more important than an athlete, abstract particle system, logo, or typographic effect.
- Preserve exact product proportions, finish, material, and branding. Never “improve” frame geometry in generated media.
- Use a stable visual axis between sequence frames so the object does not wobble.
- Components, material layers, and technical callouts may be separated only when supported by real reference geometry or photography.
- Avoid a generic exploded-view animation of invented internals.
- Keep the object unobstructed at the moment a claim is made about it.
- Use macro shots to prove craft: carbon weave, junction, paint edge, finish transition, dropout, or another verified detail.
- No fake rider endorsement, workshop machinery, aerodynamic numbers, weight claims, or performance metrics unless supplied and verified.

---

## 8. Negative space and UI density

- Negative space is functional: reserve it for copy, gaze direction, and frame motion.
- Keep navigation narrow and quiet. The hero should not begin with a large translucent nav capsule.
- Primary CTA appears once in the hero and once at the end. Secondary actions remain visually subordinate.
- No more than three visible metadata labels in the hero.
- Avoid overlays over full-frame photography except for a minimal readability gradient.
- Do not cover product cards with large black caption slabs; use a thin caption edge or place copy outside the image.

---

## 9. Performance, accessibility, and reduced motion

### Performance budgets

- Target LCP ≤ 2.5 s, CLS ≤ 0.05, and INP ≤ 200 ms on a representative mid-range mobile device.
- The initial poster, critical CSS, and visible type must load independently of the full sequence.
- Keep critical hero media compact; load the remaining sequence progressively after the poster is visible.
- Avoid autoplay background video when a deterministic still/sequence can tell the story.
- Keep scroll work under one frame budget; no synchronous bulk image decode in a scroll handler.
- No continuous canvas loop when the page is offscreen, hidden, frozen, or at rest.
- Pause work on `visibilitychange`; resume from the current deterministic state.
- Self-host and subset fonts; use no more than the necessary weights and always set metric-compatible fallbacks.

### Reduced motion

Under `prefers-reduced-motion: reduce`:

- replace the scrubbed sequence with a static hero plus 3–5 normal-flow story panels;
- disable cursor forces, inertial easing, spinning, and particle motion;
- remove the extended sticky height so users do not scroll through empty time;
- preserve all copy, proof, navigation, CTA, focus states, and configurator access;
- keep an explicit freeze/resume control where motion remains user-triggered.

### Interaction/accessibility

- Everything must work without hover.
- Touch input changes only optional parallax/selection, never access to content.
- Provide visible focus states, semantic headings, meaningful alt text, and a skip link.
- Do not put essential text inside canvas.
- Support `100svh`/dynamic mobile viewport behaviour and test at 320px width.

---

## 10. Explicit “do not build” list

- No generic black-and-white “luxury tech” clone.
- No purple gradients, decorative blobs, glass cards everywhere, or SaaS dashboard language.
- No two back-to-back multi-hundred-frame scroll sequences.
- No blocking “load all frames before start” gate.
- No full-screen background video beneath every section.
- No animation-dependent hidden headline or CTA.
- No invented product geometry, fake technical internals, unverified statistics, or synthetic testimonials.
- No heavy type collage that makes the frame unreadable.
- No random physics presented as the product story.
- No external runtime hotlinks for critical sequence or product assets.
- No scroll hijacking, inaccessible canvas-only content, or hover-only controls.
- No copying Treeline, Gold Link, or the reference campaign’s brand language, fonts, palette, or scene one-to-one.

---

## 11. Production acceptance checklist

The improved SYRE version is ready for review only when:

1. the first static frame clearly communicates product, brand, and primary action;
2. the frame remains geometrically consistent across all media;
3. every scroll beat explains a distinct verified product/craft idea;
4. desktop, mobile, keyboard, touch, no-JS poster, and reduced-motion paths all retain complete content;
5. the sequence never flashes blank and does not block initial render;
6. typography remains legible at 320px, 390px, 768px, 1440px, and wide desktop widths;
7. no section has competing hero-level elements;
8. product imagery is not obscured by overlays or caption slabs;
9. all critical media is local, attributed, and bounded by an asset manifest;
10. performance budgets are measured, not claimed;
11. no unverified product fact or altered product identity appears;
12. Run85 files, commits, evidence, and verdicts remain untouched.

