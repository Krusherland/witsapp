import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { glowTexture } from './glow'

const RADIUS = 26
const ARMS = 3

const noRaycast = () => null

function randn() {
  return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.9
}

function buildGalaxy(count) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const core = new THREE.Color('#ffd7a0')
  const mid = new THREE.Color('#c8c6ff')
  const rim = new THREE.Color('#6f84ff')
  const pink = new THREE.Color('#ff8fd0')
  const c = new THREE.Color()

  for (let i = 0; i < count; i++) {
    let x, y, z, t
    if (Math.random() < 0.3) {
      // bulge: dense, slightly flattened ball
      const r = Math.abs(randn()) * 2.4
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, k = Math.sqrt(1 - u * u)
      x = r * k * Math.cos(th); y = r * u * 0.55; z = r * k * Math.sin(th)
      t = r / RADIUS
    } else {
      // disc: logarithmic spiral arms with scatter that grows outwards
      const r = 1.5 + RADIUS * Math.pow(Math.random(), 1.25)
      const arm = Math.floor(Math.random() * ARMS)
      const theta = (arm * Math.PI * 2) / ARMS + 2.4 * Math.log(1 + r / 2.5) + randn() * (0.22 + 0.2 * (r / RADIUS))
      x = Math.cos(theta) * (r + randn() * 0.5)
      z = Math.sin(theta) * (r + randn() * 0.5)
      y = randn() * (0.1 + 0.5 * Math.exp(-r / 6))
      t = r / RADIUS
    }
    positions.set([x, y, z], i * 3)
    if (t < 0.3) c.copy(core).lerp(mid, t / 0.3)
    else c.copy(mid).lerp(rim, Math.min(1, (t - 0.3) / 0.7))
    if (t > 0.15 && Math.random() < 0.04) c.copy(pink)
    colors.set([c.r, c.g, c.b], i * 3)
    seeds[i] = Math.random()
  }
  return { positions, colors, seeds }
}

const galaxyVertex = /* glsl */ `
  uniform float uTime, uSize, uDpr;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float r = length(p.xz);
    float a = uTime * (0.015 + 0.006 / (1.0 + 0.3 * r));
    float c = cos(a), s = sin(a);
    p.xz = mat2(c, -s, s, c) * p.xz;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.5 + aSeed * 90.0);
    gl_PointSize = uSize * uDpr * (0.4 + aSeed) / -mv.z;
    vColor = aColor;
    vAlpha = twinkle * (0.3 + 0.7 * aSeed);
    gl_Position = projectionMatrix * mv;
  }
`
const galaxyFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`

function SpiralGalaxy({ count }) {
  const mat = useRef()
  const dpr = useThree((s) => s.viewport.dpr)
  const { positions, colors, seeds } = useMemo(() => buildGalaxy(count), [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 38 }, uDpr: { value: 1 } }), [])

  useFrame(({ clock }) => {
    mat.current.uniforms.uTime.value = clock.elapsedTime
    mat.current.uniforms.uDpr.value = dpr
  })

  return (
    <points frustumCulled={false} raycast={noRaycast}>
      <bufferGeometry key={count}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={galaxyVertex} fragmentShader={galaxyFragment}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Glow({ scale, color, opacity, texture = 'soft', rotation = 0 }) {
  return (
    <sprite scale={[scale, scale, 1]} raycast={noRaycast}>
      <spriteMaterial map={glowTexture(texture)} color={color} opacity={opacity} rotation={rotation}
        transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

// Blown-out warm core with light rays, like the centre of the reference galaxy.
function Core() {
  const rays = useRef()
  useFrame(({ clock }) => {
    rays.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.5) * 0.04)
    rays.current.rotation.z = clock.elapsedTime * 0.01
  })
  return (
    <group>
      <Glow scale={16} color="#ff9a4a" opacity={0.35} />
      <Glow scale={8} color="#ffc27a" opacity={0.6} />
      <Glow scale={3.6} color="#fff1da" opacity={0.9} />
      <group ref={rays}>
        <Glow scale={26} color="#ffcf99" opacity={0.35} texture="ray" rotation={0.35} />
        <Glow scale={22} color="#ffb98a" opacity={0.3} texture="ray" rotation={1.95} />
        <Glow scale={18} color="#ffe2c0" opacity={0.25} texture="ray" rotation={2.8} />
      </group>
    </group>
  )
}

const nebulaVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const nebulaFragment = /* glsl */ `
  uniform float uTime, uSeed, uOpacity;
  uniform vec3 uA, uB;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
    return v;
  }
  void main() {
    vec2 p = vUv - 0.5;
    float falloff = smoothstep(0.5, 0.05, length(p));
    vec2 q = p * 3.0 + uSeed;
    float warp = fbm(q + uTime * 0.01);
    float n = fbm(q + warp * 1.6 - uTime * 0.008);
    float density = pow(clamp(n * 1.5 - 0.3, 0.0, 1.0), 1.8) * falloff;
    vec3 col = mix(uA, uB, fbm(q * 1.7 - uSeed));
    gl_FragColor = vec4(col, density * uOpacity);
    #include <colorspace_fragment>
  }
