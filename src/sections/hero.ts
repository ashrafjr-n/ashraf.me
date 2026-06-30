/**
 * Hero + persistent overlays.
 *
 * In the depth system the Hero is just the index-0 depth item: its content
 * (name + tagline) is returned so main.ts can place it in the perspective world,
 * where it recedes INTO the distance as the camera flies past it.
 *
 * The HUD, scroll hint and cinematic layers are NOT depth items — they're fixed
 * full-screen overlays that stay put and are appended directly to the root.
 */

/** Small typed helper for building elements with class + innerHTML. */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (html !== undefined) node.innerHTML = html
  return node
}

/** Cinematic full-screen overlay layers (scanlines, noise, vignette). */
function buildOverlays(): HTMLDivElement {
  const overlays = el('div', 'fx-overlays')
  overlays.append(
    el('div', 'fx-scanlines'),
    el('div', 'fx-noise'),
    el('div', 'fx-vignette'),
  )
  return overlays
}

/** Fixed corner HUD overlay. */
function buildHud(): HTMLDivElement {
  const hud = el('div', 'hud')
  hud.append(
    el('div', 'hud__item hud__tl', 'SYS.READY'),
    el('div', 'hud__item hud__tr', 'FPS <strong id="fps">60</strong>'),
    el('div', 'hud__item hud__bl', 'COORD <strong id="coord">000.000</strong>'),
    el('div', 'hud__item hud__br', '↓ scroll to enter'),
  )
  return hud
}

/** Fixed bottom-center pulsing scroll hint. */
function buildScrollHint(): HTMLDivElement {
  const hint = el('div', 'hero__scroll-hint')
  hint.append(
    el('span', 'hero__scroll-label', 'SCROLL'),
    el('span', 'hero__scroll-line'),
  )
  return hint
}

/** The Hero content (name + tagline) — becomes the index-0 depth item. */
function buildHeroContent(): HTMLDivElement {
  const content = el('div', 'hero__content')
  content.append(
    el('h1', 'hero__name', 'ASHRAF'),
    el('p', 'hero__tagline', 'Creative developer · cinematic web experiences'),
  )
  return content
}

export interface HeroParts {
  canvas: HTMLCanvasElement
  heroContent: HTMLDivElement
  scrollHint: HTMLDivElement
}

/**
 * Append the persistent fixed overlays (canvas, HUD, scroll hint, cinematic
 * layers) to `root`, and return the pieces main.ts needs — the WebGL canvas and
 * the Hero content (to register as depth item 0).
 */
export function initHero(root: HTMLElement = document.querySelector<HTMLDivElement>('#app')!): HeroParts {
  // Background WebGL canvas — fixed, full-screen, sits below everything else.
  const canvas = el('canvas')
  canvas.id = 'scene'

  const scrollHint = buildScrollHint()

  // Fixed overlays straight onto the root (not depth items).
  root.append(canvas, buildHud(), scrollHint, buildOverlays())

  return { canvas, heroContent: buildHeroContent(), scrollHint }
}
