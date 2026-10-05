import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import type { IleId } from '../game/monde'
import { Modele } from '../game/Modeles'
import { ambiance } from './cycle'

// Repères en primitives : à remplacer par les modèles GLB (étape 4 du plan).

function Grue({ couleur }: { couleur: string }) {
  const fleche = useRef<Group>(null)
  useFrame((_, d) => {
    if (fleche.current) fleche.current.rotation.y += d * 0.4
  })
  return (
    <group>
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.4, 5, 0.4]} />
        <meshStandardMaterial color={couleur} />
      </mesh>
      <group ref={fleche} position={[0, 5, 0]}>
        <mesh position={[1.2, 0, 0]} castShadow>
          <boxGeometry args={[4, 0.3, 0.3]} />
          <meshStandardMaterial color={couleur} />
        </mesh>
        <mesh position={[3, -1, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>
      <Modele nom="caisse" position={[1.6, 0, -1.2]} rotation-y={0.4} scale={0.7} />
      <Modele nom="caisse" position={[1.7, 0.54, -1.1]} rotation-y={0.9} scale={0.6} />
      <Modele nom="pelle" position={[-0.8, 0, -1.5]} rotation-y={1.2} scale={0.9} />
      {/* écran CRT (clin d'œil henryheffernan.com) */}
      <mesh position={[-1.6, 0.7, 1]} castShadow>
        <boxGeometry args={[1.4, 1.1, 1.1]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[-1.6, 0.75, 1.56]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshStandardMaterial color="#173" emissive="#2f6" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function Engrenages({ couleur }: { couleur: string }) {
  const a = useRef<Mesh>(null)
  const b = useRef<Mesh>(null)
  useFrame((_, d) => {
    if (a.current) a.current.rotation.z += d * 0.8
    if (b.current) b.current.rotation.z -= d * 1.2
  })
  return (
    <group>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.8, 3.2, 8]} />
        <meshStandardMaterial color="#e8e2d0" />
      </mesh>
      <mesh position={[0, 3.6, 0]} castShadow>
        <sphereGeometry args={[1.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={couleur} />
      </mesh>
      <mesh ref={a} position={[1.6, 2.2, 1.2]} castShadow>
        <torusGeometry args={[0.8, 0.22, 6, 10]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={b} position={[2.5, 1.3, 1.2]} castShadow>
        <torusGeometry args={[0.5, 0.18, 6, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Village() {
  const flamme = useRef<Mesh>(null)
  const lueur = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    if (!flamme.current) return
    const s = 1 + Math.sin(clock.elapsedTime * 12) * 0.12
    flamme.current.scale.set(s, 1 + Math.sin(clock.elapsedTime * 9) * 0.2, s)
    ;(flamme.current.material as MeshStandardMaterial).emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 15) * 0.5 + ambiance.nuit * 2
    if (lueur.current) lueur.current.intensity = (4 + ambiance.nuit * 14) * (1 + Math.sin(clock.elapsedTime * 13) * 0.15)
  })
  // trois tentes tournées vers le feu de camp : l'équipe réunie
  const tentes: [number, number][] = [
    [2.1, 0],
    [-1.05, 1.8],
    [-1.05, -1.8],
  ]
  return (
    <group>
      {tentes.map(([x, z], i) => (
        <Modele key={i} nom="tente" position={[x, 0, z]} rotation-y={Math.atan2(-x, -z)} scale={3} />
      ))}
      <Modele nom="feuCamp" scale={4.5} />
      <Modele nom="rondins" position={[0.9, 0, 0.9]} rotation-y={0.8} scale={2.2} />
      <mesh ref={flamme} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.35, 0.9, 6]} />
        <meshStandardMaterial color="#ff8c1a" emissive="#ff5a00" emissiveIntensity={1.5} />
      </mesh>
      <pointLight ref={lueur} position={[0, 1, 0]} color="#ff8c3a" intensity={6} distance={9} decay={1.6} />
    </group>
  )
}

function Phare({ couleur }: { couleur: string }) {
  const faisceau = useRef<Group>(null)
  const lampe = useRef<MeshStandardMaterial>(null)
  const cone = useRef<MeshBasicMaterial>(null)
  useFrame((_, d) => {
    if (faisceau.current) faisceau.current.rotation.y += d * 1.5
    if (lampe.current) lampe.current.emissiveIntensity = 2 + ambiance.nuit * 4
    if (cone.current) cone.current.opacity = 0.12 + ambiance.nuit * 0.3
  })
  return (
    <group>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.8, 4, 12]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.5, 12]} />
        <meshStandardMaterial color={couleur} />
      </mesh>
      <Modele nom="rondins" position={[1.3, 0, 0.8]} rotation-y={0.5} scale={2} />
      <Modele nom="canon" position={[-1.3, 0, 0.9]} rotation-y={-0.6} scale={0.6} />
      <group ref={faisceau} position={[0, 4.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.45, 12, 8]} />
          <meshStandardMaterial ref={lampe} color="#fff6a0" emissive="#ffee55" emissiveIntensity={2} />
        </mesh>
        <mesh position={[2, 0, 0]} rotation-z={Math.PI / 2}>
          <coneGeometry args={[0.6, 4, 12, 1, true]} />
          <meshBasicMaterial ref={cone} color="#fff6a0" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

function Silos({ couleur }: { couleur: string }) {
  return (
    <group>
      <Modele nom="tonneau" position={[0.2, 0, 1.4]} scale={0.5} />
      <Modele nom="tonneau" position={[-0.6, 0, 1.6]} scale={0.45} />
      <Modele nom="caisseBouteilles" position={[1.9, 0, 0.6]} rotation-y={-0.5} scale={0.7} />
      {[-0.9, 0.9].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.7, 2.8, 14]} />
            <meshStandardMaterial color="#d9d9e3" />
          </mesh>
          {[0.6, 1.4, 2.2].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <torusGeometry args={[0.72, 0.06, 4, 16]} />
              <meshStandardMaterial color={couleur} />
            </mesh>
          ))}
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[0.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={couleur} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Port({ couleur }: { couleur: string }) {
  const barre = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (barre.current) barre.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.6
  })
  return (
    <group>
      <mesh position={[0, 0.15, 2.4]} castShadow>
        <boxGeometry args={[1.2, 0.2, 2.4]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <Modele nom="barque" position={[1.6, -0.35, 2.6]} rotation-y={0.3} scale={0.7} />
      <Modele nom="fanion" position={[-1, 0, -0.6]} scale={0.9} />
      <mesh ref={barre} position={[0, 1.5, 0.15]}>
        <torusGeometry args={[0.7, 0.08, 6, 8]} />
        <meshStandardMaterial color={couleur} />
      </mesh>
    </group>
  )
}

function Maison() {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[2, 1.8, 1.6]} />
        <meshStandardMaterial color="#fdf6e3" />
      </mesh>
      <mesh position={[0, 2.3, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[1.7, 1.1, 4]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[1.6, 1.8, 0.8]}>
        <cylinderGeometry args={[0.04, 0.04, 3.6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[2, 3.3, 0.8]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial color="#5b8def" side={2} />
      </mesh>
    </group>
  )
}

export function Landmark({ id, couleur }: { id: IleId; couleur: string }) {
  switch (id) {
    case 'realiser':
      return <Grue couleur={couleur} />
    case 'optimiser':
      return <Engrenages couleur={couleur} />
    case 'collaborer':
      return <Village />
    case 'administrer':
      return <Phare couleur={couleur} />
    case 'gerer':
      return <Silos couleur={couleur} />
    case 'conduire':
      return <Port couleur={couleur} />
    case 'moi':
      return <Maison />
  }
}
