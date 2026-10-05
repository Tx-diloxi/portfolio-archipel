import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ambiance } from '../scene/cycle'

// Halo au sol (dégradé radial additif) : donne l'impression d'une flaque de lumière
// sans le coût d'une vraie lumière dynamique.
let textureHalo: THREE.CanvasTexture | null = null
const halo = () => {
  if (textureHalo) return textureHalo
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,200,120,1)')
  g.addColorStop(0.4, 'rgba(255,170,80,0.45)')
  g.addColorStop(1, 'rgba(255,150,60,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  textureHalo = new THREE.CanvasTexture(c)
  textureHalo.colorSpace = THREE.SRGBColorSpace
  return textureHalo
}

interface Props {
  position?: [number, number, number]
  hauteurSol?: number // décalage du halo par rapport au pied de la lanterne
  lumiere?: boolean // vraie lumière ponctuelle (à réserver à peu d'objets)
  taille?: number
}

export function Lanterne({ position = [0, 0, 0], hauteurSol = 0, lumiere = false, taille = 1 }: Props) {
  const verre = useRef<THREE.MeshStandardMaterial>(null)
  const flaque = useRef<THREE.MeshBasicMaterial>(null)
  const point = useRef<THREE.PointLight>(null)
  const phase = useMemo(() => Math.random() * 10, [])

  useFrame(({ clock }) => {
    const n = ambiance.nuit
    const scintille = 1 + Math.sin(clock.elapsedTime * 9 + phase) * 0.06
    if (verre.current) verre.current.emissiveIntensity = (0.2 + n * 3.2) * scintille
    if (flaque.current) flaque.current.opacity = n * 0.55 * scintille
    if (point.current) point.current.intensity = n * 9 * scintille
  })

  return (
    <group position={position} scale={taille}>
      <mesh position-y={0.7} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.4, 6]} />
        <meshStandardMaterial color="#3d2a18" />
      </mesh>
      <mesh position-y={1.5}>
        <boxGeometry args={[0.26, 0.32, 0.26]} />
        <meshStandardMaterial ref={verre} color="#ffd9a0" emissive="#ffa040" emissiveIntensity={0.2} />
      </mesh>
      <mesh position-y={1.7}>
        <coneGeometry args={[0.22, 0.14, 4]} />
        <meshStandardMaterial color="#3d2a18" />
      </mesh>
      <mesh position-y={hauteurSol + 0.03} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial ref={flaque} map={halo()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {lumiere && <pointLight ref={point} position-y={1.5} color="#ffb060" intensity={0} distance={9} decay={1.6} />}
    </group>
  )
}
