import { Color, Vector3 } from 'three'
import { meteo } from './meteo'

// Cycle jour / nuit partagé par toute la scène (état muté à chaque frame, hors React).
export const DUREE_JOUR = 480 // secondes pour 24 h de jeu

export const cycle = {
  heure: 10,
  cible: null as number | null, // avance rapide jusqu'à cette heure
}

interface Palette {
  h: number
  horizon: string
  zenith: string
  lumiere: string
  intensite: number
  cielAmbiant: string
  solAmbiant: string
  ambiant: number
  profond: string
  moyen: string
  lagon: string
  nuages: string
}

// Images clés de la journée, interpolées linéairement.
const NUIT: Omit<Palette, 'h'> = {
  horizon: '#1b2a4a', zenith: '#050a1a', lumiere: '#9db4ff', intensite: 0.5,
  cielAmbiant: '#3a4f80', solAmbiant: '#10182a', ambiant: 0.42,
  profond: '#04192e', moyen: '#0b3354', lagon: '#145a68', nuages: '#3a4560',
}
const AUBE: Omit<Palette, 'h'> = {
  horizon: '#f6b38a', zenith: '#5a78b8', lumiere: '#ffb27a', intensite: 1.4,
  cielAmbiant: '#f0c4b0', solAmbiant: '#4a4a50', ambiant: 0.8,
  profond: '#1d4f7a', moyen: '#3d7fa8', lagon: '#5cc2bd', nuages: '#ffd9c4',
}
const JOUR: Omit<Palette, 'h'> = {
  horizon: '#b4e0f0', zenith: '#4a9fe0', lumiere: '#fff0d4', intensite: 2.4,
  cielAmbiant: '#d4ecff', solAmbiant: '#4f7040', ambiant: 0.8,
  profond: '#0b4f7d', moyen: '#1c87b8', lagon: '#3fd0c4', nuages: '#ffffff',
}
const CREPUSCULE: Omit<Palette, 'h'> = {
  horizon: '#f08a5d', zenith: '#3d4f8f', lumiere: '#ff9a5c', intensite: 1.3,
  cielAmbiant: '#e8a890', solAmbiant: '#3a3040', ambiant: 0.8,
  profond: '#1a3f6a', moyen: '#3a6e98', lagon: '#4fa8a8', nuages: '#ffb894',
}

const CLES: Palette[] = [
  { h: 0, ...NUIT },
  { h: 5, ...NUIT },
  { h: 6.2, ...AUBE },
  { h: 7.8, ...JOUR },
  { h: 16.8, ...JOUR },
  { h: 17.9, ...CREPUSCULE },
  { h: 19.3, ...NUIT },
  { h: 24, ...NUIT },
]

const COULEURS = ['horizon', 'zenith', 'lumiere', 'cielAmbiant', 'solAmbiant', 'profond', 'moyen', 'lagon', 'nuages'] as const
type CleCouleur = (typeof COULEURS)[number]

// Valeurs courantes, lues par les composants dans leur useFrame.
export const ambiance = {
  ...(Object.fromEntries(COULEURS.map((c) => [c, new Color()])) as Record<CleCouleur, Color>),
  intensite: 1,
  direct: 1, // intensité effective de la lumière directionnelle (fondu au passage soleil ↔ lune)
  ambiant: 1,
  nuit: 0, // 0 = plein jour, 1 = pleine nuit (pour les lanternes, étoiles…)
  soleil: new Vector3(), // direction de l'astre qui éclaire (soleil le jour, lune la nuit)
  soleilVrai: new Vector3(), // direction du soleil, même sous l'horizon
}

const tmpA = new Color()
const tmpB = new Color()

export function mettreAJourCycle(dt: number) {
  if (cycle.cible !== null) {
    const reste = (cycle.cible - cycle.heure + 24) % 24
    const pas = Math.min(reste, dt * 6) // ~4 h de jeu par seconde
    cycle.heure = (cycle.heure + pas) % 24
    if (reste - pas < 0.01) cycle.cible = null
  } else {
    cycle.heure = (cycle.heure + (dt * 24) / DUREE_JOUR) % 24
  }

  const h = cycle.heure
  const i = CLES.findIndex((k) => k.h > h)
  const a = CLES[i - 1]
  const b = CLES[i]
  const t = (h - a.h) / (b.h - a.h)
  for (const c of COULEURS) ambiance[c].copy(tmpA.set(a[c])).lerp(tmpB.set(b[c]), t)
  ambiance.intensite = a.intensite + (b.intensite - a.intensite) * t
  ambiance.ambiant = a.ambiant + (b.ambiant - a.ambiant) * t

  // course du soleil : lever à l'est (6 h), zénith à midi, coucher à l'ouest (18 h)
  const angle = ((h - 6) / 12) * Math.PI
  ambiance.soleilVrai.set(Math.cos(angle), Math.sin(angle), 0.35).normalize()
  const hauteur = ambiance.soleilVrai.y
  ambiance.nuit = Math.min(1, Math.max(0, (0.12 - hauteur) / 0.3))
  // la nuit, la lune (opposée au soleil) prend le relais pour éclairer et projeter les ombres
  if (hauteur > 0.05) ambiance.soleil.copy(ambiance.soleilVrai)
  else ambiance.soleil.copy(ambiance.soleilVrai).negate().setY(Math.max(0.25, -hauteur))
  ambiance.soleil.normalize()
  const lisse = (a: number, b: number, x: number) => {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return k * k * (3 - 2 * k)
  }
  ambiance.direct = ambiance.intensite * (hauteur > 0.05 ? lisse(0.05, 0.16, hauteur) : lisse(0.05, -0.12, hauteur))
  appliquerMeteo()
}

// Ciel couvert : couleurs désaturées vers un gris de même luminosité, lumière tamisée.
const gris = new Color()
const desaturer = (c: Color, force: number, assombrir = 0.85) => {
  const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11
  c.lerp(gris.setRGB(l * assombrir, l * assombrir, l * assombrir * 1.06), force)
}

function appliquerMeteo() {
  const c = meteo.couverture
  if (c > 0.001) {
    const sombre = 1 - meteo.pluie * 0.2 - meteo.orage * 0.35 // l'orage assombrit nettement
    desaturer(ambiance.horizon, c * 0.75, 0.85 * sombre)
    desaturer(ambiance.zenith, c * 0.8, 0.95 * sombre)
    desaturer(ambiance.lumiere, c * 0.5)
    desaturer(ambiance.cielAmbiant, c * 0.6, 0.85 * sombre)
    desaturer(ambiance.profond, c * 0.45, 0.85 * sombre)
    desaturer(ambiance.moyen, c * 0.5, 0.85 * sombre)
    desaturer(ambiance.lagon, c * 0.55, 0.85 * sombre)
    desaturer(ambiance.nuages, c * 0.9, 0.55 + 0.3 * (1 - meteo.orage))
    ambiance.direct *= 1 - 0.72 * c
    ambiance.ambiant *= 1 - 0.2 * c - 0.3 * meteo.orage
  }
  // éclair : la scène entière s'illumine un instant
  const e = meteo.eclair
  if (e > 0.001) {
    gris.setRGB(0.85, 0.9, 1)
    ambiance.horizon.lerp(gris, e * 0.6)
    ambiance.zenith.lerp(gris, e * 0.5)
    ambiance.nuages.lerp(gris, e * 0.7)
    ambiance.ambiant += e * 2.5
  }
}

export const formaterHeure = (h: number) =>
  `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`

export const estNuit = (h: number) => h < 6 || h >= 18.5

mettreAJourCycle(0)
