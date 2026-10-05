import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type DirectionalLight } from 'three'
import { etat, useJeu } from './etat'
import { ambiance } from '../scene/cycle'
import { getIle } from './monde'

// Caméra à la troisième personne + lumière qui suit (pour garder des ombres nettes).
export function CameraSuivi() {
  const camera = useThree((s) => s.camera)
  const cible = useRef(new Vector3(0, 0, 0))
  const souhait = useRef(new Vector3())
  const regard = useRef(new Vector3())
  const lumiere = useRef<DirectionalLight>(null)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (useJeu.getState().phase === 'bateau') {
      const { x, z, cap, vitesse } = etat.bateau
      const fx = Math.sin(cap)
      const fz = Math.cos(cap)
      const recul = 17 + Math.max(0, vitesse) * 0.4
      souhait.current.set(x - fx * recul, 9 + Math.max(0, vitesse) * 0.2, z - fz * recul)
      regard.current.set(x + fx * 6, 0.5, z + fz * 6)
    } else {
      // la caméra se place côté mer, dans l'axe centre de l'île → joueur,
      // pour que le monument ne masque jamais le personnage
      const { x, z } = etat.joueur
      const ile = getIle(useJeu.getState().ile)
      if (ile) {
        const ox = x - ile.x
        const oz = z - ile.z
        if (Math.hypot(ox, oz) > 2.5) {
          const cible = Math.atan2(ox, oz)
          const ecart = Math.atan2(Math.sin(cible - etat.camLacet), Math.cos(cible - etat.camLacet))
          etat.camLacet += ecart * Math.min(1, dt * 1.2)
        }
      }
      souhait.current.set(x + Math.sin(etat.camLacet) * 10, 9, z + Math.cos(etat.camLacet) * 10)
      regard.current.set(x, 0.8, z)
    }
    const k = Math.min(1, dt * 2.5)
    camera.position.lerp(souhait.current, k)
    cible.current.lerp(regard.current, Math.min(1, dt * 4))
    camera.lookAt(cible.current)

    const l = lumiere.current
    if (l) {
      l.position.copy(cible.current).addScaledVector(ambiance.soleil, 40)
      l.color.copy(ambiance.lumiere)
      l.intensity = ambiance.direct
      l.target.position.copy(cible.current)
      l.target.updateMatrixWorld()
    }
  })

  return (
    <directionalLight
      ref={lumiere}
      castShadow
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-25}
      shadow-camera-right={25}
      shadow-camera-top={25}
      shadow-camera-bottom={-25}
    />
  )
}
