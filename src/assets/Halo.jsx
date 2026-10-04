import * as THREE from 'three'
import { glowTexture } from './glow'

const noRaycast = () => null

// Soft glow plus a lens-flare cross, so each body reads as a coloured star like in the reference galaxy.
export default function Halo({ color, radius }) {
  return (
    <group>
      <sprite scale={[radius * 7, radius * 7, 1]} raycast={noRaycast}>
        <spriteMaterial map={glowTexture('soft')} color={color} transparent opacity={0.55}
          blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite scale={[radius * 5, radius * 5, 1]} raycast={noRaycast}>
        <spriteMaterial map={glowTexture('flare')} color={color} transparent opacity={0.7}
          blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}
