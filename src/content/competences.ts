import type { ApprentissageCritique, Competence, CompetenceId } from './types'

// Référentiel : PN BUT Informatique 2022 (annexe 15). Parcours A : niveau 3 en
// Réaliser, Optimiser, Collaborer ; niveau 2 pour les trois autres.
// Les AC de niveau 2 sont à revérifier dans le PN de ton IUT.
export const competences: Competence[] = [
  {
    id: 'realiser',
    numero: 1,
    nom: 'Réaliser',
    definition:
      "Développer (concevoir, coder, tester et intégrer) une solution informatique pour un client.",
    niveau: 3,
    niveauLibelle: 'Adapter des applications sur un ensemble de supports (embarqué, web, mobile, IoT…)',
    composantes: [
      'CE1.01 : en respectant les besoins décrits par le client',
      'CE1.03 : en appliquant les principes algorithmiques',
      'CE1.04 : en veillant à la qualité du code et à sa documentation',
      'CE1.06 : en choisissant les ressources techniques appropriées',
    ],
    acs: [
      { code: 'AC31.01', libelle: 'Choisir et implémenter les architectures adaptées' },
      { code: 'AC31.02', libelle: 'Faire évoluer une application existante' },
      { code: 'AC31.03', libelle: 'Intégrer des solutions dans un environnement de production' },
    ],
    autoPositionnement: 'À compléter.',
    couleur: '#f4a259',
  },
  {
    id: 'optimiser',
    numero: 2,
    nom: 'Optimiser',
    definition:
      "Proposer des applications informatiques optimisées en fonction de critères spécifiques : temps d'exécution, précision, consommation de ressources.",
    niveau: 3,
    niveauLibelle: 'Analyser et optimiser des applications',
    composantes: [
      'CE2.01 : en formalisant et modélisant des situations complexes',
      'CE2.02 : en recensant les algorithmes et les structures de données usuels',
      'CE2.03 : en s\'appuyant sur des schémas de raisonnement',
      'CE2.04 : en justifiant les choix et validant les résultats',
    ],
    acs: [
      { code: 'AC32.01', libelle: "Anticiper les résultats de diverses métriques (temps d'exécution, occupation mémoire, montée en charge…)" },
      { code: 'AC32.02', libelle: "Profiler, analyser et justifier le comportement d'un code existant" },
      { code: 'AC32.03', libelle: "Choisir et utiliser des bibliothèques et méthodes dédiées au domaine d'application (imagerie, IA, jeux vidéo, parallélisme…)" },
    ],
    autoPositionnement: 'À compléter.',
    couleur: '#5b8def',
  },
  {
    id: 'administrer',
    numero: 3,
    nom: 'Administrer',
    definition:
      "Installer, configurer, mettre à disposition, maintenir en conditions opérationnelles des infrastructures, des services et des réseaux et optimiser le système informatique d'une organisation.",
    niveau: 2,
    niveauLibelle: 'Déployer des services dans une architecture réseau',
    composantes: [
      'CE3.01 : en sécurisant le système d\'information',
      'CE3.02 : en offrant une qualité de service optimale',
      'CE3.03 : en appliquant les normes en vigueur et les bonnes pratiques architecturales et de sécurité',
      'CE3.04 : en assurant la continuité d\'activité',
    ],
    acs: [
      { code: 'AC23.01', libelle: 'Concevoir et développer des applications communicantes' },
      { code: 'AC23.02', libelle: 'Utiliser des serveurs et des services réseaux virtualisés' },
      { code: 'AC23.03', libelle: 'Sécuriser les services et données d\'un système' },
    ],
    autoPositionnement: 'À compléter.',
    couleur: '#e05d5d',
  },
  {
    id: 'gerer',
    numero: 4,
    nom: 'Gérer',
    definition:
      "Concevoir, gérer, administrer et exploiter les données de l'entreprise et mettre à disposition toutes les informations pour un bon pilotage de l'entreprise.",
    niveau: 2,
    niveauLibelle: 'Optimiser une base de données, interagir avec une application et mettre en œuvre la sécurité',
    composantes: [
      'CE4.01 : en respectant les réglementations sur le respect de la vie privée et la protection des données personnelles',
      'CE4.02 : en respectant les enjeux économiques, sociétaux et écologiques de l\'utilisation du stockage de données',
      'CE4.03 : en s\'appuyant sur des bases mathématiques',
      'CE4.05 : en assurant la cohérence et la qualité',
    ],
    acs: [
      { code: 'AC24.01', libelle: "Optimiser les modèles de données de l'entreprise" },
      { code: 'AC24.02', libelle: 'Assurer la confidentialité des données (intégrité et sécurité)' },
      { code: 'AC24.03', libelle: 'Organiser la restitution de données à travers la programmation et la visualisation' },
      { code: 'AC24.04', libelle: 'Manipuler des données hétérogènes' },
    ],
    autoPositionnement: 'À compléter.',
    couleur: '#9b6dd6',
  },
  {
    id: 'conduire',
    numero: 5,
    nom: 'Conduire',
    definition:
      'Satisfaire les besoins des utilisateurs au regard de la chaîne de valeur du client, organiser et piloter un projet informatique avec des méthodes classiques ou agiles.',
    niveau: 2,
    niveauLibelle: 'Appliquer une démarche de suivi de projet en fonction des besoins métiers des clients et des utilisateurs',
    composantes: [
      'CE5.01 : en communiquant efficacement avec les différents acteurs d\'un projet',
      'CE5.02 : en respectant les règles juridiques et les normes en vigueur',
      'CE5.03 : en sensibilisant à une gestion éthique, responsable, durable et interculturelle',
      'CE5.04 : en adoptant une démarche proactive, créative et critique',
    ],
    acs: [
      { code: 'AC25.01', libelle: "Identifier les processus présents dans une organisation en vue d'améliorer les systèmes d'information" },
      { code: 'AC25.02', libelle: "Formaliser les besoins du client et de l'utilisateur" },
      { code: 'AC25.03', libelle: "Identifier les critères de faisabilité d'un projet informatique" },
      { code: 'AC25.04', libelle: 'Définir et mettre en œuvre une démarche de suivi de projet' },
    ],
    autoPositionnement: 'À compléter.',
    couleur: '#3fb68b',
  },
  {
    id: 'collaborer',
    numero: 6,
    nom: 'Collaborer',
    definition:
      'Acquérir, développer et exploiter les aptitudes nécessaires pour travailler efficacement dans une équipe informatique.',
    niveau: 3,
    niveauLibelle: 'Manager une équipe informatique',
    composantes: [
      'CE6.01 : en inscrivant sa démarche au sein d\'une équipe pluridisciplinaire',
      'CE6.02 : en accompagnant la mise en œuvre des évolutions informatiques',
      'CE6.03 : en veillant au respect des contraintes juridiques',
      'CE6.04 : en développant une communication efficace et collaborative',
    ],
    acs: [
      { code: 'AC36.01', libelle: 'Organiser et partager une veille technologique et informationnelle' },
      { code: 'AC36.02', libelle: "Identifier les enjeux de l'économie de l'innovation numérique" },
      { code: 'AC36.03', libelle: "Guider la conduite du changement informatique au sein d'une organisation" },
      { code: 'AC36.04', libelle: 'Accompagner le management de projet informatique' },
    ],
    autoPositionnement: 'À compléter.',
    couleur: '#f2c94c',
  },
]

