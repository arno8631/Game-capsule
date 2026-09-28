# Mise en ligne du mode « téléphone-manette »

L'iPad du stand affiche la borne (page capsule-med.com/pages/ortho-invaders). Le visiteur scanne le QR code,
se connecte ou crée son compte Capsule **sur son téléphone**, et son téléphone devient la manette. Un petit
serveur fait le relais en temps réel et crée automatiquement le code 100 % lié au compte du gagnant.

Durée : environ 30 minutes. Coût : environ 7 $/mois (Render « Starter » + 1 Go de disque), à arrêter après l'événement.

## 1. Clé Storefront (connexion et inscription des praticiens depuis le téléphone)

1. Shopify › **Paramètres › Applications et canaux de vente › Shopify App Store** : installer le canal **Headless** (gratuit).
2. Headless › **Créer une vitrine** › **Accès à l'API Storefront** › *Gérer* les autorisations : cocher
   **Clients : lecture et écriture** (`unauthenticated_read_customers`, `unauthenticated_write_customers`).
3. Copier le **jeton d'accès public** → variable `STOREFRONT_ACCESS_TOKEN`.

## 2. Application Admin (codes 100 % automatiques + tags jeuJO)

1. Aller sur **dev.shopify.com** (Dev Dashboard, connecté avec le compte propriétaire) › **Créer une application** « Ortho Invaders ».
2. Dans *Versions* › *Accès* : scopes `read_customers, write_customers, read_discounts, write_discounts, read_products`. Publier la version.
3. *Installer* l'application sur la boutique **capsule-med.myshopify.com**.
4. *Paramètres* de l'application : copier **Client ID** et **Client secret** → `SHOPIFY_APP_CLIENT_ID` et `SHOPIFY_APP_CLIENT_SECRET`.

## 3. Hébergement Render

1. Créer un compte sur **render.com** (connexion avec GitHub).
2. **New › Blueprint** › choisir le dépôt `arno8631/Game-capsule`, branche `claude/compassionate-planck-8bd9jl`.
   Render lit `render.yaml` et prépare tout (Node 22, disque, variables).
3. Renseigner les 3 valeurs demandées (étapes 1 et 2), puis **Apply**.
4. Une fois en ligne, noter l'adresse (ex. `https://ortho-invaders.onrender.com`) et, dans *Environment*,
   la valeur générée de **SCREEN_KEY**.

## 4. Brancher l'iPad du stand (une seule fois)

Ouvrir sur l'iPad :

```
https://capsule-med.com/pages/ortho-invaders?borne&serveur=https://ortho-invaders.onrender.com&cle=<SCREEN_KEY>
```

L'iPad mémorise le serveur : ensuite `…/pages/ortho-invaders?borne` suffit. Pour revenir au jeu tactile
sur la tablette : `…/pages/ortho-invaders?borne&local`.

## 5. Vérifications avant l'événement

- [ ] Publier le produit **Replay — Biomécanique** (encore en brouillon) sinon son code ne sera pas utilisable.
- [ ] Scanner le QR code, créer un compte de test, jouer, gagner : le code s'affiche sur le téléphone,
      la fiche client porte `jeuJO`, `jeuJO-2026`, `jeuJO-inscrit` et la profession, la réduction apparaît dans Shopify › Réductions.
- [ ] Wi-Fi du stand (ou routeur 4G) pour l'iPad ; les visiteurs peuvent utiliser leur 4G.
- [ ] Accès guidé activé sur l'iPad (Réglages › Accessibilité).

## Règles appliquées par le serveur

- Une partie par compte (liste « déjà joué » conservée sur le disque), sauf `TESTER_IDS` (identifiants clients Shopify, séparés par des virgules).
- Un lot par compte, 30 lots au maximum (`MAX_PRIZES`), victoire refusée si la partie dure moins de 45 s.
- Code : 100 % sur le replay choisi, 1 utilisation, réservé au compte du gagnant, valable 60 jours.
