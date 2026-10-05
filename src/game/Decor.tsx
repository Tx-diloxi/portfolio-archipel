import { useMemo } from 'react'
import { Modele, type NomModele } from './Modeles'
import { HAUTEUR_SOL, type Ile } from './monde'

interface Element {
  nom: NomModele
  x: number
  y: number
  z: number
  rot: number
  echelle: number
}

// Générateur pseudo-aléatoire déterministe : le décor est identique à chaque visite.
const aleatoire = (graine: string) => {
  let h = 2166136261
  for (const c of graine) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const PALMIERS: NomModele[] = ['palmier', 'palmierPenche', 'palmierCourbe']
const VEGETATION: [NomModele, number][] = [
  ['fleurRouge', 3],
  ['fleurJaune', 3],
  ['fleurViolette', 3],
  ['buisson', 3.5],
  ['petitBuisson', 3.5],
  ['herbe', 3],
  ['champignon', 2.5],
  ['caillou', 3],
]

const genererDecor = (ile: Ile): Element[] => {
  const rnd = aleatoire(ile.id)
  const { x: cx, z: cz, rayon: r } = ile
  const anglePonton = Math.atan2(ile.ponton.ux, ile.ponton.uz)
  const elements: Element[] = []
  const placer = (nom: NomModele, a: number, d: number, echelle: number, y = HAUTEUR_SOL) =>
    elements.push({ nom, x: cx + Math.sin(a) * d, y, z: cz + Math.cos(a) * d, rot: rnd() * Math.PI * 2, echelle })

  // palmiers sur la plage, en évitant le ponton
  const nbPalmiers = ile.niveau === 3 ? 6 : ile.niveau === 2 ? 5 : 3
  for (let k = 0; k < nbPalmiers; k++) {
    const a = anglePonton + 0.7 + ((Math.PI * 2 - 1.4) * (k + 0.2 + rnd() * 0.6)) / nbPalmiers
    placer(PALMIERS[k % PALMIERS.length], a, r * (0.88 + rnd() * 0.06), 0.7 + rnd() * 0.3, 0.2)
  }

  // rochers à fleur d'eau
  for (let k = 0; k < 3; k++) {
    const a = anglePonton + 1 + rnd() * (Math.PI * 2 - 2)
    placer(k % 2 ? 'rocherSable' : 'rocherSable2', a, r + 0.2 + rnd() * 0.6, 0.3 + rnd() * 0.2, -0.3)
  }

  // végétation basse sur l'herbe, hors des panneaux, du monument et de l'allée du ponton
  let essais = 0
  const nbPlantes = Math.round(r * 2)
  while (elements.length < nbPalmiers + 3 + nbPlantes && essais++ < 200) {
    const a = rnd() * Math.PI * 2
    const d = 2.6 + rnd() * (r * 0.78 - 2.6)
    const x = cx + Math.sin(a) * d
    const z = cz + Math.cos(a) * d
    if (ile.panneaux.some((p) => Math.hypot(p.x - x, p.z - z) < 1.4)) continue
    if (ile.coffre && Math.hypot(ile.coffre.x - x, ile.coffre.z - z) < 1.4) continue
    const lx = x - cx
    const lz = z - cz
    const t = lx * ile.ponton.ux + lz * ile.ponton.uz
    const lat = Math.abs(-lx * ile.ponton.uz + lz * ile.ponton.ux)
    if (t > 0 && lat < 1.3) continue
    const [nom, echelle] = VEGETATION[Math.floor(rnd() * VEGETATION.length)]
    placer(nom, a, d, echelle * (0.8 + rnd() * 0.4))
  }

  // tonneau et caisse au pied du ponton
  const base = r * 0.78
  const px = -ile.ponton.uz
  const pz = ile.ponton.ux
  elements.push({ nom: 'tonneau', x: cx + ile.ponton.ux * base + px * 1.4, y: HAUTEUR_SOL, z: cz + ile.ponton.uz * base + pz * 1.4, rot: 0.3, echelle: 0.55 })
  elements.push({ nom: 'caisse', x: cx + ile.ponton.ux * base - px * 1.4, y: HAUTEUR_SOL, z: cz + ile.ponton.uz * base - pz * 1.4, rot: anglePonton + 0.4, echelle: 0.75 })

  return elements
}

export function Decor({ ile }: { ile: Ile }) {
  const elements = useMemo(() => genererDecor(ile), [ile])
  return (
    <group>
      {elements.map((e, i) => (
        <Modele key={i} nom={e.nom} position={[e.x, e.y, e.z]} rotation-y={e.rot} scale={e.echelle} />
      ))}
    </group>
  )
}
