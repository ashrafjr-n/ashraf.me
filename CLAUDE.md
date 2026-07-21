# Personal Portfolio — Project Guide

## Stack
- **Vite** — build tool / dev server
- **TypeScript** — vanilla, no framework
- **Three.js** — 3D scene work (`src/three/`)
- **GSAP** — animation / motion
- **Lenis** — smooth scrolling
- **Plain CSS** — no Tailwind, no CSS framework (`src/style.css`)

## Theme
- Dark, cinematic.
- Accent palette: **red + wine** only.
- **NO purple anywhere** — not in colors, gradients, shadows, or 3D materials.
- Design tokens live in the `:root` block of `src/style.css`.
- Display font: **Syncopate**. Code/mono font: **JetBrains Mono**.

## Architecture — Depth-Based Camera Navigation
This is NOT a normal scrolling page. There is no real document scroll of
content. Instead:

- A tall invisible `scroll-proxy` element generates scroll distance for Lenis
  to read. The viewport is fixed full-screen.
- Sections are NOT stacked in normal document flow. They are registered as
  **depth items** in `src/lib/depth.ts`, each with a `baseZ` position along the
  Z axis (Hero at `baseZ 0`, each following section further back).
- Scrolling moves a virtual `cameraZ` forward. Each depth item's visible
  position, scale, and opacity are computed from its distance to the camera
  (`relZ = baseZ + cameraZ`) every frame.
- The effect: the camera flies FORWARD through depth. The next section emerges
  from the distance and grows as the camera approaches it, then fades out as
  the camera passes through it. Sections must NEVER slide up from below like a
  normal page — that breaks the entire concept.
- One single RAF loop drives everything: `lenis.raf(time)` → read scroll/
  velocity into shared state (`src/lib/state.ts`) → `scene.update()` (Three.js
  particle field) → `updateDepth(scroll)` (depth engine). Do not create a
  second animation loop.
- The HUD overlay (fps/coord/scroll hints) is fixed on screen and is NOT a
  depth item — it stays independent of camera movement.

**Before changing anything scroll- or navigation-related, re-read this section.
Any change that would reintroduce normal stacked-section scrolling is a
regression, not a feature.**

## Visual Language — Project Cards ("Polaroid" style)
Project preview cards must read as physical photographs floating in space, not
UI panels:
- **Thick white border** on all sides, like a printed photo/Polaroid frame —
  substantial, not a thin 1–2px line.
- **Tall portrait rectangle**, not square or landscape.
- **Smaller scale** overall — a photo floating in space, not a dominating panel.
- **Slight rightward rotation** (roughly 3–8°), with mild per-card randomness
  so cards don't look mechanically identical.
- **Soft realistic drop shadow** underneath to sell the "physical object"
  feeling.
- Text content (title, description, tags) lives outside/below the photo area,
  never overlaid on top of it — the image itself stays clean.

## Data
- `src/lib/projects.ts` — typed `Project[]` array, single source of truth for
  Selected Work content (title, subtitle, description, tags, preview image,
  url). Add/edit projects here, not inline in section markup.

## Project structure