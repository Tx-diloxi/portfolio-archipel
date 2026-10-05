import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { etat, useJeu } from './etat'
import { hauteurVague } from './monde'

// Deux groupes de dauphins low-poly : l'un fait le tour de l'archipel, l'autre vient
// nager à côté du bateau quand il file assez vite. Ils sautent en arc à intervalles
// réguliers et laissent des éclaboussures en touchant l'eau.

const PERIODE_SAUT = 4.6
const PART_SAUT = 0.24 // fraction de la période passée hors de l'eau
const HAUTEUR_SAUT = 2.1

interface Groupe {
  x: number
  z: number
  cap: number
  vitesse: number
  angleOrbite: number
  rayonOrbite: number
  sens: 1 | -1
  suitBateau: boolean
}

const OFFSETS: [number, number, number][] = [
  // [recul, côté, déphasage du saut]
  [0, 0, 0],
  [2.4, 1.6, 0.35],
  [2.8, -1.5, 0.7],
]

function Dauphin({ refGroupe }: { refGroupe: (g: THREE.Group | null) => void }) {
  const queue = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (queue.current) queue.current.rotation.x = Math.sin(clock.elapsedTime * 7) * 0.35
  })
  return (
    <group ref={refGroupe} rotation-order="YXZ">
      <mesh scale={[0.42, 0.4, 1.25]} castShadow>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#6a8aa3" flatShading roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.12, 0.05]} scale={[0.34, 0.28, 1.05]}>
        <sphereGeometry args={[1, 10, 6]} />
        <meshStandardMaterial color="#dde6ec" flatShading />
      </mesh>
      <mesh position={[0, -0.06, 1.38]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.12, 0.45, 6]} />
        <meshStandardMaterial color="#6a8aa3" flatShading />
      </mesh>
      {/* aileron dorsal : c'est lui qu'on voit fendre la surface */}
      <mesh position={[0, 0.48, -0.15]} rotation-x={-0.55} scale={[0.22, 1, 1]}>
        <coneGeometry args={[0.28, 0.6, 3]} />
        <meshStandardMaterial color="#58768d" flatShading />
      </mesh>
      {[-1, 1].map((c) => (
        <mesh key={c} position={[c * 0.42, -0.2, 0.45]} rotation={[0.3, 0, c * 0.9]} scale={[0.5, 0.05, 0.22]}>
          <boxGeometry />
          <meshStandardMaterial color="#58768d" flatShading />
        </mesh>
      ))}
      <group ref={queue} position={[0, 0, -1.2]}>
        <mesh position={[0, 0, -0.25]} scale={[0.16, 0.18, 0.5]}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial color="#6a8aa3" flatShading />
        </mesh>
        <mesh position={[0, 0, -0.62]} scale={[1.05, 0.05, 0.34]}>
          <boxGeometry />
          <meshStandardMaterial color="#58768d" flatShading />
        </mesh>
      </group>
    </group>
  )
}

