import { useFrame } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { preuvePhare } from '../content/preuves'
import type { CompetenceId } from '../content/types'
import { jouerCoffre } from './sons'
import { axes } from './controles'
import { etat, useJeu } from './etat'
import { boutPonton, getIle, iles, LIMITE_MONDE, praticable } from './monde'

const VITESSE_MAX = 11
const VITESSE_RECUL = -4
const VITESSE_PIED = 5

// Boucle de jeu : physique du bateau, déplacement à pied, invites contextuelles.
export function Jeu({ bloque }: { bloque: boolean }) {
  const navigate = useNavigate()

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { phase, ile, proposer, accoster, embarquer } = useJeu.getState()
    if (bloque) {
      etat.bateau.vitesse *= 1 - 2 * dt
      proposer(null, null)
      return
    }
    const { avant, lateral } = axes()

    if (phase === 'bateau') {
      const b = etat.bateau
      if (avant > 0) b.vitesse += 7 * dt
      else if (avant < 0) b.vitesse -= 9 * dt
      b.vitesse *= 1 - 0.5 * dt
      b.vitesse = Math.max(VITESSE_RECUL, Math.min(VITESSE_MAX, b.vitesse))
      // on peut tourner lentement à l'arrêt, plus vite en avançant
      const sens = b.vitesse < -0.1 ? -1 : 1
      const virage = 1.5 * (0.35 + 0.65 * Math.min(1, Math.abs(b.vitesse) / 6)) * sens
      b.cap -= lateral * virage * dt
      b.x += Math.sin(b.cap) * b.vitesse * dt
      b.z += Math.cos(b.cap) * b.vitesse * dt

      for (const i of iles) {
        const dx = b.x - i.x
        const dz = b.z - i.z
        const d = Math.hypot(dx, dz)
        const min = i.rayon + 2.2
        if (d < min && d > 0) {
          b.x = i.x + (dx / d) * min
          b.z = i.z + (dz / d) * min
          b.vitesse *= 0.6
        }
      }
      const dc = Math.hypot(b.x, b.z)
      if (dc > LIMITE_MONDE) {
        b.x *= LIMITE_MONDE / dc
        b.z *= LIMITE_MONDE / dc
        b.vitesse *= 0.5
      }

      const proche = iles.find((i) => {
        const p = boutPonton(i, 1.8)
        return Math.hypot(b.x - p.x, b.z - p.z) < 5
      })
      if (proche) proposer(`Accoster : ${proche.nom}`, () => accoster(proche.id))
      else proposer(null, null)
      return
    }

    // À pied : déplacement relatif à la caméra (qui tourne autour de l'île)
    const courante = getIle(ile)
    if (!courante) return
    const j = etat.joueur
    const s = Math.sin(etat.camLacet)
    const c = Math.cos(etat.camLacet)
    let dx = -s * avant + c * lateral
    let dz = -c * avant - s * lateral
    const n = Math.hypot(dx, dz)
    if (n > 0) {
      dx = (dx / n) * VITESSE_PIED * dt
      dz = (dz / n) * VITESSE_PIED * dt
      if (praticable(courante, j.x + dx, j.z + dz)) {
        j.x += dx
        j.z += dz
      } else if (praticable(courante, j.x + dx, j.z)) j.x += dx
      else if (praticable(courante, j.x, j.z + dz)) j.z += dz
      j.angle = Math.atan2(dx, dz)
    }

    const lx = j.x - courante.x
    const lz = j.z - courante.z
    const surPonton = lx * courante.ponton.ux + lz * courante.ponton.uz > courante.rayon + 1.2
    if (surPonton) {
      proposer('Reprendre la mer', embarquer)
      return
    }
    // l'objet interactif le plus proche l'emporte (coffre ou panneau)
    const dPanneau = (p: { x: number; z: number }) => Math.hypot(j.x - p.x, j.z - p.z)
    const panneau = courante.panneaux.filter((p) => dPanneau(p) < 2).sort((a, b) => dPanneau(a) - dPanneau(b))[0]
    const coffre = courante.coffre && dPanneau(courante.coffre) < 2.1 ? courante.coffre : null
    if (coffre && (!panneau || dPanneau(coffre) <= dPanneau(panneau))) {
      const id = courante.id as CompetenceId
      const preuve = preuvePhare(id)
      const { coffresOuverts, ouvrirCoffre, afficherMessage } = useJeu.getState()
      if (coffresOuverts.includes(id)) {
        proposer(preuve ? `Revoir la preuve : ${preuve.titre}` : 'Coffre vide', () =>
          preuve ? navigate(`/${id}/${preuve.slug}`) : afficherMessage('Coffre vide.'),
        )
      } else {
        proposer('Ouvrir le coffre', () => {
          ouvrirCoffre(id)
          jouerCoffre()
          window.setTimeout(() => {
            if (preuve) navigate(`/${id}/${preuve.slug}`)
            else afficherMessage(`Coffre vide : preuve de ${courante.nom} à venir.`)
          }, 1100)
        })
      }
      return
    }
    if (panneau) {
      proposer(`Lire ${panneau.ac.code} : ${panneau.ac.libelle}`, () =>
        navigate(`/${courante.id}?ac=${panneau.ac.code}`),
      )
      return
    }
    if (Math.hypot(lx, lz) < 3.2) {
      const cible = courante.id === 'moi' ? '/moi' : `/${courante.id}`
      proposer(courante.id === 'moi' ? 'Lire ma présentation' : `Découvrir la compétence ${courante.nom}`, () =>
        navigate(cible),
      )
      return
    }
    proposer(null, null)
  })

  return null
}
