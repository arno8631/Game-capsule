# Plan d'activation marketing · Borne ORTHO INVADERS

L'objectif de la borne est double : **créer du trafic et du bouche-à-oreille sur le stand** et **transformer
les visiteurs en comptes Capsule qualifiés**, puis en acheteurs de formations orthodontiques.
Le replay offert sert de lot d'appel ; l'actif qui reste après l'événement, c'est la **base de comptes taggués**.

## Persona cible
- **Orthodontistes et omnipraticiens pratiquant l'ODF** : ils cherchent de la formation continue concrète (biomécanique, mini-vis, contentions).
- **Assistant(e)s et internes / étudiants** en fin de cursus : forte appétence pour le format ludique, relais sociaux.
- **Partenaires (labos, industriels)** présents sur les portes ouvertes : visibilité croisée.

## Tunnel
1. **Attirer** : écran synthwave, sons 8-bit, classement en direct, annonce plein écran des gagnants.
2. **Capter** : scan du QR code puis **connexion ou création de compte Capsule** (seule porte d'entrée pour jouer).
3. **Engager** : environ 2 min 30 de jeu, avec un message pédagogique entre chaque vague.
4. **Convertir** : lot = replay à 100 % (valeur 249 €) via un code nominatif ; les perdants reçoivent la relance ci-dessous.
5. **Fidéliser** : segmentation Shopify par tags `arcade-ortho-2026-gagnant` et `arcade-lot-*`.

## 3 objectifs SMART (journées portes ouvertes)
| # | Objectif | Indicateur | Cible |
|---|---|---|---|
| 1 · Visibilité | Faire jouer une large part des visiteurs du stand pendant les journées | parties jouées / visiteurs du stand | **≥ 40 %** des visiteurs, **≥ 150 parties** |
| 2 · Conversion | Transformer les joueurs en comptes Capsule identifiés | nouveaux comptes créés via la borne | **≥ 80 nouveaux comptes** pendant l'événement |
| 3 · CA | Monétiser la base captée sous 30 jours | CA formations ortho issu des segments « arcade » | **≥ 10 commandes** (live ou présentiel) sous 30 jours, soit un **ROI ≥ 3** sur le coût des lots |

Le coût réel des lots est marginal (un replay est un contenu déjà produit) : `MAX_PRIZES=30` représente
7 470 € de valeur perçue pour un coût quasi nul. C'est l'argument central de la communication.

## KPIs à suivre (données disponibles)
- `data/scores.json` : nombre de parties, joueurs uniques, durée moyenne, taux de victoire (cible **15 à 25 %** : au-delà, augmenter la difficulté dans `WAVES` de `game.js`).
- Shopify : clients taggués `arcade-*`, utilisation des codes `ORTHO-*` (rapport Réductions), commandes des segments.
- Taux d'activation du lot = codes utilisés / codes distribués (cible **≥ 70 %**).
- CAC événement = (coût stand + borne) / nouveaux comptes.

## Leviers à activer
- **Avant (J-10)** : teaser LinkedIn/Instagram « Qui battra la Méga-Carie ? » en vidéo verticale de gameplay ; email aux clients ortho « Venez jouer, un replay à la clé ».
- **Pendant** : story Instagram en direct du classement ; photo de chaque gagnant devant l'écran (UGC, avec son accord) ; défi « meilleur score de la journée ».
- **Après (J+1 à J+30)** :
  - *Gagnants* : email J+1 « Votre replay vous attend », puis J+7 « Passez au niveau supérieur : la formation live/présentiel » (upsell Biomécanique présentiel/live).
  - *Perdants* : email J+1 « Presque ! Votre revanche… » avec une offre limitée sur les replays ortho (-20 %, 7 jours).
  - *Tous* : entrée dans la newsletter ortho, avec cas cliniques de contention et biomécanique validés par les formateurs.
- **A/B test** : message pédagogique entre les vagues (conseil clinique ou teaser formation) → mesurer le clic « Récupérer ma formation ».

## Conformité santé et jeu
- Messages pédagogiques généraux, non promotionnels sur des dispositifs ; à faire relire par les formateurs (Dr Ellouze, Dr Philippides).
- Jeu gratuit, sans obligation d'achat, qui repose sur l'adresse : prévoir un **règlement** affiché (lots, 1 gain par compte, durée de validité) et la **mention RGPD** (déjà présente sur l'écran de connexion).

## Prochaines actions suggérées
1. Publier le replay Biomécanique et régler le stock du replay Contentions.
2. Créer les deux segments clients Shopify (`tag:arcade-ortho-2026-gagnant`, `tag:arcade-*`) et la séquence email J+1 / J+7.
3. Tourner une capture vidéo de 20 s du gameplay pour le teaser.
