// Fin de partie et attribution des lots — partagé par la borne (WebSocket) et la page du site.
const config = require('./config');
const store = require('./store');
const shopify = require('./shopify');

const claims = new Map(); // customerId → expiration : droit de choisir un lot
const claiming = new Set();

const prizesLeft = () => Math.max(0, config.maxPrizes - store.prizesGiven());

async function recordGame(customer, { won, score, wave, seconds, source }) {
  const legitWin = Boolean(won) && seconds >= config.minWinSeconds;
  const safeScore = Math.max(0, Math.min(Number(score) || 0, 999_999));

  store.addScore({
    customerId: customer.id, name: customer.name, email: customer.email,
    score: safeScore, wave: Number(wave) || 0, won: legitWin, source,
    seconds: Math.round(seconds), at: new Date().toISOString(),
  });

  const result = { won: legitWin, score: safeScore, eligible: false, reason: null, previous: null };
  if (!legitWin) {
    if (won) result.reason = 'tooFast';
    return result;
  }
  const previous = store.getWinner(customer.id);
  if (previous) {
    result.reason = 'already';
    result.previous = previous;
  } else if (!prizesLeft()) {
    result.reason = 'soldout';
  } else {
    try {
      if (await shopify.hasWinnerTag(customer.id)) result.reason = 'already';
      else result.eligible = true;
    } catch (err) {
      console.error('[shopify] vérification du tag', err);
      result.eligible = true; // le verrou local + le code à usage unique suffisent
    }
  }
  if (result.eligible) claims.set(customer.id, Date.now() + 15 * 60_000);
  return result;
}

const hasPendingClaim = (customerId) => (claims.get(customerId) || 0) > Date.now();

async function claim(customer, rewardId) {
  const reward = config.rewards.find((r) => r.id === rewardId);
  if (!hasPendingClaim(customer.id)) return { error: 'Délai dépassé : contactez l’équipe Capsule sur le stand.' };
  if (!reward) return { error: 'Lot inconnu.' };
  if (claiming.has(customer.id)) return { error: 'Attribution déjà en cours…' };

  claiming.add(customer.id);
  try {
    const granted = await shopify.grantReward(customer, reward);
    const record = { ...granted, rewardId: reward.id, rewardTitle: reward.title, speaker: reward.speaker, at: new Date().toISOString() };
    store.saveWinner(customer.id, record);
    claims.delete(customer.id);
    return { ok: true, ...record };
  } catch (err) {
    console.error('[shopify] attribution du lot', err);
    return { error: 'Impossible de créer votre code. Passez au stand Capsule, votre victoire est enregistrée.' };
  } finally {
    claiming.delete(customer.id);
  }
}

// Tags « jeuJO » (+ profession) sur chaque praticien qui se connecte pour jouer.
function tagPlayer(customer, extra = []) {
  if (customer.source === 'demo') return;
  const tags = [...config.playerTags, ...extra];
  shopify.tagCustomer(customer.id, tags).catch((err) => console.error('[shopify] tag joueur', err.message));
}

module.exports = { recordGame, claim, prizesLeft, hasPendingClaim, tagPlayer };
