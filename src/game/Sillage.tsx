import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type InstancedMesh } from 'three'
import { etat, useJeu } from './etat'
import { hauteurVague } from './monde'

const N = 120
const VIE = 2.6
const ECUME = new Color('#ffffff')
const MER = new Color('#3a8fc0')

interface Particule {
  age: number
  x: number
  z: number
  vx: number
  vz: number
}

// Écume en V derrière la poupe : des disques qui s'élargissent et se fondent dans l'eau.
export function Sillage() {
  const maillage = useRef<InstancedMesh>(null)
  const particules = useMemo<Particule[]>(() => Array.from({ length: N }, () => ({ age: VIE, x: 0, z: 0, vx: 0, vz: 0 })), [])
  const prochain = useRef(0)
  const accumulateur = useRef(0)
  const outil = useMemo(() => new Object3D(), [])
  const couleur = useMemo(() => new Color(), [])

  useFrame(({ clock }, delta) => {
    const m = maillage.current
    if (!m) return
    const dt = Math.min(delta, 0.05)
    const { x, z, cap, vitesse } = etat.bateau
    const fx = Math.sin(cap)
    const fz = Math.cos(cap)

    accumulateur.current += dt
    if (useJeu.getState().phase === 'bateau' && Math.abs(vitesse) > 1.2 && accumulateur.current > 0.045) {
      accumulateur.current = 0
      for (const cote of [-1, 1]) {
        const p = particules[prochain.current]
        prochain.current = (prochain.current + 1) % N
        // poupe du bateau, puis dérive vers l'extérieur pour former le V
        p.age = 0
        p.x = x - fx * 2.2 + -fz * cote * 0.7
        p.z = z - fz * 2.2 + fx * cote * 0.7
        p.vx = -fz * cote * 0.9 - fx * 0.3
        p.vz = fx * cote * 0.9 - fz * 0.3
      }
    }

    const t = clock.elapsedTime
    particules.forEach((p, i) => {
      p.age += dt
      const vivant = p.age < VIE
      const k = Math.min(1, p.age / VIE)
      if (vivant) {
        p.x += p.vx * dt
        p.z += p.vz * dt
      }
      outil.position.set(p.x, hauteurVague(p.x, p.z, t) - 0.3, p.z)
      outil.rotation.set(-Math.PI / 2, 0, 0)
      outil.scale.setScalar(vivant ? 0.35 + k * 1.1 : 0)
      outil.updateMatrix()
      m.setMatrixAt(i, outil.matrix)
      m.setColorAt(i, couleur.copy(ECUME).lerp(MER, k))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={maillage} args={[undefined, undefined, N]} frustumCulled={false}>
      <circleGeometry args={[0.6, 10]} />
      <meshBasicMaterial transparent opacity={0.75} depthWrite={false} />
    </instancedMesh>
  )
}
