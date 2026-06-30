/**
 * Shared input state — written by scroll/pointer listeners, read by the scene.
 *
 * scroll     : current (smoothed) scroll position in px, from Lenis.
 * targetVel  : raw scroll velocity from Lenis (the value we ease toward).
 * velocity   : smoothed scroll velocity (lerped toward targetVel in the RAF loop).
 * mouseX/Y   : pointer position normalized to roughly -1..1 (center = 0).
 */
export interface InputState {
  scroll: number
  velocity: number
  targetVel: number
  mouseX: number
  mouseY: number
}

export const state: InputState = {
  scroll: 0,
  velocity: 0,
  targetVel: 0,
  mouseX: 0,
  mouseY: 0,
}

/** Attach a pointer listener that feeds normalized mouse coords into state. */
export function initPointer(target: InputState = state): void {
  window.addEventListener(
    'mousemove',
    (e) => {
      target.mouseX = (e.clientX / window.innerWidth) * 2 - 1
      target.mouseY = (e.clientY / window.innerHeight) * 2 - 1
    },
    { passive: true },
  )
}
