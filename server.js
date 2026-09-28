// CAPSULE · ORTHO INVADERS — serveur de la borne d'arcade.
// Grand écran (/screen) ⇄ serveur ⇄ téléphone-manette (/play), temps réel via WebSocket.
const http = require('http');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const QRCode = require('qrcode');
const { Server } = require('socket.io');

const config = require('./src/config');
const store = require('./src/store');
const shopify = require('./src/shopify');
const authRouter = require('./src/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const secureCookies = config.publicUrl.startsWith('https://');
if (secureCookies) app.set('trust proxy', 1);

const sessionMiddleware = session({
  name: 'capsule_arcade',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: secureCookies, maxAge: 12 * 3600 * 1000 },
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(authRouter);
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
// Polices rétro servies en local : la borne fonctionne même sans Internet fiable sur le salon.
app.use('/fonts', express.static(path.join(__dirname, 'node_modules', '@fontsource'), { maxAge: '7d' }));

app.get('/api/config', (req, res) => {
  res.json({
    authMode: config.authMode,
    rewards: config.rewards.map(({ id, title, speaker, image, value }) => ({ id, title, speaker, image, value })),
  });
});

app.use((err, req, res, _next) => {
  console.error('[http]', err);
  res.status(500).send('Oups, la borne a eu un souci. Rescannez le QR code.');
});

// ── Salles de jeu (une par écran) ───────────────────────────
const rooms = new Map();
const claims = new Map(); // customerId → { gameId, expiresAt } : droit de choisir un lot
const claiming = new Set();

const START_TIMEOUT_MS = 30_000;
const RECONNECT_GRACE_MS = 20_000;
const NEXT_PLAYER_DELAY_MS = 9_000;

function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = [...crypto.randomBytes(4)].map((b) => alphabet[b % alphabet.length]).join('');
  } while (rooms.has(code));
  return code;
}

function lanAddress() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces || []) if (i.family === 'IPv4' && !i.internal) return i.address;
  }
  return 'localhost';
}

function baseUrl(socket) {
  if (config.publicUrl) return config.publicUrl;
  const host = socket.handshake.headers.host || `localhost:${config.port}`;
  // Écran ouvert en localhost : le téléphone doit viser l'IP du réseau local.
  return `http://${host.replace(/^(localhost|127\.0\.0\.1)/, lanAddress())}`;
}

function prizesLeft() {
  return Math.max(0, config.maxPrizes - store.prizesGiven());
}

function queueView(room) {
  return room.queue.map((p) => p.customer.name);
}

function broadcastRoom(room) {
  room.screen?.emit('queue', {
    queue: queueView(room),
    current: room.current?.customer.name || null,
    leaderboard: store.leaderboard(),
    prizesLeft: prizesLeft(),
  });
  room.queue.forEach((p, i) => io.to(p.socketId).emit('queue:position', { position: i + 1 }));
}

function endTurn(room, delay = 0) {
  clearTimeout(room.current?.timer);
  room.current = null;
  broadcastRoom(room);
  setTimeout(() => tryStart(room), delay);
}

function tryStart(room) {
  if (!room.screen || room.current || !room.queue.length) return;
  const next = room.queue.shift();
  const gameId = crypto.randomUUID();
  room.current = { ...next, gameId, startedAt: null };
  room.current.timer = setTimeout(() => {
    // Le joueur n'a pas appuyé sur START : au suivant.
    if (room.current?.gameId === gameId && !room.current.startedAt) {
      io.to(room.current.socketId).emit('turn:skipped');
      room.screen?.emit('game:cancel');
      endTurn(room);
    }
  }, START_TIMEOUT_MS);
  room.screen.emit('game:ready', { gameId, name: next.customer.name });
  io.to(next.socketId).emit('turn', { gameId });
  broadcastRoom(room);
}

