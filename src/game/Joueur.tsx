import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { etat, useJeu } from './etat'
import { MODELES } from './Modeles'
import { HAUTEUR_SOL } from './monde'

// character-male-e (Kenney Mini Characters) : 0,67 de haut, animations idle / walk / sprint…
const ECHELLE = 2.4

function Personnage() {
  const groupe = useRef<Group>(null)
  const { scene, animations } = useGLTF(MODELES.personnage)
  const { actions } = useAnimations(animations, groupe)
  const enMarche = useRef(false)
  const precedent = useRef({ x: etat.joueur.x, z: etat.joueur.z })

  useEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) o.castShadow = true
    })
    actions.idle?.reset().play()
  }, [scene, actions])

  useFrame((_, dt) => {
    const g = groupe.current
    if (!g) return
    const { x, z, angle } = etat.joueur
    const vitesse = Math.hypot(x - precedent.current.x, z - precedent.current.z) / Math.max(dt, 1e-3)
    precedent.current = { x, z }
    g.position.set(x, HAUTEUR_SOL, z)
    // rotation lissée vers la direction de marche
    let d = angle - g.rotation.y
    d = Math.atan2(Math.sin(d), Math.cos(d))
    g.rotation.y += d * Math.min(1, dt * 12)

    const marche = vitesse > 0.5
    if (marche !== enMarche.current) {
      enMarche.current = marche
      const [de, vers] = marche ? [actions.idle, actions.walk] : [actions.walk, actions.idle]
      vers?.reset().fadeIn(0.2).play()
      de?.fadeOut(0.2)
    }
  })

  return (
    <group ref={groupe}>
      <primitive object={scene} scale={ECHELLE} />
    </group>
  )
}

export function Joueur() {
  const phase = useJeu((s) => s.phase)
  return phase === 'apied' ? <Personnage /> : null
}
