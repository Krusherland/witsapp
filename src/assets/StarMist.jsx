import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertex = /* glsl */ `
  uniform float uTime, uSize, uDpr;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float a = uTime * (0.05 + aSeed * 0.15);       // slow swirl around the planet
    float c = cos(a), s = sin(a);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p.y += sin(uTime * 0.6 + aSeed * 40.0) * 0.03; // gentle bobbing
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + aSeed * 60.0);
    gl_PointSize = uSize * uDpr * (0.5 + aSeed) * twinkle / -mv.z;
    vAlpha = twinkle * (0.35 + 0.65 * aSeed);
    gl_Position = projectionMatrix * mv;
  }
`
const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;   // soft round sprite
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`

export default function StarMist({ radius = 1, color = '#fff', count = 350, size = 60 }) {
  const mat = useRef()
  const dpr = useThree((s) => s.viewport.dpr)

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // random direction, denser near the planet, slightly flattened
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2
      const r = radius * (1.35 + Math.pow(Math.random(), 1.6) * 2.2)
      const k = Math.sqrt(1 - u * u)
      positions.set([r * k * Math.cos(th), r * u * 0.6, r * k * Math.sin(th)], i * 3)
      seeds[i] = Math.random()
    }
    return { positions, seeds }
  }, [count, radius])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: size }, uDpr: { value: 1 }, uColor: { value: new THREE.Color(color) } }),
    [] // eslint-disable-line
  )

  useFrame(({ clock }) => {
    const u = mat.current.uniforms
    u.uTime.value = clock.elapsedTime
    u.uDpr.value = dpr
    u.uColor.value.set(color)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
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
