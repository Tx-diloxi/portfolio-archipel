import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { LoopOnce, type Group, type Mesh } from 'three'
import { clone as clonerSquelette } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { useJeu } from './etat'
import { avecOmbres, MODELES } from './Modeles'
import { HAUTEUR_SOL, type Ile } from './monde'

// Coffre au trésor (animation « open » du Pirate Kit) qui renferme une preuve.
export function Coffre({ ile }: { ile: Ile }) {
  const { scene, animations } = useGLTF(MODELES.coffre)
  const objet = useMemo(() => avecOmbres(clonerSquelette(scene)), [scene])
  const racine = useRef<Group>(null)
  const eclat = useRef<Mesh>(null)
  const { actions } = useAnimations(animations, racine)
  const ouvert = useJeu((s) => s.coffresOuverts.includes(ile.id))

  useEffect(() => {
    const a = actions.open
    if (!a || !ouvert) return
    a.setLoop(LoopOnce, 1)
    a.clampWhenFinished = true
    a.reset().play()
  }, [ouvert, actions])

  // étincelle dorée au-dessus des coffres encore fermés
  useFrame(({ clock }) => {
    const e = eclat.current
    if (!e) return
    e.visible = !ouvert
    e.rotation.y = clock.elapsedTime * 2
    e.position.y = 1.6 + Math.sin(clock.elapsedTime * 3) * 0.15
  })

  if (!ile.coffre) return null
  return (
    <group position={[ile.coffre.x, HAUTEUR_SOL, ile.coffre.z]} rotation-y={ile.coffre.angle}>
      <group ref={racine}>
        <primitive object={objet} />
      </group>
      <mesh ref={eclat}>
        <octahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffb300" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}
