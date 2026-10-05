import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { etat } from './etat'
import { Lanterne } from './Lanterne'
import { Modele } from './Modeles'
import { hauteurVague } from './monde'
import { meteo } from '../scene/meteo'

// ship-small (Kenney) : ~4,8 × 10 × 8,8 unités, proue vers +z
const ECHELLE = 0.5

export function Bateau() {
  const groupe = useRef<Group>(null)

  useFrame(({ clock }) => {
    const g = groupe.current
    if (!g) return
    const { x, z, cap, vitesse } = etat.bateau
    const t = clock.elapsedTime
    g.position.set(x, hauteurVague(x, z, t) * 0.8 - 0.35, z)
    const roulis = meteo.houle * meteo.houle
    g.rotation.set(Math.sin(t * 1.3) * 0.04 * roulis - vitesse * 0.006, cap, Math.sin(t * 1.1) * 0.06 * roulis)
  })

  return (
    <group ref={groupe}>
      <Modele nom="bateau" scale={ECHELLE} />
      {/* lanterne de poupe */}
      <Lanterne position={[0, 1.1, -1.9]} hauteurSol={-0.9} lumiere taille={0.8} />
    </group>
  )
}
