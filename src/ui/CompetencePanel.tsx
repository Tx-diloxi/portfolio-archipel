import { useEffect } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { getCompetence, libelleAc } from '../content/competences'
import { preuvesPourAc, trajectoirePourCompetence } from '../content/preuves'
import { Panneau } from './Panneau'

export function CompetencePanel() {
  const { competenceId } = useParams()
  const c = getCompetence(competenceId)
  const [params] = useSearchParams()
  const acCible = params.get('ac')

  // arrivée depuis un panneau du jeu : on fait défiler jusqu'à l'AC lu
  useEffect(() => {
    if (acCible) document.getElementById(acCible)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [acCible])

  if (!c) return <Navigate to="/" replace />

  return (
    <Panneau titre={c.nom}>
      <header className="entete" style={{ borderColor: c.couleur }}>
        <p className="surtitre">Compétence {c.numero}</p>
        <h1>{c.nom}</h1>
        <span className={`badge-niveau n${c.niveau}`}>Niveau {c.niveau}</span>
        <p className="niveau-libelle">{c.niveauLibelle}</p>
      </header>

      <p className="definition">{c.definition}</p>

      <h2>Apprentissages critiques</h2>
      <ul className="liste-ac">
        {c.acs.map((ac) => {
          const preuves = preuvesPourAc(ac.code)
          return (
            <li key={ac.code} id={ac.code} className={ac.code === acCible ? 'cible' : undefined}>
              <p>
                <strong>{ac.code}</strong> {ac.libelle}
              </p>
              {preuves.length > 0 ? (
                <ul className="preuves">
                  {preuves.map((p) => (
                    <li key={p.slug}>
                      <Link to={`/${c.id}/${p.slug}`}>
                        <span className={`tag tag-${p.contexte === 'Alternance' ? 'alt' : 'sae'}`}>{p.contexte}</span>
                        {p.titre}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="manque">Pas encore de preuve.</p>
              )}
            </li>
          )
        })}
      </ul>

      <h2>Auto-positionnement</h2>
      <p>{c.autoPositionnement}</p>

      {trajectoirePourCompetence(c.id).length > 0 && (
        <>
          <h2>Trajectoire</h2>
          <p className="niveau-libelle">Traces antérieures : la progression vers le niveau {c.niveau}.</p>
          <ul className="preuves trajectoire">
            {trajectoirePourCompetence(c.id).map((p) => (
              <li key={p.slug}>
                <Link to={`/${c.id}/${p.slug}`}>
                  <span className="tag">{p.annee ?? p.contexte}</span>
                  {p.titre}
                </Link>
                <span className="acs-trajectoire">
                  {p.acs
                    .filter((code) => code.charAt(3) === String(c.numero))
                    .map((code) => `${code} ${libelleAc(code) ?? ''}`)
                    .join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <details>
        <summary>Composantes essentielles (critères qualité)</summary>
        <ul>
          {c.composantes.map((ce) => (
            <li key={ce}>{ce}</li>
          ))}
        </ul>
      </details>
    </Panneau>
  )
}