// Anneaux d'écume aux points d'entrée et de sortie de l'eau.
const NB_ANNEAUX = 10
function useEclaboussures() {
  const anneaux = useRef<(THREE.Mesh | null)[]>([])
  const etats = useMemo(() => Array.from({ length: NB_ANNEAUX }, () => ({ age: 9, x: 0, z: 0 })), [])
  const suivant = useRef(0)
  const lancer = (x: number, z: number) => {
    const e = etats[suivant.current]
    suivant.current = (suivant.current + 1) % NB_ANNEAUX
    Object.assign(e, { age: 0, x, z })
  }
  const animer = (dt: number, t: number) => {
    etats.forEach((e, i) => {
      const m = anneaux.current[i]
      if (!m) return
      e.age += dt
      const k = e.age / 1.1
      m.visible = k < 1
      if (!m.visible) return
      m.position.set(e.x, hauteurVague(e.x, e.z, t) - 0.3, e.z)
      m.scale.setScalar(0.6 + k * 3)
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8
    })
  }
  const rendu = (
    <>
      {etats.map((_, i) => (
        <mesh key={i} ref={(m) => (anneaux.current[i] = m)} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.35, 0.6, 20]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
  return { lancer, animer, rendu }
}

export function Dauphins() {
  const groupes = useMemo<Groupe[]>(
    () =>
      (
        [
          [0.4, 49, 1, false],
          [3.4, 56, -1, true],
        ] as const
      ).map(([angleOrbite, rayonOrbite, sens, suitBateau]) => ({
        // départ directement sur l'orbite, déjà lancés
        x: Math.cos(angleOrbite) * rayonOrbite,
        z: Math.sin(angleOrbite) * rayonOrbite,
        cap: Math.atan2(-Math.sin(angleOrbite) * sens, Math.cos(angleOrbite) * sens),
        vitesse: 6,
        angleOrbite,
        rayonOrbite,
        sens,
        suitBateau,
      })),
    [],
  )
  const dauphins = useRef<(THREE.Group | null)[]>([])
  const dansLEau = useRef<boolean[]>([])
  const { lancer, animer, rendu } = useEclaboussures()
  const cible = useMemo(() => new THREE.Vector2(), [])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = clock.elapsedTime
    const b = etat.bateau
    const enMer = useJeu.getState().phase === 'bateau'

    groupes.forEach((g, gi) => {
      // cible : le bateau (à tribord, un peu en avant) ou un point de l'orbite
      const accompagne = g.suitBateau && enMer && b.vitesse > 4
      if (accompagne) {
        const fx = Math.sin(b.cap)
        const fz = Math.cos(b.cap)
        cible.set(b.x + fx * 4 - fz * 3.8, b.z + fz * 4 + fx * 3.8)
      } else {
        g.angleOrbite += ((g.sens * 6) / g.rayonOrbite) * dt
        cible.set(Math.cos(g.angleOrbite) * g.rayonOrbite, Math.sin(g.angleOrbite) * g.rayonOrbite)
      }
      const dx = cible.x - g.x
      const dz = cible.y - g.z
      const dist = Math.hypot(dx, dz)
      const vMax = accompagne ? Math.max(b.vitesse + 3, 9) : 7
      const v = Math.min(vMax, dist * 1.5)
      g.vitesse += (v - g.vitesse) * Math.min(1, dt * 2)
      if (dist > 0.01) {
        const capVise = Math.atan2(dx, dz)
        const ecart = Math.atan2(Math.sin(capVise - g.cap), Math.cos(capVise - g.cap))
        g.cap += ecart * Math.min(1, dt * 3)
        g.x += Math.sin(g.cap) * g.vitesse * dt
        g.z += Math.cos(g.cap) * g.vitesse * dt
      }

      OFFSETS.forEach(([recul, cote, dephasage], k) => {
        const i = gi * OFFSETS.length + k
        const d = dauphins.current[i]
        if (!d) return
        const fx = Math.sin(g.cap)
        const fz = Math.cos(g.cap)
        const x = g.x - fx * recul + fz * cote
        const z = g.z - fz * recul - fx * cote
        const surface = hauteurVague(x, z, t) - 0.4
        // cycle de nage : surtout en surface (aileron visible), puis un saut en arc
        const u = (((t / PERIODE_SAUT + dephasage + gi * 0.5) % 1) + 1) % 1
        const saute = g.vitesse > 2 && u < PART_SAUT
        let y: number
        let tangage: number
        if (saute) {
          const s = u / PART_SAUT
          y = surface - 0.2 + HAUTEUR_SAUT * Math.sin(Math.PI * s)
          tangage = -Math.cos(Math.PI * s) * 0.85
        } else {
          y = surface - 0.38 + Math.sin(t * 2.2 + i) * 0.06
          tangage = Math.sin(t * 2.2 + i) * 0.08
        }
        // éclaboussure à chaque passage de la surface
        const sousLEau = y < surface - 0.1
        if (dansLEau.current[i] !== undefined && dansLEau.current[i] !== sousLEau && saute) lancer(x, z)
        dansLEau.current[i] = sousLEau
        d.position.set(x, y, z)
        d.rotation.set(tangage, g.cap, Math.sin(t * 1.5 + i) * 0.08)
      })
    })
    animer(dt, t)
  })

  return (
    <group>
      {groupes.flatMap((_, gi) =>
        OFFSETS.map((__, k) => {
          const i = gi * OFFSETS.length + k
          return <Dauphin key={i} refGroupe={(g) => (dauphins.current[i] = g)} />
        }),
      )}
      {rendu}
    </group>
  )
}
