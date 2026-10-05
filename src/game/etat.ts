import { create } from 'zustand'
import { getIle, type IleId } from './monde'

// État « chaud » muté à chaque frame, hors React (pas de re-rendu).
export const etat = {
  bateau: { x: 0, z: 13, cap: Math.PI, vitesse: 0 }, // avant du bateau = (sin cap, cos cap)
  joueur: { x: 0, z: 0, angle: 0 },
  camLacet: 0, // à pied : la caméra est placée en (sin, cos)(camLacet) par rapport au joueur
  action: null as null | (() => void), // ce que fait la touche E en ce moment
}

export type Phase = 'bateau' | 'apied'

interface JeuState {
  phase: Phase
  ile: IleId | null // île sur laquelle on se trouve à pied
  invite: string | null
  visitees: IleId[]
  coffresOuverts: IleId[]
  message: string | null
  son: boolean
  ouvrirCoffre: (id: IleId) => void
  afficherMessage: (texte: string) => void
  basculerSon: () => void
  proposer: (texte: string | null, action: (() => void) | null) => void
  accoster: (id: IleId) => void
  embarquer: () => void
}

export const useJeu = create<JeuState>((set, get) => ({
  phase: 'bateau',
  ile: null,
  invite: null,
  visitees: [],
  coffresOuverts: [],
  message: null,
  son: false,
  ouvrirCoffre: (id) => {
    if (!get().coffresOuverts.includes(id)) set({ coffresOuverts: [...get().coffresOuverts, id] })
  },
  afficherMessage: (texte) => {
    set({ message: texte })
    window.setTimeout(() => get().message === texte && set({ message: null }), 3500)
  },
  basculerSon: () => set({ son: !get().son }),
  proposer: (texte, action) => {
    etat.action = action
    if (get().invite !== texte) set({ invite: texte })
  },
  accoster: (id) => {
    const ile = getIle(id)
    if (!ile) return
    const t = ile.rayon + 1.8
    etat.joueur.x = ile.x + ile.ponton.ux * t
    etat.joueur.z = ile.z + ile.ponton.uz * t
    etat.joueur.angle = Math.atan2(-ile.ponton.ux, -ile.ponton.uz)
    etat.camLacet = Math.atan2(ile.ponton.ux, ile.ponton.uz)
    etat.bateau.vitesse = 0
    const visitees = get().visitees.includes(id) ? get().visitees : [...get().visitees, id]
    set({ phase: 'apied', ile: id, visitees })
  },
  embarquer: () => {
    const ile = getIle(get().ile)
    if (ile) {
      etat.bateau.x = ile.x + ile.ponton.ux * (ile.rayon + 5)
      etat.bateau.z = ile.z + ile.ponton.uz * (ile.rayon + 5)
      etat.bateau.cap = Math.atan2(ile.ponton.ux, ile.ponton.uz)
      etat.bateau.vitesse = 0
    }
    set({ phase: 'bateau', ile: null })
  },
}))
