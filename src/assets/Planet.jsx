import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line, useTexture } from '@react-three/drei'
import StarMist from './StarMist'
import Halo from './Halo'
import { ORBITS, EXTINGUISHED_COLOR, SIGN_COLORS } from './constants'

export function Orbit({ kind }) {
  const { radius, squash, tilt } = ORBITS[kind]
  const points = useMemo(
    () => Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2
      return [Math.cos(a) * radius, 0, Math.sin(a) * radius * squash]
    }),
    [radius, squash]
  )
  return (
    <group rotation-x={tilt}>
      <Line points={points} color="#8fa3ff" transparent opacity={0.14} lineWidth={1} dashed dashSize={0.35} gapSize={0.25} />
    </group>
  )
}

function Textured({ url }) {
  const map = useTexture(url)
  return <meshStandardMaterial map={map} roughness={0.9} />
}

export default function Planet({ body, register, onSelect, selected }) {
  const group = useRef()
  const mesh = useRef()
  const angle = useRef(body.angle ?? 0)
  const [hovered, setHovered] = useState(false)
  const orbit = ORBITS[body.kind]

  useEffect(() => {
    register(body.id, group.current)
    return () => register(body.id, null)
  }, [body.id, register])

  useFrame((_, dt) => {
    if (orbit) {
      angle.current += (body.speed ?? 0.05) * dt
      group.current.position.set(
        Math.cos(angle.current) * orbit.radius, 0,
        Math.sin(angle.current) * orbit.radius * orbit.squash
      )
    }
    mesh.current.rotation.y += dt * 0.2
  })

  return (
    <group rotation-x={orbit?.tilt ?? 0}>
      <group ref={group} position={body.position ?? [0, 0, 0]}>
        <mesh
          ref={mesh}
          onClick={(e) => { e.stopPropagation(); onSelect(body.id) }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[body.radius, 48, 48]} />
          {body.texture ? (
            <Suspense fallback={null}><Textured url={body.texture} /></Suspense>
          ) : body.glow ? (
            <meshBasicMaterial
              color={body.relation === 'negative' ? EXTINGUISHED_COLOR : body.color}
              toneMapped={false}
            /> // sun: blooms, unless its relation went negative and it "lit off"
          ) : (
            <meshStandardMaterial color={body.color} roughness={0.8} emissive={body.color} emissiveIntensity={0.12} />
          )}
        </mesh>

        <Halo color={SIGN_COLORS[body.sign] ?? '#ffffff'} radius={body.radius} />
        <StarMist radius={body.radius} color={SIGN_COLORS[body.sign] ?? '#ffffff'} />

        {(hovered || selected) && (
          <Html center position={[0, body.radius + 0.5, 0]} style={{ pointerEvents: 'none' }}>
            <div className="hud-label">{body.name}</div>
          </Html>
        )}
      </group>
    </group>
  )
}
