// Construit shopify/ortho-invaders-site.js : un seul fichier, hébergé dans Shopify (Contenu › Fichiers),
// chargé par la page capsule-med.com/pages/ortho-invaders. Aucun serveur nécessaire.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const bundle = [
  '/* Ortho Invaders — Capsule · build ' + new Date().toISOString().slice(0, 10) + ' */',
  read('public/js/sprites.js'),
  read('public/js/audio.js'),
  'window.__orthoInvadersGame = function () {',
  read('public/js/game.js'),
  '};',
  read('shopify/pad-link.js'),
  read('shopify/site-ui.js'),
].join('\n');

fs.writeFileSync(path.join(root, 'shopify/ortho-invaders-site.js'), bundle);
console.log(`shopify/ortho-invaders-site.js — ${(bundle.length / 1024).toFixed(1)} Ko`);