io.on('connection', (socket) => {
  const { role, key, room: wantedRoom } = socket.handshake.auth || {};

  // ── Écran ────────────────────────────────────────────────
  if (role === 'screen') {
    if (config.screenKey && key !== config.screenKey) {
      socket.emit('fatal', 'Clé écran invalide : ouvrez /screen?key=…');
      return socket.disconnect(true);
    }
    let room = rooms.get(wantedRoom);
    if (!room) {
      room = { code: /^[A-Z0-9]{4}$/.test(wantedRoom || '') ? wantedRoom : roomCode(), queue: [], current: null };
      rooms.set(room.code, room);
    }
    room.screen?.disconnect(true);
    room.screen = socket;

    const joinUrl = `${baseUrl(socket)}/play?room=${room.code}`;
    QRCode.toDataURL(joinUrl, { margin: 1, width: 360, color: { dark: '#12062e', light: '#ffffff' } })
      .then((qr) => socket.emit('room', { code: room.code, joinUrl, qr }));
    broadcastRoom(room);
    if (room.current) {
      // Écran rechargé en pleine partie : on annule proprement.
      io.to(room.current.socketId).emit('turn:skipped');
      endTurn(room);
    } else {
      tryStart(room);
    }

    socket.on('game:over', async ({ gameId, won, score, wave } = {}) => {
      const cur = room.current;
      if (!cur || cur.gameId !== gameId || !cur.startedAt) return;
      const seconds = (Date.now() - cur.startedAt) / 1000;
      const legitWin = Boolean(won) && seconds >= config.minWinSeconds;
      const safeScore = Math.max(0, Math.min(Number(score) || 0, 999_999));
      const { customer, socketId } = cur;

      store.addScore({
        customerId: customer.id, name: customer.name, email: customer.email,
        score: safeScore, wave: Number(wave) || 0, won: legitWin,
        seconds: Math.round(seconds), at: new Date().toISOString(),
      });

      const result = { won: legitWin, score: safeScore, eligible: false, reason: null, previous: null };
      if (legitWin) {
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
        if (result.eligible) claims.set(customer.id, { gameId, expiresAt: Date.now() + 15 * 60_000 });
      }
      io.to(socketId).emit('game:result', result);
      endTurn(room, NEXT_PLAYER_DELAY_MS);
    });

    // Retour vers la manette : score/vies en direct + vibrations.
    socket.on('feedback', (data = {}) => {
      if (room.current?.startedAt) io.to(room.current.socketId).volatile.emit('feedback', data);
    });

    socket.on('disconnect', () => {
      if (room.screen === socket) room.screen = null;
    });
    return;
  }

  // ── Téléphone-manette ────────────────────────────────────
  const customer = socket.request.session?.customer;
  const room = rooms.get(wantedRoom);
  if (!customer) {
    socket.emit('fatal', 'Connectez-vous avec votre compte Capsule.');
    return socket.disconnect(true);
  }
  if (!room) {
    socket.emit('fatal', 'Borne introuvable : rescannez le QR code affiché à l’écran.');
    return socket.disconnect(true);
  }

  const isCurrent = () => room.current?.customer.id === customer.id && room.current.socketId === socket.id;

  // Reconnexion pendant son tour (écran de veille, réseau…)
  if (room.current?.customer.id === customer.id) {
    room.current.socketId = socket.id;
    clearTimeout(room.current.graceTimer);
    socket.emit(room.current.startedAt ? 'game:resume' : 'turn', { gameId: room.current.gameId });
  }
  // Victoire obtenue mais lot pas encore choisi (téléphone rechargé) : on repropose le choix.
  if (claims.get(customer.id)?.expiresAt > Date.now()) {
    socket.emit('game:result', { won: true, score: null, eligible: true, reason: null, previous: null });
  }

  socket.on('queue:join', () => {
    if (room.current?.customer.id === customer.id) return;
    const existing = room.queue.find((p) => p.customer.id === customer.id);
    if (existing) existing.socketId = socket.id;
    else room.queue.push({ customer, socketId: socket.id });
    broadcastRoom(room);
    tryStart(room);
  });

  socket.on('queue:leave', () => {
    room.queue = room.queue.filter((p) => p.customer.id !== customer.id);
    broadcastRoom(room);
  });

  socket.on('game:start', () => {
    if (!isCurrent() || room.current.startedAt) return;
    room.current.startedAt = Date.now();
    clearTimeout(room.current.timer);
    room.screen?.emit('game:start', { gameId: room.current.gameId, name: customer.name });
  });

  socket.on('input', (state) => {
    if (!isCurrent() || !room.current.startedAt) return;
    const x = Math.max(-1, Math.min(1, Number(state?.x) || 0));
    room.screen?.volatile.emit('input', { x, fire: Boolean(state?.fire), bomb: Boolean(state?.bomb) });
  });

  socket.on('reward:claim', async ({ rewardId } = {}, ack = () => {}) => {
    const claim = claims.get(customer.id);
    const reward = config.rewards.find((r) => r.id === rewardId);
    if (!claim || claim.expiresAt < Date.now()) return ack({ error: 'Délai dépassé : contactez l’équipe Capsule sur le stand.' });
    if (!reward) return ack({ error: 'Lot inconnu.' });
    if (claiming.has(customer.id)) return ack({ error: 'Attribution déjà en cours…' });

    claiming.add(customer.id);
    try {
      const granted = await shopify.grantReward(customer, reward);
      const record = { ...granted, rewardId: reward.id, rewardTitle: reward.title, at: new Date().toISOString() };
      store.saveWinner(customer.id, record);
      claims.delete(customer.id);
      room.screen?.emit('winner', { name: customer.name, reward: reward.title, speaker: reward.speaker });
      broadcastRoom(room);
      ack({ ok: true, ...record });
    } catch (err) {
      console.error('[shopify] attribution du lot', err);
      ack({ error: 'Impossible de créer votre code. Passez au stand Capsule, votre victoire est enregistrée.' });
    } finally {
      claiming.delete(customer.id);
    }
  });

  socket.on('disconnect', () => {
    room.queue = room.queue.filter((p) => p.socketId !== socket.id);
    if (room.current?.socketId === socket.id) {
      room.current.graceTimer = setTimeout(() => {
        if (room.current?.socketId !== socket.id) return;
        room.screen?.emit('game:cancel');
        endTurn(room);
      }, RECONNECT_GRACE_MS);
    }
    broadcastRoom(room);
  });
});

server.listen(config.port, () => {
  const mode = config.adminEnabled ? 'Shopify Admin connecté' : 'MODE DÉMO (aucun code réel créé)';
  console.log(`\n  CAPSULE · ORTHO INVADERS`);
  console.log(`  Écran    : http://localhost:${config.port}/screen${config.screenKey ? '?key=…' : ''}`);
  console.log(`  Manette  : via le QR code affiché à l'écran`);
  console.log(`  Auth     : ${config.authMode} · Lots : ${mode}\n`);
});
