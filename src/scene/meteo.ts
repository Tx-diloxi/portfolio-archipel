// Météo partagée par la scène (état muté à chaque frame, hors React).

export type Temps = 'degage' | 'nuageux' | 'pluie' | 'orage'

export const TEMPS: Record<Temps, { icone: string; nom: string }> = {
  degage: { icone: '☀️', nom: 'Dégagé' },
  nuageux: { icone: '⛅', nom: 'Nuageux' },
  pluie: { icone: '🌧️', nom: 'Pluie' },
  orage: { icone: '⛈️', nom: 'Orage' },
}
export const ORDRE: Temps[] = ['degage', 'nuageux', 'pluie', 'orage']

const CIBLES: Record<Temps, { couverture: number; pluie: number; orage: number; vent: number }> = {
  degage: { couverture: 0, pluie: 0, orage: 0, vent: 0.15 },
  nuageux: { couverture: 0.55, pluie: 0, orage: 0, vent: 0.35 },
  pluie: { couverture: 0.85, pluie: 0.7, orage: 0, vent: 0.55 },
  orage: { couverture: 1, pluie: 1, orage: 1, vent: 1 },
}

export const meteo = {
  temps: 'degage' as Temps,
  couverture: 0, // 0 ciel bleu → 1 ciel bouché
  pluie: 0, // intensité de la pluie
  orage: 0,
  vent: 0.15,
  houle: 1, // multiplicateur de la hauteur des vagues
  eclair: 0, // flash en cours (décroît rapidement)
  avantChangement: 75, // secondes avant le prochain changement automatique
}

// Abonnés au tonnerre (le son est géré ailleurs).
const auTonnerre = new Set<(distance: number) => void>()
export const ecouterTonnerre = (f: (distance: number) => void) => {
  auTonnerre.add(f)
  return () => auTonnerre.delete(f)
}

export function choisirTemps(t: Temps) {
  meteo.temps = t
  meteo.avantChangement = 80 + Math.random() * 80
}

const tirerTemps = (): Temps => {
  // pondéré : surtout du beau temps, parfois un orage
  const poids: [Temps, number][] = [
    ['degage', 0.4],
    ['nuageux', 0.3],
    ['pluie', 0.2],
    ['orage', 0.1],
  ]
  for (;;) {
    let r = Math.random()
    for (const [t, p] of poids) {
      if ((r -= p) <= 0) {
        if (t !== meteo.temps) return t
        break
      }
    }
  }
}

let secondFlash = 0

export function mettreAJourMeteo(dt: number) {
  meteo.avantChangement -= dt
  if (meteo.avantChangement <= 0) choisirTemps(tirerTemps())

  // transitions douces (~8 s)
  const cible = CIBLES[meteo.temps]
  const k = Math.min(1, dt / 8)
  meteo.couverture += (cible.couverture - meteo.couverture) * k
  meteo.pluie += (cible.pluie - meteo.pluie) * k
  meteo.orage += (cible.orage - meteo.orage) * k
  meteo.vent += (cible.vent - meteo.vent) * k
  meteo.houle = 1 + meteo.pluie * 0.25 + meteo.orage * 0.9

  // éclairs : double flash, puis tonnerre retardé selon la « distance »
  meteo.eclair = Math.max(0, meteo.eclair - dt * 5)
  if (secondFlash > 0) {
    secondFlash -= dt
    if (secondFlash <= 0) meteo.eclair = 0.8
  }
  if (meteo.orage > 0.6 && Math.random() < dt * 0.12) {
    meteo.eclair = 1
    secondFlash = 0.12 + Math.random() * 0.1
    const distance = 0.3 + Math.random() * 2.2
    window.setTimeout(() => auTonnerre.forEach((f) => f(distance)), distance * 1000)
  }
}
