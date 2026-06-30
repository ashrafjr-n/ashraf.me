/**
 * Base Three.js scene — a slow drifting starfield behind the Hero.
 *
 * A constant forward drift in z (with wrap-around) gives an infinite "flying
 * through space" base. Interaction (scroll + mouse) is layered on top via
 * shared input state, all of it lerped for smooth, cinematic motion.
 * Palette: mostly dim white with a few red (--accent) and wine pops. No purple.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'
import type { InputState } from '../lib/state'

export interface SceneController {
  update(time: number, state: InputState): void
  resize(): void
}

const PARTICLE_COUNT = 1500
const SPREAD_XY = 900 // half-width of the x/y volume
const DEPTH = 2400 // z length of the field (deep for parallax)
const DRIFT_SPEED = 30 // world units per second the field moves toward camera

// --- Interaction tuning (all gentle / clamped) ---
const SCROLL_DOLLY = 0.6 // world units of forward camera travel per px scrolled
const MAX_TILT = 0.09 // max parallax tilt from the mouse (~5°), radians
const TILT_LERP = 0.05 // how fast tilt eases toward the target
const DOLLY_LERP = 0.08 // how fast the camera eases toward its scroll target
const WARP_FACTOR = 0.018 // velocity -> z-stretch
const MAX_WARP = 0.8 // cap on extra z-scale (1 + MAX_WARP)
const WARP_LERP = 0.06
const BASE_FOV = 70
const MIN_FOV = 58 // fov floor when warping
const FOV_FACTOR = 0.32 // velocity -> fov reduction
const MAX_FOV_DROP = 12
const FOV_LERP = 0.06

// Palette (red + wine, no purple)
const RED = new Color('#ff1f3c')
const WINE = new Color('#5c0a1e')

/** Soft round sprite so points are dots, not squares. */
function createCircleTexture(): CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function initScene(canvas: HTMLCanvasElement): SceneController {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.setClearColor(0x000000, 0) // transparent: dark CSS bg shows through

  const scene = new Scene()

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    DEPTH * 2,
  )
  camera.position.set(0, 0, 0)

  // --- Particle geometry: positions distributed through a deep volume ---
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const c = new Color()

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    positions[i3] = rand(-SPREAD_XY, SPREAD_XY)
    positions[i3 + 1] = rand(-SPREAD_XY, SPREAD_XY)
    positions[i3 + 2] = rand(-DEPTH, 0) // ahead of the camera (down -z)

    // Mostly dim white; small fraction red / wine pops.
    const roll = Math.random()
    if (roll < 0.08) {
      c.copy(RED)
    } else if (roll < 0.14) {
      c.copy(WINE)
    } else {
      const v = rand(0.45, 0.9)
      c.setRGB(v, v, v)
    }
    colors[i3] = c.r
    colors[i3 + 1] = c.g
    colors[i3 + 2] = c.b
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

  const material = new PointsMaterial({
    size: 3.2,
    sizeAttenuation: true,
    map: createCircleTexture(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    opacity: 0.85,
  })

  const points = new Points(geometry, material)
  scene.add(points)

  const posAttr = geometry.getAttribute('position') as Float32BufferAttribute

  // --- Animation: constant drift + smoothed scroll / mouse interaction ---
  let prevTime = performance.now()

  function update(time: number, state: InputState): void {
    const delta = Math.min((time - prevTime) / 1000, 0.1) // clamp big tab-switch gaps
    prevTime = time
    const v = Math.abs(state.velocity)

    // (a) Mouse parallax — tilt the field a few degrees, lerped.
    const tiltY = state.mouseX * MAX_TILT
    const tiltX = -state.mouseY * MAX_TILT
    points.rotation.y += (tiltY - points.rotation.y) * TILT_LERP
    points.rotation.x += (tiltX - points.rotation.x) * TILT_LERP

    // (b) Forward dolly — scroll flies the camera INTO the field (-z), lerped.
    const targetZ = -state.scroll * SCROLL_DOLLY
    camera.position.z += (targetZ - camera.position.z) * DOLLY_LERP

    // (c) Velocity warp — stretch the field along z when scrolling fast, ease back.
    const warpTarget = 1 + Math.min(v * WARP_FACTOR, MAX_WARP)
    points.scale.z += (warpTarget - points.scale.z) * WARP_LERP

    // (d) Dynamic FOV — narrow slightly with speed for a warp feel, lerped + clamped.
    const fovTarget = MathUtils.clamp(
      BASE_FOV - Math.min(v * FOV_FACTOR, MAX_FOV_DROP),
      MIN_FOV,
      BASE_FOV,
    )
    if (Math.abs(fovTarget - camera.fov) > 0.01) {
      camera.fov += (fovTarget - camera.fov) * FOV_LERP
      camera.updateProjectionMatrix()
    }

    // Constant forward drift + wrap. Threshold is in the points' local space,
    // so divide the (world) camera z by the warp scale to keep the wrap correct.
    const step = DRIFT_SPEED * delta
    const threshold = camera.position.z / points.scale.z
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const zi = i * 3 + 2
      arr[zi] += step // move toward the camera (+z)
      while (arr[zi] > threshold) {
        arr[zi] -= DEPTH // wrap back to the far edge -> infinite field
      }
    }
    posAttr.needsUpdate = true

    renderer.render(scene, camera)
  }

  function resize(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false)
  }

  return { update, resize }
}
