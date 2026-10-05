import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import type { Mesh, Object3D } from 'three'

// Modèles Kenney (CC0) : Pirate Kit, Nature Kit, Mini Characters — voir public/models/
const B = `${import.meta.env.BASE_URL}models/`

export const MODELES = {
  bateau: `${B}pirate/ship-small.glb`,
  palmier: `${B}pirate/palm-detailed-straight.glb`,
  palmierPenche: `${B}pirate/palm-detailed-bend.glb`,
  palmierCourbe: `${B}pirate/palm-bend.glb`,
  rocherSable: `${B}pirate/rocks-sand-a.glb`,
  rocherSable2: `${B}pirate/rocks-sand-b.glb`,
  rocher: `${B}pirate/rocks-a.glb`,
  tonneau: `${B}pirate/barrel.glb`,
  caisse: `${B}pirate/crate.glb`,
  caisseBouteilles: `${B}pirate/crate-bottles.glb`,
  coffre: `${B}pirate/chest.glb`,
  fanion: `${B}pirate/flag-pennant.glb`,
  canon: `${B}pirate/cannon.glb`,
  pelle: `${B}pirate/tool-shovel.glb`,
  barque: `${B}pirate/boat-row-small.glb`,
  tourGuet: `${B}pirate/tower-watch.glb`,
  tente: `${B}nature/tent_detailedOpen.glb`,
  feuCamp: `${B}nature/campfire_stones.glb`,
  fleurRouge: `${B}nature/flower_redA.glb`,
  fleurJaune: `${B}nature/flower_yellowA.glb`,
  fleurViolette: `${B}nature/flower_purpleA.glb`,
  buisson: `${B}nature/plant_bush.glb`,
  petitBuisson: `${B}nature/plant_bushSmall.glb`,
  herbe: `${B}nature/grass_large.glb`,
  caillou: `${B}nature/rock_smallA.glb`,
  champignon: `${B}nature/mushroom_red.glb`,
  rondins: `${B}nature/log_stack.glb`,
  souche: `${B}nature/stump_round.glb`,
  pancarte: `${B}nature/sign.glb`,
  personnage: `${B}mini/character-male-e.glb`,
} as const

export type NomModele = keyof typeof MODELES

export const avecOmbres = (racine: Object3D) => {
  racine.traverse((o) => {
    if ((o as Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return racine
}

type Props = { nom: NomModele } & Omit<ThreeElements['group'], 'children'>

// Instance clonée d'un modèle statique (la géométrie et les matériaux restent partagés).
export function Modele({ nom, ...props }: Props) {
  const { scene } = useGLTF(MODELES[nom])
  const clone = useMemo(() => avecOmbres(scene.clone(true)), [scene])
  return (
    <group {...props}>
      <primitive object={clone} />
    </group>
  )
}

Object.values(MODELES).forEach((url) => useGLTF.preload(url))
