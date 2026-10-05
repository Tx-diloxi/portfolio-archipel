import { Link, Navigate, useParams } from 'react-router-dom'
import { competenceIdFromAc, getCompetence, libelleAc } from '../content/competences'
import { getPreuve } from '../content/preuves'
import { Panneau } from './Panneau'

export function ProofPage() {
  const { competenceId, slug } = useParams()
  const c = getCompetence(competenceId)
  const p = getPreuve(slug)
  if (!c || !p) return <Navigate to={c ? `/${c.id}` : '/'} replace />

  return (
    <Panneau titre={p.titre} retour={`/${c.id}`}>
      <header className="entete" style={{ borderColor: c.couleur }}>
        <p className="surtitre">
          {p.annee && <>{p.annee} · </>}
          {p.source} · {p.periode}
        </p>
        <h1>{p.titre}</h1>
      </header>

      <h2>Contexte</h2>
      <p>{p.resume}</p>

      <h2>Ce que j'ai fait</h2>
      <ul>
        {p.realisations.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      {p.images && p.images.length > 0 && (
        <div className="galerie">
          {p.images.map((img) => (
            <a key={img.src} href={`${import.meta.env.BASE_URL}${img.src}`} target="_blank" rel="noreferrer">
              <img src={`${import.meta.env.BASE_URL}${img.src}`} alt={img.alt} loading="lazy" />
            </a>
          ))}
        </div>
      )}

      <h2>Traces</h2>
      <ul className="traces">
        {p.traces.map((t) => (
          <li key={t.label}>
            <span className="tag">{t.type}</span>
            {t.href ? (
              <a href={t.href} target="_blank" rel="noreferrer">
                {t.label}
              </a>
            ) : (
              t.label
            )}
          </li>
        ))}
      </ul>

      <h2>Apprentissages critiques prouvés</h2>
      <ul className="chips">
        {p.acs.map((code) => {
          const cid = competenceIdFromAc(code)
          const comp = getCompetence(cid)
          return (
            <li key={code}>
              <Link to={`/${cid}`} style={{ borderColor: comp?.couleur }} title={libelleAc(code)}>
                {code} · {comp?.nom}
              </Link>
              {libelleAc(code) && <span className="libelle-ac">{libelleAc(code)}</span>}
            </li>
          )
        })}
      </ul>

      <h2>Argumentation</h2>
      <p>{p.argumentation}</p>
      <p className="criteres">Critères satisfaits : {p.criteres.join(', ')}</p>

      <h2>Prise de recul</h2>
      <p>{p.recul}</p>
    </Panneau>
  )
}
