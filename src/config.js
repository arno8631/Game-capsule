require('dotenv').config({ quiet: true });

const env = (name, fallback = '') => (process.env[name] ?? fallback).trim();

const config = {
  port: Number(env('PORT', '3000')),
  // Render fournit automatiquement RENDER_EXTERNAL_URL (https://….onrender.com)
  publicUrl: (env('PUBLIC_URL') || env('RENDER_EXTERNAL_URL')).replace(/\/$/, ''),
  sessionSecret: env('SESSION_SECRET', 'capsule-arcade-dev-secret'),
  screenKey: env('SCREEN_KEY'),
  authMode: env('AUTH_MODE', 'demo'),

  storeDomain: env('SHOPIFY_STORE_DOMAIN', 'capsule-med.com'),
  adminDomain: env('SHOPIFY_ADMIN_DOMAIN'),
  apiVersion: env('SHOPIFY_API_VERSION', '2026-07'),

  customerAccount: {
    clientId: env('CUSTOMER_ACCOUNT_CLIENT_ID'),
    clientSecret: env('CUSTOMER_ACCOUNT_CLIENT_SECRET'),
  },
  storefrontToken: env('STOREFRONT_ACCESS_TOKEN'),

  admin: {
    token: env('SHOPIFY_ADMIN_TOKEN'),
    clientId: env('SHOPIFY_APP_CLIENT_ID'),
    clientSecret: env('SHOPIFY_APP_CLIENT_SECRET'),
  },

  maxPrizes: Number(env('MAX_PRIZES', '30')),
  rewardValidityDays: Number(env('REWARD_VALIDITY_DAYS', '60')),
  winnerTag: env('WINNER_TAG', 'arcade-ortho-2026-gagnant'),
  minWinSeconds: Number(env('MIN_WIN_SECONDS', '45')),
  // Tags posés sur chaque praticien qui se connecte pour jouer (retrouvables dans Shopify > Clients)
  playerTags: env('PLAYER_TAGS', 'jeuJO,jeuJO-2026').split(',').map((t) => t.trim()).filter(Boolean),
  // Domaines de la boutique autorisés à intégrer le jeu (page capsule-med.com/pages/ortho-invaders)
  // Une seule partie par participant (sauf comptes de test : identifiants clients Shopify)
  onePlayPerCustomer: env('ONE_PLAY_PER_CUSTOMER', 'true') !== 'false',
  testerIds: env('TESTER_IDS', '23773949821273,23276575129945,23130642612569,23662288142681,23394139406681').split(',').map((t) => t.trim()).filter(Boolean),
  storeOrigins: env('STORE_ORIGINS', 'https://capsule-med.com,https://www.capsule-med.com').split(',').map((t) => t.trim()).filter(Boolean),
};

// Professions proposées à l'inscription → tag client (cohérent avec les segments existants)
config.professions = {
  orthodontiste: 'Orthodontiste',
  omnipraticien: 'Omnipraticien',
  assistant: 'Assistante',
  etudiant: 'Etudiant',
  autre: 'Autre-profession',
};

// Lots : les deux replays orthodontie de la boutique Capsule.
config.rewards = [
  {
    id: 'biomecanique',
    title: 'Replay — Biomécanique : maîtriser les clés de l’excellence en orthodontie',
    speaker: 'Dr Skander Ellouze',
    productId: 'gid://shopify/Product/16510826709337',
    handle: 'replay-biomecanique-maitriser-les-cles-de-lexcellence-en-orthodontie',
    image: 'https://cdn.shopify.com/s/files/1/0919/4356/7705/files/Dr_skander_Ellouze.png?v=1768831208',
    value: 249,
  },
  {
    id: 'contentions',
    title: 'Replay — Adieu les urgences : maîtriser le collage des contentions',
    speaker: 'Dr Philippides',
    productId: 'gid://shopify/Product/16510798201177',
    handle: 'replay-adieu-les-urgences-maitriser-le-collage-des-contentions',
    image: 'https://cdn.shopify.com/s/files/1/0919/4356/7705/files/Dr_Isabel_QUERALTO_1_e60be294-b6e2-488a-8220-56834f88d9df.png?v=1768831220',
    value: 249,
  },
];

config.adminEnabled = Boolean(config.adminDomain && (config.admin.token || (config.admin.clientId && config.admin.clientSecret)));

module.exports = config;
