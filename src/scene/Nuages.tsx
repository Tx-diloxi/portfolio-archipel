import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial, type Group } from 'three'
import { ambiance } from './cycle'
import { meteo } from './meteo'

// Nuages low-poly : grappes d'icosaèdres blancs qui dérivent lentement.
interface Nuage {
  x: number
  y: number
  z: number
  echelle: number
  boules: [number, number, number, number][] // x, y, z, rayon
}

const generer = (graine: number, nombre: number, hauteur: number, distance: number): Nuage[] => {
  let s = graine
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: nombre }, (_, i) => {
    const a = (i / nombre) * Math.PI * 2 + rnd() * 0.4
    const d = distance + rnd() * 55
    const n = 3 + Math.floor(rnd() * 3)
    return {
      x: Math.cos(a) * d,
      y: hauteur + rnd() * 10,
      z: Math.sin(a) * d,
      echelle: 1.5 + rnd() * 1.8,
      boules: Array.from({ length: n }, (_, k) => [(k - n / 2) * 1.6 + rnd(), rnd() * 0.6, rnd() * 1.2 - 0.6, 1.2 + rnd() * 1.1]),
    }
  })
}

export function Nuages() {
  const nuages = useMemo(() => generer(7, 14, 24, 45), [])
  const orageux = useMemo(() => generer(31, 22, 17, 15), [])
  const groupe = useRef<Group>(null)
  const banc = useRef<Group>(null)
  const materiau = useMemo(() => new MeshStandardMaterial({ flatShading: true, fog: false, emissiveIntensity: 0.45 }), [])

  useFrame((_, dt) => {
    if (groupe.current) groupe.current.rotation.y += dt * 0.004
    materiau.color.copy(ambiance.nuages)
    materiau.emissive.copy(ambiance.nuages).multiplyScalar(0.6)
    const b = banc.current
    if (b) {
      // le banc nuageux gonfle avec la couverture
      const k = Math.max(0, (meteo.couverture - 0.2) / 0.8)
      b.visible = k > 0.01
      b.scale.setScalar(0.4 + k * 0.6)
      b.position.y = (1 - k) * 12
      b.rotation.y += dt * 0.01 * (1 + meteo.vent * 3)
    }
  })

  const rendre = (liste: Nuage[]) =>
    liste.map((n, i) => (
      <group key={i} position={[n.x, n.y, n.z]} scale={n.echelle} rotation-y={i}>
        {n.boules.map(([x, y, z, r], k) => (
          <mesh key={k} position={[x, y, z]} scale={[r, r * 0.7, r]} material={materiau}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>
    ))

  return (
    <>
      <group ref={groupe}>{rendre(nuages)}</group>
      <group ref={banc}>{rendre(orageux)}</group>
    </>
  )
}