// Apprentissages critiques de niveau 1 (BUT 1) : la trajectoire montrée par les traces
// des années précédentes (PN 2022, à revérifier dans le PN de ton IUT).
export const ACS_NIVEAU_1: Record<CompetenceId, ApprentissageCritique[]> = {
  realiser: [
    { code: 'AC11.01', libelle: 'Implémenter des conceptions simples' },
    { code: 'AC11.02', libelle: 'Élaborer des conceptions simples' },
    { code: 'AC11.03', libelle: 'Faire des essais et évaluer leurs résultats en regard des spécifications' },
    { code: 'AC11.04', libelle: 'Développer des interfaces utilisateurs' },
  ],
  optimiser: [
    { code: 'AC12.01', libelle: 'Analyser un problème avec méthode' },
    { code: 'AC12.02', libelle: 'Comparer des algorithmes pour des problèmes classiques' },
    { code: 'AC12.03', libelle: "Formaliser et mettre en œuvre des outils mathématiques pour l'informatique" },
  ],
  administrer: [
    { code: 'AC13.01', libelle: "Identifier les différents composants (matériels et logiciels) d'un système numérique" },
    { code: 'AC13.02', libelle: "Utiliser les fonctionnalités de base d'un système multitâches / multiutilisateurs" },
    { code: 'AC13.03', libelle: "Installer et configurer un système d'exploitation et des outils de développement" },
    { code: 'AC13.04', libelle: "Configurer un poste de travail dans un réseau d'entreprise" },
  ],
  gerer: [
    { code: 'AC14.01', libelle: 'Mettre à jour et interroger une base de données relationnelle' },
    { code: 'AC14.02', libelle: 'Visualiser des données' },
    { code: 'AC14.03', libelle: "Concevoir une base de données relationnelle à partir d'un cahier des charges" },
  ],
  conduire: [
    { code: 'AC15.01', libelle: "Appréhender les besoins du client et de l'utilisateur" },
    { code: 'AC15.02', libelle: 'Mettre en place les outils de gestion de projet' },
    { code: 'AC15.03', libelle: "Identifier les acteurs et les différentes phases d'un cycle de développement" },
  ],
  collaborer: [
    { code: 'AC16.01', libelle: "Appréhender l'écosystème numérique" },
    { code: 'AC16.02', libelle: 'Découvrir les aptitudes requises selon les différents secteurs informatiques' },
    { code: 'AC16.03', libelle: "Identifier les statuts, les fonctions et les rôles de chaque membre d'une équipe pluridisciplinaire" },
    { code: 'AC16.04', libelle: 'Acquérir les compétences interpersonnelles pour travailler en équipe' },
  ],
}

export const libelleAc = (code: string) =>
  [...competences.flatMap((c) => c.acs), ...Object.values(ACS_NIVEAU_1).flat()].find((a) => a.code === code)?.libelle

export const getCompetence = (id: string | undefined) =>
  competences.find((c) => c.id === id) as Competence | undefined

export const competenceIdFromAc = (code: string): CompetenceId | undefined => {
  const numero = Number(code.charAt(3))
  return competences.find((c) => c.numero === numero)?.id
}
