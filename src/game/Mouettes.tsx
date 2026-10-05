import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { iles } from './monde'

interface Vol {
  cx: number
  cz: number
  rayon: number
  hauteur: number
  vitesse: number
  phase: number
}

// Quelques mouettes qui tournent au-dessus des îles.
const VOLS: Vol[] = iles.slice(1).map((ile, i) => ({
  cx: ile.x,
  cz: ile.z,
  rayon: ile.rayon + 3 + (i % 3) * 1.5,
  hauteur: 9 + (i % 4),
  vitesse: (i % 2 ? 1 : -1) * (0.25 + (i % 3) * 0.06),
  phase: i * 1.7,
}))

function Mouette({ vol }: { vol: Vol }) {
  const corps = useRef<Group>(null)
  const aileG = useRef<Group>(null)
  const aileD = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const a = vol.phase + t * vol.vitesse
    const g = corps.current
    if (!g) return
    g.position.set(vol.cx + Math.cos(a) * vol.rayon, vol.hauteur + Math.sin(t * 0.8 + vol.phase) * 0.6, vol.cz + Math.sin(a) * vol.rayon)
    // orientée dans le sens du vol, légèrement penchée dans le virage
    g.rotation.set(0, -a + (vol.vitesse > 0 ? 0 : Math.PI), vol.vitesse > 0 ? 0.25 : -0.25)
    const battement = Math.sin(t * 7 + vol.phase) * 0.5
    if (aileG.current) aileG.current.rotation.z = 0.2 + battement
    if (aileD.current) aileD.current.rotation.z = -0.2 - battement
  })

  return (
    <group ref={corps} scale={0.7}>
      <mesh rotation-x={Math.PI / 2}>
        <capsuleGeometry args={[0.18, 0.6, 3, 6]} />
        <meshStandardMaterial color="#f7f7f7" />
      </mesh>
      <mesh position={[0, 0.05, 0.5]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.06, 0.25, 4]} />
        <meshStandardMaterial color="#f2a33a" />
      </mesh>
      <group ref={aileG} position={[0.15, 0.05, 0]}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 0.38]} />
          <meshStandardMaterial color="#e9ecef" />
        </mesh>
        <mesh position={[1.05, 0.01, 0]}>
          <boxGeometry args={[0.2, 0.045, 0.3]} />
          <meshStandardMaterial color="#3d3d3d" />
        </mesh>
      </group>
      <group ref={aileD} position={[-0.15, 0.05, 0]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 0.38]} />
          <meshStandardMaterial color="#e9ecef" />
        </mesh>
        <mesh position={[-1.05, 0.01, 0]}>
          <boxGeometry args={[0.2, 0.045, 0.3]} />
          <meshStandardMaterial color="#3d3d3d" />
        </mesh>
      </group>
    </group>
  )
}

export function Mouettes() {
  return (
    <group>
      {VOLS.map((v, i) => (
        <Mouette key={i} vol={v} />
      ))}
    </group>
  )
}
