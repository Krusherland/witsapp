import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RELATIONS } from './constants'

// Star mist flowing along a curve between two bodies. The curve is evaluated on
// the GPU, so per frame we only update three vec3 uniforms (A, B, control point).
const vertex = /* glsl */ `
  uniform vec3 uA, uB, uC;
  uniform float uTime, uSpeed, uWidth, uPulse, uSize, uDpr;
  attribute float aT;
  attribute vec3 aOff;
  varying float vAlpha;
  void main() {
    float t = fract(aT + uTime * uSpeed);              // flow direction: A -> B
    vec3 p = mix(mix(uA, uC, t), mix(uC, uB, t), t);   // quadratic Bezier
    p += aOff * uWidth * (0.3 + sin(3.14159 * t));     // wider mid-span, tight at ends
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float pulse = 1.0 + uPulse * sin(uTime * 3.0 + t * 8.0);
    gl_PointSize = uSize * uDpr * pulse / -mv.z;
    vAlpha = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.88, t) * pulse;
    gl_Position = projectionMatrix * mv;
  }
`
const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vAlpha * 0.9);
    #include <colorspace_fragment>
  }
`

export default function RelationshipBeam({ refs, fromId, toId, type, count = 450 }) {
  const mat = useRef()
  const dpr = useThree((s) => s.viewport.dpr)
  const cfg = RELATIONS[type] ?? RELATIONS.positive

  const { position, aT, aOff } = useMemo(() => {
    const position = new Float32Array(count * 3) // required by three; real position is in the shader
    const aT = new Float32Array(count)
    const aOff = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      aT[i] = Math.random()
      aOff.set([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5], i * 3)
    }
    return { position, aT, aOff }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uA: { value: new THREE.Vector3() }, uB: { value: new THREE.Vector3() }, uC: { value: new THREE.Vector3() },
      uTime: { value: 0 }, uSpeed: { value: 0.15 }, uWidth: { value: 0.15 }, uPulse: { value: 0 },
      uSize: { value: 45 }, uDpr: { value: 1 }, uColor: { value: new THREE.Color() },
    }),
    []
  )

  useFrame(({ clock }) => {
    const from = refs.current[fromId], to = refs.current[toId]
    if (!from || !to) return
    const u = mat.current.uniforms
    from.getWorldPosition(u.uA.value)
    to.getWorldPosition(u.uB.value)
    // control point: midpoint lifted so beams arc instead of cutting through planets
    u.uC.value.copy(u.uA.value).add(u.uB.value).multiplyScalar(0.5)
    u.uC.value.y += u.uA.value.distanceTo(u.uB.value) * 0.2
    u.uTime.value = clock.elapsedTime
    u.uSpeed.value = cfg.speed
    u.uWidth.value = cfg.width
    u.uPulse.value = cfg.pulse
    u.uDpr.value = dpr
    u.uColor.value.set(cfg.color)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[position, 3]} />
        <bufferAttribute attach="attributes-aT" args={[aT, 1]} />
        <bufferAttribute attach="attributes-aOff" args={[aOff, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
