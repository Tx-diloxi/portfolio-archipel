import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useControles } from './game/controles'
import { Hud } from './game/Hud'
import { activerSon } from './game/sons'
import { usePortfolio } from './store'
import { Accueil, BarreNav } from './ui/Chrome'
import { CompetencePanel } from './ui/CompetencePanel'
import { ProfilPanel } from './ui/ProfilPanel'
import { ProofPage } from './ui/ProofPage'
import { QuickView2D } from './ui/QuickView2D'

// three.js n'est chargé que si la vue 3D est demandée : la version rapide reste légère.
const Experience = lazy(() => import('./scene/Experience').then((m) => ({ default: m.Experience })))

export default function App() {
  const { mode, entre } = usePortfolio()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const accueil = mode === '3d' && !entre && pathname === '/'
  const enJeu = mode === '3d' && !accueil
  // un panneau ouvert met le jeu en pause
  const bloque = !enJeu || pathname !== '/'

  useControles(!bloque)

  // la version rapide coupe l'ambiance sonore du jeu
  useEffect(() => {
    if (mode !== '3d') activerSon(false)
  }, [mode])

  useEffect(() => {
    if (mode !== '3d') return
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && navigate('/')
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [mode, navigate])

  return (
    <>
      {mode === '3d' && (
        <Suspense fallback={<div className="chargement">Chargement de l'archipel…</div>}>
          <Experience bloque={bloque} />
        </Suspense>
      )}
      {!accueil && <BarreNav />}
      {enJeu && pathname === '/' && <Hud />}
      <Routes>
        <Route path="/" element={mode === '2d' ? <QuickView2D /> : accueil ? <Accueil /> : null} />
        <Route path="/moi" element={<ProfilPanel />} />
        <Route path="/:competenceId" element={<CompetencePanel />} />
        <Route path="/:competenceId/:slug" element={<ProofPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
