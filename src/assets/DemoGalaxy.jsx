import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, PerformanceMonitor } from '@react-three/drei'
import { AutoDrift, GalaxyBackdrop, GalaxyEffects } from './GalaxyBackdrop'
import * as THREE from 'three'
import Planet, { Orbit } from './Planet'
import RelationshipBeam from './RelationshipBeam'
import { ORBITS } from './constants'

// Sample bodies for the public landing page — deliberately not backed by the
// authenticated galaxy store, so guests see the visual without any API calls.
// Radii mirror the app's server-side size hierarchy (see BodySizing in wits-api).
const DEMO_BODIES = [
  { id: 'me', name: 'You', kind: 'self', sign: 'leo', radius: 1.3, color: '#3a6bff' },
  { id: 'sun', name: 'Mom', kind: 'family', role: 'sun', relation: 'love', sign: 'cancer',
    radius: 0.7, color: '#ffc24d', glow: true, angle: 0.4, speed: 0.10 },
  { id: 'moon', name: 'Dad', kind: 'family', role: 'moon', relation: 'positive', sign: 'virgo',
    radius: 0.55, color: '#c9ced8', angle: 2.3, speed: 0.13 },
  { id: 'f1', name: 'Alex', kind: 'friend', relation: 'positive', sign: 'gemini',
    radius: 0.35, color: '#e58fd0', angle: 1.0, speed: 0.07 },
  { id: 'w1', name: 'Boss', kind: 'work', relation: 'work', sign: 'capricorn',
    radius: 0.3, color: '#d9a441', angle: 3.6, speed: 0.05 },
  { id: 'a1', name: 'Neighbor', kind: 'acquaintance', relation: 'negative', sign: 'scorpio',
    radius: 0.22, color: '#9aa0a8', position: [-13, 3, -6] },
]


export default function DemoGalaxy() {
  const [selectedId, setSelectedId] = useState(null)
  const refs = useRef({})
  const controls = useRef()
  const [dpr, setDpr] = useState(1)
  const register = useCallback((id, obj) => { refs.current[id] = obj }, [])

  const flyTo = useCallback((id) => {
    setSelectedId(id)
    const o = refs.current[id]
    if (!o || !controls.current) return
    const p = o.getWorldPosition(new THREE.Vector3())
    controls.current.setLookAt(p.x + 2, p.y + 1.5, p.z + 4, p.x, p.y, p.z, true)
  }, [])

  return (
    <Canvas dpr={dpr} camera={{ position: [0, 6, 22], fov: 50 }} onPointerMissed={() => setSelectedId(null)}>
      <PerformanceMonitor flipflops={2} onFallback={() => setDpr(0.75)} onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))} />
      <color attach="background" args={['#02030a']} />
      <GalaxyBackdrop count={dpr < 1 ? 20000 : 40000} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 10, 6]} intensity={1.6} />

      {Object.keys(ORBITS).map((k) => <Orbit key={k} kind={k} />)}

      {DEMO_BODIES.map((b) => (
        <Planet key={b.id} body={b} register={register} onSelect={flyTo} selected={selectedId === b.id} />
      ))}

      {DEMO_BODIES.filter((b) => b.kind !== 'self').map((b) => (
        <RelationshipBeam key={b.id} refs={refs} fromId="me" toId={b.id} type={b.relation} />
      ))}

      <CameraControls ref={controls} makeDefault minDistance={3} maxDistance={40} />
      <AutoDrift controls={controls} paused={selectedId != null} />

      <GalaxyEffects />
    </Canvas>
  )
}
