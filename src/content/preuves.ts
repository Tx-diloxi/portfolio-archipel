import type { CompetenceId, Preuve } from './types'
import { competenceIdFromAc, getCompetence } from './competences'
import { preuvesBut1 } from './preuves-but1'

// Preuves de BUT 3 : modèles à remplacer par tes vraies traces (alternance, SAÉ).
// Une preuve peut couvrir plusieurs AC, et donc plusieurs îles.
const preuvesBut3: Preuve[] = [
  {
    slug: 'mission-alternance-refonte-module',
    titre: "Refonte d'un module de l'application de l'entreprise",
    contexte: 'Alternance',
    source: 'Mission alternance, [Entreprise]',
    periode: 'Septembre → décembre',
    resume: 'À compléter : besoin, existant, rôle, résultat.',
    realisations: ['Analyse du code existant et de la dette technique', 'Choix d\'architecture justifié', 'Mise en production via la CI/CD'],
    traces: [
      { type: 'code', label: 'Code avant / après' },
      { type: 'commit', label: 'Merge request principale' },
      { type: 'capture', label: 'Écran livré' },
    ],
    acs: ['AC31.01', 'AC31.02', 'AC31.03', 'AC36.03'],
    argumentation: 'À compléter : en quoi la trace prouve l\'AC, critères (CE), limites.',
    criteres: ['CE1.01', 'CE1.04', 'CE6.02'],
    recul: 'À compléter.',
  },
  {
    slug: 'sae-5-real-01-developpement-avance',
    titre: 'SAÉ 5.Real.01 : Développement avancé',
    contexte: 'SAÉ',
    source: 'SAÉ 5.Real.01',
    periode: 'Semestre 5',
    resume: 'À compléter.',
    realisations: ['Mesure des performances initiales', 'Profilage et optimisation ciblée'],
    traces: [
      { type: 'metrique', label: 'Benchmark avant / après (temps, mémoire)' },
      { type: 'capture', label: 'Flamegraph du profileur' },
    ],
    acs: ['AC32.01', 'AC32.02', 'AC31.01'],
    argumentation: 'À compléter.',
    criteres: ['CE2.01', 'CE2.04'],
    recul: 'À compléter.',
  },
  {
    slug: 'sae-6-real-01-evolution-existant',
    titre: "SAÉ 6.Real.01 : Évolution d'une application existante",
    contexte: 'SAÉ',
    source: 'SAÉ 6.Real.01',
    periode: 'Semestre 6',
    resume: 'À compléter.',
    realisations: ['Reprise d\'une base de code tierce', 'Ajout de fonctionnalités et tests'],
    traces: [{ type: 'lien', label: 'Dépôt Git du projet' }],
    acs: ['AC31.02', 'AC32.03', 'AC36.04'],
    argumentation: 'À compléter.',
    criteres: ['CE1.04', 'CE2.02', 'CE6.04'],
    recul: 'À compléter.',
  },
  {
    slug: 'veille-technologique-equipe',
    titre: 'Veille technologique partagée avec l\'équipe',
    contexte: 'Alternance',
    source: 'Mission alternance, [Entreprise]',
    periode: 'Toute l\'année',
    resume: 'À compléter : format, outils, diffusion.',
    realisations: ['Mise en place d\'un flux de veille', 'Présentations mensuelles à l\'équipe'],
    traces: [{ type: 'document', label: 'Exemple de note de veille' }],
    acs: ['AC36.01', 'AC36.02'],
    argumentation: 'À compléter.',
    criteres: ['CE6.01', 'CE6.04'],
    recul: 'À compléter.',
  },
]

export const preuves: Preuve[] = [...preuvesBut3, ...preuvesBut1]

export const getPreuve = (slug: string | undefined) => preuves.find((p) => p.slug === slug)

export const preuvesPourCompetence = (id: CompetenceId) =>
  preuves.filter((p) => p.acs.some((ac) => competenceIdFromAc(ac) === id))

export const preuvesPourAc = (code: string) => preuves.filter((p) => p.acs.includes(code))

// Preuves du niveau visé (BUT 3) vs traces des années précédentes (trajectoire).
const auNiveauActuel = (p: Preuve, id: CompetenceId) => {
  const acs = getCompetence(id)?.acs.map((a) => a.code) ?? []
  return p.acs.some((ac) => acs.includes(ac))
}
export const trajectoirePourCompetence = (id: CompetenceId) =>
  preuvesPourCompetence(id).filter((p) => !auNiveauActuel(p, id))

// Preuve révélée par le coffre de l'île : niveau actuel en priorité, sinon une trace antérieure.
export const preuvePhare = (id: CompetenceId) =>
  preuvesPourCompetence(id).find((p) => auNiveauActuel(p, id)) ?? preuvesPourCompetence(id)[0]
