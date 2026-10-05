import { competences } from '../content/competences'
import type { ApprentissageCritique, CompetenceId } from '../content/types'
import { meteo } from '../scene/meteo'

export type IleId = CompetenceId | 'moi'

export interface Panneau {
  ac: ApprentissageCritique
  x: number
  z: number
  angle: number
}

export interface Ile {
  id: IleId
  nom: string
  couleur: string
  niveau: 2 | 3 | null
  x: number
  z: number
  rayon: number
  ponton: { ux: number; uz: number } // direction (unitaire) du ponton depuis le centre
  panneaux: Panneau[]
  coffre: { x: number; z: number; angle: number } | null // coffre à preuve (îles de compétence)
}

const RAYON_ARCHIPEL = 34
export const LIMITE_MONDE = 62
export const HAUTEUR_SOL = 0.45

const creerIle = (
  base: Omit<Ile, 'ponton' | 'panneaux' | 'coffre'>,
  acs: ApprentissageCritique[],
): Ile => {
  // le ponton pointe vers le centre de l'archipel (ou vers +z pour l'îlot central)
  const d = Math.hypot(base.x, base.z)
  const ux = d > 0 ? -base.x / d : 0
  const uz = d > 0 ? -base.z / d : 1
  const anglePonton = Math.atan2(ux, uz)
  const n = acs.length
  const panneaux = acs.map((ac, k) => {
    // répartis sur la moitié opposée au ponton
    const a = anglePonton + Math.PI * (0.45 + (1.1 * k) / Math.max(1, n - 1))
    const r = base.rayon * 0.58
    const x = base.x + Math.sin(a) * r
    const z = base.z + Math.cos(a) * r
    return { ac, x, z, angle: a + Math.PI }
  })
  // coffre sur le côté, entre le ponton et les panneaux, tourné vers le centre de l'île
  const ac = anglePonton + 0.95
  const coffre =
    base.id === 'moi'
      ? null
      : {
          x: base.x + Math.sin(ac) * base.rayon * 0.62,
          z: base.z + Math.cos(ac) * base.rayon * 0.62,
          angle: ac + Math.PI,
        }
  return { ...base, ponton: { ux, uz }, panneaux, coffre }
}

export const iles: Ile[] = [
  creerIle({ id: 'moi', nom: 'Moi & alternance', couleur: '#ffffff', niveau: null, x: 0, z: 0, rayon: 5 }, []),
  ...competences.map((c, i) => {
    const angle = (i / competences.length) * Math.PI * 2 - Math.PI / 2
    return creerIle(
      {
        id: c.id,
        nom: c.nom,
        couleur: c.couleur,
        niveau: c.niveau,
        x: Math.cos(angle) * RAYON_ARCHIPEL,
        z: Math.sin(angle) * RAYON_ARCHIPEL,
        rayon: c.niveau === 3 ? 7.5 : 5.8,
      },
      c.acs,
    )
  }),
]

export const getIle = (id: string | null | undefined) => iles.find((i) => i.id === id)

// Bout du ponton (sur les planches) et point d'amarrage du bateau.
export const boutPonton = (ile: Ile, marge = 0) => ({
  x: ile.x + ile.ponton.ux * (ile.rayon + 2.4 + marge),
  z: ile.z + ile.ponton.uz * (ile.rayon + 2.4 + marge),
})

// Zones praticables à pied : le plateau de l'île (hors monument) et le ponton.
export const praticable = (ile: Ile, x: number, z: number) => {
  const lx = x - ile.x
  const lz = z - ile.z
  const d = Math.hypot(lx, lz)
  if (d < 2) return false
  if (ile.coffre && Math.hypot(x - ile.coffre.x, z - ile.coffre.z) < 0.9) return false
  if (d < ile.rayon * 0.82) return true
  const t = lx * ile.ponton.ux + lz * ile.ponton.uz
  const lat = Math.abs(-lx * ile.ponton.uz + lz * ile.ponton.ux)
  return t > ile.rayon * 0.6 && t < ile.rayon + 2.8 && lat < 0.75
}

// Même formule que le vertex shader de l'océan, pour faire tanguer le bateau.
export const hauteurVague = (x: number, z: number, t: number) => {
  const y = -z
  return (
    (Math.sin(x * 0.18 + t * 0.8) * 0.25 +
      Math.sin(y * 0.23 + t * 0.6) * 0.2 +
      Math.sin((x + y) * 0.4 + t * 1.3) * 0.08) *
    meteo.houle
  )
}
