import { profil } from '../content/profil'
import { Panneau } from './Panneau'

const B = import.meta.env.BASE_URL

export function ProfilPanel() {
  return (
    <Panneau titre="Moi et l'alternance">
      <header className="entete profil-entete">
        <img className="avatar" src={`${B}${profil.avatar}`} alt={`Avatar de ${profil.nom}`} width={88} height={88} />
        <div>
          <p className="surtitre">Îlot central</p>
          <h1>{profil.nom}</h1>
          <p className="niveau-libelle">{profil.accroche}</p>
        </div>
      </header>

      {profil.bio.map((p) => (
        <p key={p}>{p}</p>
      ))}

      <h2>Alternance</h2>
      <p>
        {profil.poste} chez <strong>{profil.entreprise}</strong>
      </p>
      <ul>
        {profil.missions.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <h2>Formation</h2>
      <ul className="formation">
        {profil.formation.map((f) => (
          <li key={f.intitule}>
            <span className="tag">{f.periode}</span>{' '}
            <a href={f.lien} target="_blank" rel="noreferrer">
              {f.intitule}
            </a>
          </li>
        ))}
      </ul>

      <h2>Liens</h2>
      <ul className="chips">
        <li>
          <a href={`${B}${profil.cv}`} target="_blank" rel="noreferrer">
            Mon CV (PDF)
          </a>
        </li>
        {profil.liens.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </Panneau>
  )
}
