import type { Preuve } from './types'

// Traces de BUT 1 (2024-2025), reprises de l'ancien portfolio (github.com/Tx-diloxi/Portfolio).
// Elles montrent la trajectoire vers les niveaux de BUT 3. Les champs « recul » sont à
// écrire avec le regard d'aujourd'hui : c'est ce que le jury attend d'une posture réflexive.
export const preuvesBut1: Preuve[] = [
  {
    slug: 'sae-1-01-snake-en-c',
    titre: 'Snake en C',
    contexte: 'SAÉ',
    source: "SAÉ 1.01 : Conception et implémentation d'un jeu classique",
    periode: '4 semaines · seul',
    annee: 'BUT 1 (2024-2025)',
    resume: 'Le jeu Snake en C : le serpent mange des pommes, grandit et évite murs et queue.',
    realisations: [
      "Maquette de l'interface",
      'Serpent et grille en tableaux et structures',
      'Collisions, déplacements, état du jeu',
      'Code découpé en fonctions',
      'Cahier de tests exécuté, bugs corrigés',
    ],
    traces: [
      { type: 'lien', label: 'Dépôt GitHub Snake-C', href: 'https://github.com/Tx-diloxi/Snake-C' },
      { type: 'document', label: 'Programme C, cahier de tests (ODS), documentation' },
    ],
    images: [{ src: 'preuves/sae-1-01-snake.webp', alt: 'Illustration du jeu Snake' }],
    acs: ['AC11.01', 'AC11.03'],
    argumentation:
      "J'ai traduit une maquette en structures et fonctions C (AC11.01). Le cahier de tests valide le programme face aux spécifications (AC11.03). C'est le point de départ de Réaliser.",
    criteres: ['CE1.01', 'CE1.03', 'CE1.04'],
    recul: 'À compléter : que structurerais-je autrement aujourd\'hui ?',
  },
  {
    slug: 'sae-1-02-comparaison-algorithmes',
    titre: "Snake autonome et comparaison d'algorithmes",
    contexte: 'SAÉ',
    source: 'SAÉ 1.02 : Snake autonome et analyse de performance des algorithmes',
    periode: '4 semaines · binôme',
    annee: 'BUT 1 (2024-2025)',
    resume:
      'Rendre le serpent autonome pour manger toutes les pommes en un minimum de coups, puis comparer les algorithmes (déplacements, temps CPU).',
    realisations: [
      'V1 : vers la pomme la plus proche (référence)',
      'V2 : plusieurs pommes, ordre optimal',
      'V3 : contournement des obstacles',
      'V4 : algorithme optimisé',
      'Mesures comparées par version',
    ],
    traces: [
      { type: 'lien', label: 'Dépôt GitHub Snake-C-Auto', href: 'https://github.com/Tx-diloxi/Snake-C-Auto' },
      { type: 'metrique', label: 'Mesures (ODS) : déplacements et temps CPU par version' },
    ],
    images: [{ src: 'preuves/sae-1-02-algos.webp', alt: 'Illustration du Snake autonome' }],
    acs: ['AC12.01', 'AC12.02'],
    argumentation:
      "Quatre versions, une contrainte de plus à chaque fois : une analyse méthodique (AC12.01). Un environnement déterministe permet de comparer objectivement (AC12.02). Prépare l'AC32.01.",
    criteres: ['CE2.01', 'CE2.02', 'CE2.04'],
    recul: 'À compléter : que mesurerais-je en plus aujourd\'hui ?',
  },
  {
    slug: 'sae-1-03-poste-de-developpement',
    titre: "Installation d'un poste de développement",
    contexte: 'SAÉ',
    source: "SAÉ 1.03 : Configuration et optimisation d'un environnement de travail professionnel",
    periode: '5 semaines · équipe de 4',
    annee: 'BUT 1 (2024-2025)',
    resume: 'Un poste de développement complet et reproductible avec Docker : IDE, compilateurs, Git, documentation.',
    realisations: [
      'Besoins : outils essentiels et optionnels',
      'Infrastructure Docker',
      "Scripts d'installation automatisée",
      'Partage de fichiers hôte ↔ conteneurs',
      "Tests des scénarios d'usage",
    ],
    traces: [
      { type: 'document', label: 'Scripts, documentation, page web, PDF' },
      { type: 'lien', label: 'Profil GitHub', href: 'https://github.com/Tx-diloxi' },
    ],
    images: [
      { src: 'preuves/sae-1-03-poste.webp', alt: 'Illustration Docker (conteneurisation)' },
      { src: 'preuves/sae-1-03-fichiers.webp', alt: 'Arborescence des fichiers du projet' },
      { src: 'preuves/sae-1-03-etape4.webp', alt: "Tableau de suivi de l'étape de tests" },
    ],
    acs: ['AC13.01', 'AC13.03'],
    argumentation:
      "Identifier les composants d'un poste de développeur (AC13.01). Installer et configurer les outils avec Docker et des scripts (AC13.03). Acquis : virtualisation vs conteneurisation.",
    criteres: ['CE3.02', 'CE3.03'],
    recul: "À compléter : comment l'outillerais-je aujourd'hui ?",
  },
  {
    slug: 'sae-1-04-base-de-donnees-football',
    titre: 'Base de données des championnats de football',
    contexte: 'SAÉ',
    source: "SAÉ 1.04 : Conception et implantation d'une base de données",
    periode: '3 semaines · binôme',
    annee: 'BUT 1 (2024-2025)',
    resume: 'Base des championnats de football français, masculins et féminins : clubs, équipes, joueurs, matchs.',
    realisations: [
      'Entités et relations du cahier des charges',
      'Diagramme UML (Visual Paradigm)',
      'Dépendances fonctionnelles, normalisation',
      'Modèle relationnel puis script SQL',
      'Tests des requêtes',
    ],
    traces: [{ type: 'document', label: 'Rapports PDF, UML, script SQL, schéma relationnel' }],
    images: [{ src: 'preuves/sae-1-04-uml.webp', alt: 'Diagramme de classes UML de la base football' }],
    acs: ['AC14.01', 'AC14.03'],
    argumentation:
      'Du cahier des charges au schéma relationnel (AC14.03), puis implantation et requêtes SQL (AC14.01). La normalisation assure la cohérence (CE4.05).',
    criteres: ['CE4.03', 'CE4.05'],
    recul: 'À compléter : que changerais-je au modèle ?',
  },
  {
    slug: 'sae-1-05-site-jo-paris-2024',
    titre: 'Site web des JO Paris 2024',
    contexte: 'SAÉ',
    source: "SAÉ 1.05 : Recueil des besoins, conception et réalisation d'un site web olympique",
    periode: '3 mois · équipe de 4',
    annee: 'BUT 1 (2024-2025)',
    resume: "Un site responsive pour le comité d'organisation des JO : une discipline, une épreuve, un portrait d'athlète.",
    realisations: [
      "Synthèse des besoins à partir de l'interview client",
      'Charte graphique',
      'Maquettes desktop et mobile',
      'HTML / CSS / JS responsive, versionné avec Git',
    ],
    traces: [
      { type: 'lien', label: 'Dépôt GitHub (projet d\'équipe)', href: 'https://github.com/Arthurchvl/website-J0-Paris-2024' },
      { type: 'document', label: 'Site, diaporama, PDF, maquettes' },
    ],
    images: [{ src: 'preuves/sae-1-05-jo-2.webp', alt: 'Arborescence du site JO Paris 2024' }],
    acs: ['AC15.01', 'AC11.04'],
    argumentation:
      "De l'interview client à la synthèse des besoins (AC15.01), puis maquettes et site responsive (AC11.04). Mon premier cycle complet, du besoin au livrable.",
    criteres: ['CE5.01', 'CE1.01'],
    recul: 'À compléter : comment recueillerais-je les besoins aujourd\'hui ?',
  },
  {
    slug: 'sae-1-06-environnement-economique',
    titre: "Analyse d'entreprise et RSE",
    contexte: 'SAÉ',
    source: "SAÉ 1.06 : Analyse d'entreprise et RSE",
    periode: '2 semaines · équipe de 4',
    annee: 'BUT 1 (2024-2025)',
    resume: 'Analyse économique et RSE d\'une entreprise, axée transition écologique.',
    realisations: [
      'Équipe organisée avec des outils collaboratifs',
      'Recherche documentaire et veille',
      'Synthèse organisation et RSE',
      'Présentation orale (Canva, Prezi, Genially)',
    ],
    traces: [{ type: 'document', label: 'Supports de présentation, synthèse PDF' }],
    images: [
      { src: 'preuves/sae-1-06-rse.webp', alt: 'Couverture de la présentation (entreprise étudiée : Coca-Cola)' },
      { src: 'preuves/sae-1-06-rse-2.webp', alt: "Synthèse : caractéristiques de l'organisation" },
    ],
    acs: ['AC16.01', 'AC16.04'],
    argumentation:
      "Analyser une entreprise réelle : découvrir l'écosystème numérique (AC16.01). Travail à quatre et oral commun (AC16.04). La veille prépare l'AC36.01.",
    criteres: ['CE6.01', 'CE6.04'],
    recul: "À compléter : qu'ai-je appris depuis en alternance ?",
  },
]
