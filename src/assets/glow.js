import * as THREE from 'three'

const cache = {}

function build(draw, size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  draw(canvas.getContext('2d'), size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function radial(ctx, size, stops) {
  const h = size / 2
  const g = ctx.createRadialGradient(h, h, 0, h, h, h)
  stops.forEach(([o, a]) => g.addColorStop(o, `rgba(255,255,255,${a})`))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
}

// White, tintable sprite textures shared by the core, planet halos and light rays.
export function glowTexture(kind = 'soft') {
  if (cache[kind]) return cache[kind]
  const draws = {
    soft: (ctx, s) => radial(ctx, s, [[0, 1], [0.12, 0.6], [0.35, 0.18], [0.7, 0.04], [1, 0]]),
    // thin horizontal streak, rotated by the sprite material to make light rays
    ray: (ctx, s) => {
      ctx.setTransform(1, 0, 0, 0.07, 0, s * 0.465)
      radial(ctx, s, [[0, 1], [0.25, 0.45], [0.6, 0.1], [1, 0]])
    },
    // four-point lens flare cross
    flare: (ctx, s) => {
      radial(ctx, s, [[0, 1], [0.08, 0.5], [0.25, 0], [1, 0]])
      ctx.save()
      ctx.setTransform(1, 0, 0, 0.05, 0, s * 0.475)
      radial(ctx, s, [[0, 0.9], [0.5, 0.2], [1, 0]])
      ctx.restore()
      ctx.save()
      ctx.setTransform(0.05, 0, 0, 1, s * 0.475, 0)
      radial(ctx, s, [[0, 0.9], [0.5, 0.2], [1, 0]])
      ctx.restore()
    },
  }
  cache[kind] = build(draws[kind])
  return cache[kind]
}
