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

## Sections planned (not built yet)
1. **Hero**
2. **Selected Work** — 3 projects
3. **About**
4. **Contact**

## Project structure
```
src/
  main.ts        entry point
  style.css      global reset + design tokens
  sections/      section modules (later)
  three/         3D scene code (later)
  lib/           helpers (later)
```

## Workflow rules
- **Small, focused prompts only.** One concern at a time.
- **Investigate before editing.** Read the relevant files first; understand the
  current state before changing anything.
- **Never run git commands.** The developer handles all git operations.
- **Never touch finished 3D / scroll / motion logic without explicit permission.**
  Once a Three.js scene, Lenis scroll, or GSAP animation is working, leave it
  alone unless told otherwise.
