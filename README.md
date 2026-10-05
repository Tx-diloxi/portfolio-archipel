# Archipel des compétences : portfolio-jeu 3D, BUT Informatique 3e année (parcours A, alternance)

```bash
npm install
npm run dev
```

## Le jeu
- En mer : `Z Q S D` ou les flèches pour piloter le bateau. Près d'un ponton, `E` pour accoster.
- À pied : on explore l'île. Le monument central présente la compétence, chaque panneau un apprentissage critique et ses preuves.
- Au bout du ponton, `E` pour reprendre la mer. `Échap` ferme un panneau.
- Sur mobile, un pad tactile s'affiche et on touche l'invite pour interagir.
- Chaque île de compétence cache un **coffre**. On l'ouvre avec `E` : il révèle la première preuve rattachée à la compétence, ou annonce qu'il est vide.
- Un **cycle jour / nuit** fait tourner une journée complète en 8 minutes : aube, plein jour, crépuscule, puis nuit étoilée avec la lune. La nuit, les lanternes des pontons et du bateau s'allument et le phare balaie la mer. L'horloge en haut à droite permet de passer directement au jour ou à la nuit. Les réglages sont dans `src/scene/cycle.ts`.
- Une **météo** change toute seule toutes les 1 à 2 minutes (dégagé, nuageux, pluie, orage). Par temps couvert, le ciel grise et les nuages s'épaississent. Sous la pluie, les gouttes font des cercles sur l'eau et le brouillard se rapproche. Pendant un orage, des éclairs éclatent, le tonnerre suit et la houle fait tanguer le bateau. Le bouton météo en haut à droite permet de changer le temps à la main. Les réglages sont dans `src/scene/meteo.ts`.
- La mer est habitée : des **bancs de poissons** aux couleurs de chaque île tournent dans les lagons, visibles à travers l'eau translucide, et des **dauphins** font le tour de l'archipel en sautant. Un second groupe vient nager à côté du bateau quand il va vite.
- Le bateau laisse un **sillage**, des **mouettes** tournent au-dessus des îles, et un bouton active l'**ambiance sonore** (vagues et cris de mouettes). Le son est généré par le navigateur avec Web Audio, sans aucun fichier audio, et il est coupé par défaut.
- La « Version rapide » (ou `?2d`) donne tout le contenu en 2D, pour le jury.

## Où modifier quoi
- `src/content/profil.ts` : ton nom, l'entreprise, les missions, les liens.
- `src/content/competences.ts` : les 6 compétences, les AC (PN 2022) et ton auto-positionnement.
- `src/content/preuves-but1.ts` : les traces de BUT 1 reprises de l'ancien portfolio (SAÉ 1.01 à 1.06), qui montrent la trajectoire. Leurs champs « recul » restent à écrire.
- `src/content/preuves.ts` : tes preuves de BUT 3. Une preuve couvre un ou plusieurs AC et apparaît automatiquement sur chaque île concernée.
- `src/game/monde.ts` : la disposition des îles, des pontons et des panneaux, et les zones où l'on peut marcher.
- `src/game/Jeu.tsx` : la boucle de jeu (physique du bateau, déplacement, interactions).
- `src/game/Coffre.tsx`, `Sillage.tsx`, `Mouettes.tsx`, `sons.ts` : les coffres, le sillage, les mouettes et l'ambiance sonore.
- `src/scene/Landmarks.tsx` : les monuments en primitives, à remplacer par des modèles GLB.

## Crédits
Les modèles 3D viennent de [Kenney](https://kenney.nl), sous licence CC0 (domaine public) : [Pirate Kit](https://kenney.nl/assets/pirate-kit), [Nature Kit](https://kenney.nl/assets/nature-kit) et [Mini Characters](https://kenney.nl/assets/mini-characters). Ils sont rangés dans `public/models/`, et la liste des modèles utilisés est dans `src/game/Modeles.tsx`.
