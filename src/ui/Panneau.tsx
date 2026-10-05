import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../store'

// En 3D : panneau latéral par-dessus la scène. En 2D : page classique.
export function Panneau({ children, retour = '/', titre }: { children: ReactNode; retour?: string; titre: string }) {
  const mode = usePortfolio((s) => s.mode)
  return (
    <section className={mode === '3d' ? 'panneau' : 'page'} aria-label={titre}>
      <Link to={retour} className="retour">
        ← {retour === '/' ? (mode === '3d' ? 'Retour au jeu (Échap)' : 'Sommaire') : 'Retour'}
      </Link>
      {children}
    </section>
  )
}
