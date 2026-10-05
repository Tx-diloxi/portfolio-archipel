import { Link } from 'react-router-dom'
import { competences } from '../content/competences'
import { preuvesPourCompetence } from '../content/preuves'
import { profil } from '../content/profil'
import { usePortfolio } from '../store'

export function QuickView2D() {
  const basculeAuto = usePortfolio((s) => s.basculeAuto)
  const niveau3 = competences.filter((c) => c.niveau === 3)
  const niveau2 = competences.filter((c) => c.niveau === 2)

  const carte = (c: (typeof competences)[number]) => {
    const n = preuvesPourCompetence(c.id).length
    return (
      <li key={c.id}>
        <Link to={`/${c.id}`} className="carte" style={{ borderColor: c.couleur }}>
          <span className="surtitre">Compétence {c.numero}</span>
          <strong>{c.nom}</strong>
          <span className="niveau-libelle">{c.niveauLibelle}</span>
          <span className="compte">
            {c.acs.length} AC · {n} preuve{n > 1 ? 's' : ''}
          </span>
        </Link>
      </li>
    )
  }

  return (
    <main className="page">
      {basculeAuto && (
        <p className="avis">3D trop lente sur cet appareil : version rapide affichée.</p>
      )}
      <header className="entete profil-entete">
        <img className="avatar" src={`${import.meta.env.BASE_URL}${profil.avatar}`} alt="" width={72} height={72} />
        <div>
          <h1>{profil.nom}</h1>
          <p className="niveau-libelle">{profil.accroche}</p>
          <p>
            <Link to="/moi">Profil et alternance →</Link> ·{' '}
            <a href={`${import.meta.env.BASE_URL}${profil.cv}`} target="_blank" rel="noreferrer">
              Mon CV
            </a>
          </p>
        </div>
      </header>
      <h2>Compétences de niveau 3 (parcours A)</h2>
      <ul className="grille">{niveau3.map(carte)}</ul>
      <h2>Compétences de niveau 2</h2>
      <ul className="grille">{niveau2.map(carte)}</ul>
    </main>
  )
}