`

function NebulaCloud({ position, size, a, b, opacity, seed }) {
  const mat = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uSeed: { value: seed }, uOpacity: { value: opacity },
    uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) },
  }), []) // eslint-disable-line
  useFrame(({ clock }) => { mat.current.uniforms.uTime.value = clock.elapsedTime })
  return (
    <Billboard position={position}>
      <mesh raycast={noRaycast} renderOrder={-5}>
        <planeGeometry args={[size, size]} />
        <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={nebulaVertex} fragmentShader={nebulaFragment}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </Billboard>
  )
}

const NEBULAE = [
  { position: [-34, -6, -40], size: 78, a: '#ff6a3a', b: '#7a2bd0', opacity: 0.55, seed: 1.3 },
  { position: [38, 10, -45], size: 70, a: '#2f6bff', b: '#5fe0ff', opacity: 0.45, seed: 7.1 },
  { position: [0, -14, -62], size: 96, a: '#8a3cff', b: '#ff4fa0', opacity: 0.45, seed: 3.7 },
  { position: [-46, 18, 8], size: 54, a: '#ff9a4a', b: '#ff3a5e', opacity: 0.35, seed: 11.9 },
  { position: [46, -8, 18], size: 58, a: '#2fb8ff', b: '#5a3cff', opacity: 0.35, seed: 5.5 },
]

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const skyFragment = /* glsl */ `
  varying vec3 vDir;
  void main() {
    float band = exp(-pow(vDir.y * 2.2, 2.0));
    vec3 col = mix(vec3(0.008, 0.012, 0.035), vec3(0.055, 0.035, 0.12), band);
    col += vec3(0.05, 0.02, 0.0) * pow(max(vDir.z * -1.0, 0.0), 3.0) * band;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function Sky() {
  return (
    <mesh renderOrder={-10} raycast={noRaycast}>
      <sphereGeometry args={[220, 32, 16]} />
      <shaderMaterial vertexShader={skyVertex} fragmentShader={skyFragment} side={THREE.BackSide}
        depthWrite={false} fog={false} />
    </mesh>
  )
}

// Everything behind the planets: gradient sky, two star layers, nebula clouds, spiral disc and glowing core.
export function GalaxyBackdrop({ count = 70000 }) {
  return (
    <>
      <Sky />
      <Stars radius={120} depth={60} count={2000} factor={2.5} fade speed={0.4} />
      <Stars radius={110} depth={40} count={350} factor={8} saturation={0.5} fade speed={0.6} />
      {NEBULAE.map((n, i) => <NebulaCloud key={i} {...n} />)}
      <SpiralGalaxy count={count} />
      <Core />
    </>
  )
}

export function GalaxyEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.25} intensity={1.35} radius={0.8} />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}

// Slow idle orbit around the current target; pauses while the user drags or a body is selected.
export function AutoDrift({ controls, paused }) {
  const state = useRef({ active: false, resumeAt: 0 })

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const start = () => { state.current.active = true }
    const end = () => { state.current.active = false; state.current.resumeAt = performance.now() + 3000 }
    c.addEventListener('controlstart', start)
    c.addEventListener('controlend', end)
    return () => { c.removeEventListener('controlstart', start); c.removeEventListener('controlend', end) }
  }, [controls])

  useFrame((_, dt) => {
    const s = state.current
    if (!controls.current || paused || s.active || performance.now() < s.resumeAt) return
    controls.current.rotate(dt * 0.025, 0, false)
  })
  return null
}
