import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import StarMist from './StarMist'

function SpinningPlanet({ color }) {
  const mesh = useRef()
  useFrame((_, dt) => { mesh.current.rotation.y += dt * 0.25 })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.3, 64, 64]} />
      <meshStandardMaterial color={color} roughness={0.75} emissive={color} emissiveIntensity={0.18} />
    </mesh>
  )
}

// Small standalone preview (no orbit/store dependency) used while customizing the user's own planet.
export default function PlanetPreview({ color, mistColor }) {
  return (
    <Canvas camera={{ position: [0, 0.4, 4.6], fov: 45 }}>
      <color attach="background" args={['#02030a']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <SpinningPlanet color={color} />
      <StarMist radius={1.3} color={mistColor} count={500} />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.25} intensity={0.9} />
      </EffectComposer>
    </Canvas>
  )
}
