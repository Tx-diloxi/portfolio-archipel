export type CompetenceId =
  | 'realiser'
  | 'optimiser'
  | 'administrer'
  | 'gerer'
  | 'conduire'
  | 'collaborer'

export interface ApprentissageCritique {
  code: string // ex. "AC31.02" : le 3e caractère numérique = n° de compétence
  libelle: string
}

export interface Competence {
  id: CompetenceId
  numero: 1 | 2 | 3 | 4 | 5 | 6
  nom: string
  definition: string
  niveau: 2 | 3
  niveauLibelle: string
  composantes: string[]
  acs: ApprentissageCritique[]
  autoPositionnement: string
  couleur: string
}

export type TypeTrace = 'capture' | 'code' | 'commit' | 'metrique' | 'document' | 'lien'

export interface Trace {
  type: TypeTrace
  label: string
  href?: string
}

export interface Preuve {
  slug: string
  titre: string
  contexte: 'Alternance' | 'SAÉ' | 'Projet personnel'
  source: string // ex. "SAÉ 5.Real.01" ou "Mission alternance, Entreprise X"
  periode: string
  resume: string
  realisations: string[]
  traces: Trace[]
  acs: string[] // codes d'AC couverts
  argumentation: string
  criteres: string[] // composantes essentielles (CE) satisfaites
  recul: string // ce que je ferais autrement
  annee?: string // ex. « BUT 1 (2024-2025) » pour les traces des années précédentes
  images?: { src: string; alt: string }[] // chemins relatifs à public/
}
