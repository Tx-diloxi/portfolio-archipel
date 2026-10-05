import { create } from 'zustand'

type Mode = '3d' | '2d'

const webglDisponible = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const mouvementReduit = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

const modeInitial = (): Mode => {
  if (new URLSearchParams(window.location.search).has('2d')) return '2d'
  return webglDisponible() && !mouvementReduit() ? '3d' : '2d'
}

interface PortfolioState {
  mode: Mode
  entre: boolean // a passé l'écran d'accueil
  basculeAuto: boolean // repli 2D déclenché par manque de performances
  setMode: (mode: Mode) => void
  entrer: () => void
  replierPourPerf: () => void
}

export const usePortfolio = create<PortfolioState>((set) => ({
  mode: modeInitial(),
  entre: false,
  basculeAuto: false,
  setMode: (mode) => set({ mode, entre: true }),
  entrer: () => set({ entre: true }),
  replierPourPerf: () => set({ mode: '2d', basculeAuto: true }),
}))
