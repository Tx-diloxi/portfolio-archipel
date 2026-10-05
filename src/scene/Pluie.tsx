import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { reglerPluie } from '../game/sons'
import { ambiance } from './cycle'
import { meteo } from './meteo'

// Pluie : fines gouttes instanciées dans une boîte qui suit la caméra
// (positions « enroulées », donc fixes dans le monde quand on se déplace).
const N = 2600
const BOITE = { x: 60, y: 30, z: 60 }
const CLAIR = new THREE.Color('#e4eef8')

interface Goutte {
  x: number
  y: number
  z: number
  vitesse: number
  seuil: number // la goutte n'apparaît que si la pluie dépasse ce seuil
}

const enrouler = (v: number, centre: number, taille: number) =>
  centre + ((((v - centre + taille / 2) % taille) + taille) % taille) - taille / 2

export function Pluie() {
  const camera = useThree((s) => s.camera)
  const maillage = useRef<THREE.InstancedMesh>(null)
  const materiau = useRef<THREE.MeshBasicMaterial>(null)
  const gouttes = useMemo<Goutte[]>(
    () =>
      Array.from({ length: N }, () => ({
        x: Math.random() * BOITE.x,
        y: Math.random() * BOITE.y,
        z: Math.random() * BOITE.z,
        vitesse: 22 + Math.random() * 10,
        seuil: Math.random(),
      })),
    [],
  )
  const outil = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    const m = maillage.current
    reglerPluie(meteo.pluie)
    if (!m) return
    m.visible = meteo.pluie > 0.01
    if (!m.visible) return
    const dt = Math.min(delta, 0.05)
    const { x: cx, y: cy, z: cz } = camera.position
    const inclinaison = meteo.vent * 0.4
    for (let i = 0; i < N; i++) {
      const g = gouttes[i]
      g.y -= g.vitesse * dt
      g.x -= g.vitesse * dt * inclinaison
      if (g.y < -1) g.y += BOITE.y
      const visible = g.seuil < meteo.pluie
      outil.position.set(enrouler(g.x, cx, BOITE.x), g.y + cy - 10, enrouler(g.z, cz, BOITE.z))
      outil.rotation.set(0, 0, inclinaison)
      outil.scale.set(1, visible ? 1 + meteo.vent * 0.5 : 0, 1)
      outil.updateMatrix()
      m.setMatrixAt(i, outil.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    // gouttes claires, bleutées la nuit, blanches pendant un éclair
    materiau.current?.color.copy(ambiance.horizon).lerp(CLAIR, 0.7 + meteo.eclair * 0.3)
  })

  return (
    <instancedMesh ref={maillage} args={[undefined, undefined, N]} frustumCulled={false}>
      <boxGeometry args={[0.025, 1.1, 0.025]} />
      <meshBasicMaterial ref={materiau} transparent opacity={0.55} depthWrite={false} fog={false} />
    </instancedMesh>
  )
}
