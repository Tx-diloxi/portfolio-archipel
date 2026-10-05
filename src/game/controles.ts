import { useEffect } from 'react'
import { etat } from './etat'

// e.code = position physique : KeyW/A/S/D correspondent à Z/Q/S/D sur AZERTY.
const touches = new Set<string>()

const HAUT = ['KeyW', 'ArrowUp']
const BAS = ['KeyS', 'ArrowDown']
const GAUCHE = ['KeyA', 'ArrowLeft']
const DROITE = ['KeyD', 'ArrowRight']

const presse = (codes: string[]) => codes.some((c) => touches.has(c))

export const axes = () => ({
  avant: (presse(HAUT) ? 1 : 0) - (presse(BAS) ? 1 : 0),
  lateral: (presse(DROITE) ? 1 : 0) - (presse(GAUCHE) ? 1 : 0),
})

export const declencherAction = () => etat.action?.()

// Pour les boutons tactiles
export const appuyer = (code: string, actif: boolean) => {
  if (actif) touches.add(code)
  else touches.delete(code)
}

const estChampOuBouton = (t: EventTarget | null) =>
  t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(t.tagName)

export function useControles(actif: boolean) {
  useEffect(() => {
    if (!actif) {
      touches.clear()
      return
    }
    const bas = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || (e.code === 'Space' && !estChampOuBouton(e.target))) {
        if (!e.repeat) declencherAction()
        e.preventDefault()
        return
      }
      if ([...HAUT, ...BAS, ...GAUCHE, ...DROITE].includes(e.code)) {
        touches.add(e.code)
        if (e.code.startsWith('Arrow')) e.preventDefault()
      }
    }
    const haut = (e: KeyboardEvent) => touches.delete(e.code)
    const perte = () => touches.clear()
    window.addEventListener('keydown', bas)
    window.addEventListener('keyup', haut)
    window.addEventListener('blur', perte)
    return () => {
      window.removeEventListener('keydown', bas)
      window.removeEventListener('keyup', haut)
      window.removeEventListener('blur', perte)
      touches.clear()
    }
  }, [actif])
}
