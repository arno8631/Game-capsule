// Persistance minimale (fichiers JSON) : suffisant pour une borne d'événement.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

function load(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), 'utf8'));
  } catch {
    return fallback;
  }
}

function save(name, value) {
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

const scores = load('scores', []);
const winners = load('winners', {});
const played = load('played', {}); // une partie par participant

module.exports = {
  addScore(entry) {
    scores.push(entry);
    save('scores', scores);
  },

  // Meilleur score par joueur, du jour en cours.
  leaderboard(limit = 8) {
    const today = new Date().toISOString().slice(0, 10);
    const best = new Map();
    for (const s of scores) {
      if (!s.at.startsWith(today)) continue;
      const prev = best.get(s.customerId);
      if (!prev || s.score > prev.score) best.set(s.customerId, s);
    }
    return [...best.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ name, score, won }) => ({ name, score, won }));
  },

  hasPlayed: (customerId) => Boolean(played[customerId]),
  markPlayed(customerId) {
    played[customerId] = new Date().toISOString();
    save('played', played);
  },
  getWinner: (customerId) => winners[customerId],
  prizesGiven: () => Object.keys(winners).length,
  saveWinner(customerId, record) {
    winners[customerId] = record;
    save('winners', winners);
  },
};
