// Jeu intégré à la page capsule-med.com/pages/ortho-invaders (compte client classique Shopify).
// La page détecte le client connecté ; ce serveur le retrouve via l'API Admin, le tague « jeuJO »
// et gère parties + lots. Le code gagné est réservé à ce compte : inutilisable par un tiers.
const crypto = require('crypto');
const express = require('express');
const config = require('./config');
const store = require('./store');
const shopify = require('./shopify');
const rewards = require('./rewards');

const router = express.Router();
const games = new Map(); // gameId → { customerId, startedAt }
const profiles = new Map(); // customerId → { customer, at }

router.use('/api/web', (req, res, next) => {
  const origin = req.get('origin');
  if (origin && config.storeOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
}, express.json({ limit: '4kb' }));

function toGid(id) {
  const n = String(id || '').replace('gid://shopify/Customer/', '');
  return /^\d{1,20}$/.test(n) ? `gid://shopify/Customer/${n}` : null;
}

async function loadCustomer(rawId) {
  const id = toGid(rawId);
  if (!id) return null;
  const cached = profiles.get(id);
  if (cached && Date.now() - cached.at < 30 * 60_000) return cached.customer;
  let customer;
  if (config.adminEnabled) {
    const c = await shopify.getCustomer(id);
    if (!c) return null;
    const first = (c.firstName || '').trim();
    customer = {
      id, email: c.email, firstName: c.firstName, lastName: c.lastName, source: 'site',
      name: first ? `${first}${c.lastName ? ` ${c.lastName.trim().charAt(0)}.` : ''}` : (c.email || 'Docteur').split('@')[0],
      tags: c.tags,
    };
  } else {
    customer = { id, email: null, name: 'Docteur', source: 'demo' };
  }
  profiles.set(id, { customer, at: Date.now() });
  return customer;
}

const guard = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('[web]', err);
    res.status(502).json({ error: 'Le jeu ne répond pas, réessayez dans un instant.' });
  }
};

// Le praticien connecté arrive sur la page : tag + état (déjà gagné ? lots restants ?)
router.post('/api/web/hello', guard(async (req, res) => {
  const customer = await loadCustomer(req.body?.customerId);
  if (!customer) return res.status(401).json({ error: 'Connectez-vous à votre compte Capsule pour jouer.' });
  const alreadyTagged = (customer.tags || []).includes(config.playerTags[0]);
  rewards.tagPlayer(customer, alreadyTagged ? [] : ['jeuJO-site']);
  res.json({
    name: customer.name,
    prizesLeft: rewards.prizesLeft(),
    previous: store.getWinner(customer.id) || null,
    rewards: config.rewards.map(({ id, title, speaker, image, value, handle }) => ({ id, title, speaker, image, value, handle })),
  });
}));

router.post('/api/web/start', guard(async (req, res) => {
  const customer = await loadCustomer(req.body?.customerId);
  if (!customer) return res.status(401).json({ error: 'Connectez-vous pour jouer.' });
  if (games.size > 5000) games.clear();
  const gameId = crypto.randomUUID();
  games.set(gameId, { customerId: customer.id, startedAt: Date.now() });
  res.json({ gameId });
}));

router.post('/api/web/end', guard(async (req, res) => {
  const { gameId, won, score, wave } = req.body || {};
  const game = games.get(gameId);
  if (!game) return res.status(404).json({ error: 'Partie inconnue.' });
  games.delete(gameId);
  const customer = await loadCustomer(game.customerId);
  const seconds = (Date.now() - game.startedAt) / 1000;
  res.json(await rewards.recordGame(customer, { won, score, wave, seconds, source: 'site' }));
}));

router.post('/api/web/claim', guard(async (req, res) => {
  const customer = await loadCustomer(req.body?.customerId);
  if (!customer) return res.status(401).json({ error: 'Connectez-vous pour récupérer votre lot.' });
  res.json(await rewards.claim(customer, req.body?.rewardId));
}));

module.exports = router;
