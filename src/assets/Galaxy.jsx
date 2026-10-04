import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, PerformanceMonitor } from '@react-three/drei'
import { AutoDrift, GalaxyBackdrop, GalaxyEffects } from './GalaxyBackdrop'
import * as THREE from 'three'
import Planet, { Orbit } from './Planet'
import RelationshipBeam from './RelationshipBeam'
import { useGalaxy } from './store'
import { ORBITS } from './constants'

export default function Galaxy() {
  const bodies = useGalaxy((s) => s.bodies)
  const selectedId = useGalaxy((s) => s.selectedId)
  const select = useGalaxy((s) => s.select)

  const refs = useRef({})       // id -> THREE.Group (world positions for the beams)
  const controls = useRef()
  const [dpr, setDpr] = useState(1)
  const register = useCallback((id, obj) => { refs.current[id] = obj }, [])

  const flyTo = useCallback((id) => {
    select(id)
    const o = refs.current[id]
    if (!o || !controls.current) return
    const p = o.getWorldPosition(new THREE.Vector3())
    controls.current.setLookAt(p.x + 2, p.y + 1.5, p.z + 4, p.x, p.y, p.z, true) // smooth transition
  }, [select])

  return (
    <Canvas dpr={dpr} camera={{ position: [0, 6, 22], fov: 50 }} onPointerMissed={() => select(null)}>
      <PerformanceMonitor flipflops={2} onFallback={() => setDpr(0.75)} onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))} />
      <color attach="background" args={['#02030a']} />
      <GalaxyBackdrop count={dpr < 1 ? 20000 : 40000} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 10, 6]} intensity={1.6} />

      {Object.keys(ORBITS).map((k) => <Orbit key={k} kind={k} />)}

      {bodies.map((b) => (
        <Planet key={b.id} body={b} register={register} onSelect={flyTo} selected={selectedId === b.id} />
      ))}

      {bodies.filter((b) => b.kind !== 'self').map((b) => (
        <RelationshipBeam key={b.id} refs={refs} fromId="me" toId={b.id} type={b.relation} />
      ))}

      <CameraControls ref={controls} makeDefault minDistance={3} maxDistance={40} />
      <AutoDrift controls={controls} paused={selectedId != null} />

      <GalaxyEffects />
    </Canvas>
  )
}
