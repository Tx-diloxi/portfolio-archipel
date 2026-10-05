import { NavLink } from 'react-router-dom'
import { competences } from '../content/competences'
import { profil } from '../content/profil'
import { usePortfolio } from '../store'

// Écran d'accueil + barre de navigation permanente.

export function Accueil() {
  const setMode = usePortfolio((s) => s.setMode)
  return (
    <div className="accueil" role="dialog" aria-labelledby="titre-accueil">
      <div className="boussole" aria-hidden>
        <span>N</span>
      </div>
      <h1 id="titre-accueil">L'archipel des compétences</h1>
      <p>
        {profil.nom} · {profil.accroche}
      </p>
      <p className="regles">
        Une île = une compétence. Accoste, explore, lis les panneaux.
        <br />
        <kbd>Z</kbd> <kbd>Q</kbd> <kbd>S</kbd> <kbd>D</kbd> / flèches : bouger · <kbd>E</kbd> : interagir ·{' '}
        <kbd>Échap</kbd> : fermer
      </p>
      <div className="actions">
        <button className="btn principal" onClick={() => setMode('3d')} autoFocus>
          Larguer les amarres
        </button>
        <button className="btn" onClick={() => setMode('2d')}>
          Version rapide
        </button>
      </div>
    </div>
  )
}

export function BarreNav() {
  const { mode, setMode } = usePortfolio()
  return (
    <nav className="barre-nav" aria-label="Compétences">
      <NavLink to="/" end className="logo">
        Archipel
      </NavLink>
      <ul>
        <li>
          <NavLink to="/moi">Moi</NavLink>
        </li>
        {competences.map((c) => (
          <li key={c.id}>
            <NavLink to={`/${c.id}`} style={{ '--c': c.couleur } as React.CSSProperties}>
              {c.nom}
            </NavLink>
          </li>
        ))}
      </ul>
      <button className="btn petit" onClick={() => setMode(mode === '3d' ? '2d' : '3d')}>
        {mode === '3d' ? 'Version rapide' : 'Vue 3D'}
      </button>
    </nav>
  )
}
