// Téléphone = manette : connexion Capsule, file d'attente, boutons / inclinaison, vibrations, lot.
(function () {
  const $ = (id) => document.getElementById(id);
  const room = (new URLSearchParams(location.search).get('room') || '').toUpperCase();

  let socket = null;
  let rewards = [];
  let controlMode = 'buttons';
  let wakeLock = null;
  let turnTimer = null;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function view(id) {
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('on', v.id === id));
    scrollTo(0, 0);
  }

  const vibrate = (pattern) => navigator.vibrate?.(pattern);
  const HAPTICS = { hit: 15, hurt: [90, 40, 140], power: [20, 30, 20], win: [120, 60, 120, 60, 400], lose: 450 };

  // ── Démarrage ────────────────────────────────────────────
  async function init() {
    if (!/^[A-Z0-9]{4}$/.test(room)) {
      view('v-loading');
      document.querySelector('#v-loading h1').textContent = 'SCANNEZ LE QR CODE DE LA BORNE';
      document.querySelector('#v-loading h1').classList.remove('blink');
      return;
    }
    const [me, cfg] = await Promise.all([
      fetch('/api/me').then((r) => r.json()),
      fetch('/api/config').then((r) => r.json()),
    ]);
    rewards = cfg.rewards;
    $('lobbyRewards').innerHTML = rewards.map(rewardCard).join('');
    if (!me.customer) return showLogin(me.authMode);
    connect(me.customer);
  }

  function rewardCard(r, asButton) {
    const tag = asButton ? 'button' : 'div';
    return `<${tag} class="reward" data-id="${r.id}">
      <img src="${r.image}" alt="">
      <span><span class="who">${esc(r.speaker)}</span><br><span class="what">${esc(r.title.replace(/^Replay —\s*/, ''))}</span></span>
    </${tag}>`;
  }

  // ── Connexion ────────────────────────────────────────────
  function showLogin(mode) {
    view('v-login');
    document.querySelectorAll('[data-mode]').forEach((el) => { el.hidden = el.dataset.mode !== mode; });
    $('oauthBtn').href = `/auth/login?room=${room}`;
  }

  async function postLogin(url, body) {
    $('loginError').textContent = '';
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return ($('loginError').textContent = json.error || 'Connexion impossible.');
    connect(json.customer);
  }

  $('sfForm').addEventListener('submit', (e) => {
    e.preventDefault();
    postLogin('/auth/storefront', { email: $('sfEmail').value, password: $('sfPass').value });
  });
  $('demoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    postLogin('/auth/demo', { firstName: $('dName').value, email: $('dEmail').value });
  });
  $('logoutBtn').addEventListener('click', async () => {
    await fetch('/auth/logout', { method: 'POST' });
    location.reload();
  });

  // ── Temps réel ───────────────────────────────────────────
  function connect(customer) {
    $('hello').textContent = `BONJOUR ${customer.name.toUpperCase()} !`;
    view('v-lobby');
    socket = io({ auth: { role: 'player', room } });

    socket.on('fatal', (msg) => {
      view('v-loading');
      const h = document.querySelector('#v-loading h1');
      h.classList.remove('blink');
      h.textContent = msg;
    });
    socket.on('queue:position', ({ position }) => {
      $('joinBox').hidden = true;
      $('waitBox').hidden = false;
      $('pos').textContent = position;
    });
    socket.on('turn', () => {
      view('v-turn');
      vibrate([200, 100, 200]);
      let left = 30;
      clearInterval(turnTimer);
      $('turnCount').textContent = `${left} s`;
      turnTimer = setInterval(() => { left -= 1; $('turnCount').textContent = `${Math.max(0, left)} s`; }, 1000);
    });
    socket.on('turn:skipped', () => {
      clearInterval(turnTimer);
      resetLobby();
      view('v-lobby');
    });
    socket.on('game:resume', () => showPad());
    socket.on('feedback', ({ hud, haptic }) => {
      if (haptic) vibrate(HAPTICS[haptic] || 20);
      if (hud) {
        $('hScore').textContent = String(hud.score).padStart(6, '0');
        $('hLives').textContent = '♥'.repeat(Math.max(0, Math.min(hud.lives, 6)));
        $('hWave').textContent = hud.wave > 3 ? 'BOSS' : `VAGUE ${hud.wave}`;
      }
    });
    socket.on('game:result', showResult);
  }

  function resetLobby() {
    $('joinBox').hidden = false;
    $('waitBox').hidden = true;
  }

  $('joinBtn').addEventListener('click', () => socket.emit('queue:join'));
  $('leaveBtn').addEventListener('click', () => { socket.emit('queue:leave'); resetLobby(); });

  // ── Mode de contrôle ─────────────────────────────────────
  $('modeButtons').addEventListener('click', () => setMode('buttons'));
  $('modeTilt').addEventListener('click', async () => {
    // iOS : l'accès au gyroscope exige une autorisation déclenchée par un geste.
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') return;
      } catch { return; }
    }
    if (!('DeviceOrientationEvent' in window)) return;
    setMode('tilt');
  });

  function setMode(mode) {
    controlMode = mode;
    $('modeButtons').classList.toggle('on', mode === 'buttons');
    $('modeTilt').classList.toggle('on', mode === 'tilt');
    $('pad').classList.toggle('tilt', mode === 'tilt');
    $('modeHelp').textContent = mode === 'tilt'
      ? 'Inclinez le téléphone à gauche / à droite pour bouger, le bouton rose pour tirer.'
      : 'Deux flèches pour bouger, le gros bouton rose pour tirer.';
  }

  // ── START ────────────────────────────────────────────────
  $('startBtn').addEventListener('click', async () => {
    clearInterval(turnTimer);
    try { await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }); } catch {}
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
    socket.emit('game:start');
    showPad();
  });

  function showPad() {
    view('v-pad');
    calibrate = true;
    $('hScore').textContent = '000000';
    $('hLives').textContent = '♥♥♥';
    $('hWave').textContent = 'PRÊT ?';
  }

  // ── Manette : état + envoi ───────────────────────────────
  const state = { x: 0, fire: false };
  const held = new Map(); // pointerId → direction
  let sent = '';
  let lastSend = 0;

  function send(force) {
    if (!socket) return;
    const key = `${state.x.toFixed(2)}|${state.fire}`;
    const now = performance.now();
    if (!force && key === sent) return;
    if (!force && now - lastSend < 33 && key.split('|')[1] === sent.split('|')[1]) return; // limite le flot du gyroscope
    sent = key;
    lastSend = now;
    socket.emit('input', state);
  }
  // Réémission régulière : rattrape un paquet perdu sur un Wi-Fi chargé.
  setInterval(() => { if ($('v-pad').classList.contains('on')) send(true); }, 150);

  function updateButtonsX() {
    if (controlMode !== 'buttons') return;
    const dirs = [...held.values()];
    state.x = dirs.length ? dirs[dirs.length - 1] : 0;
    document.querySelectorAll('.dir').forEach((b) => b.classList.toggle('down', dirs.includes(Number(b.dataset.dir))));
    send();
  }

  document.querySelectorAll('.dir').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.setPointerCapture?.(e.pointerId);
      held.set(e.pointerId, Number(btn.dataset.dir));
      updateButtonsX();
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      btn.addEventListener(ev, (e) => { held.delete(e.pointerId); updateButtonsX(); });
    }
  });

  const fire = $('fire');
  const firePointers = new Set();
  fire.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    fire.setPointerCapture?.(e.pointerId);
    firePointers.add(e.pointerId);
    state.fire = true;
    fire.classList.add('down');
    vibrate(8);
    send();
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    fire.addEventListener(ev, (e) => {
      firePointers.delete(e.pointerId);
      state.fire = firePointers.size > 0;
      fire.classList.toggle('down', state.fire);
      send();
    });
  }
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Inclinaison (gyroscope)
  let neutral = 0;
  let calibrate = true;
  function tiltAngle(e) {
    const angle = screen.orientation?.angle ?? window.orientation ?? 0;
    if (angle === 90) return e.beta;
    if (angle === -90 || angle === 270) return -e.beta;
    return e.gamma;
  }
  addEventListener('deviceorientation', (e) => {
    if (controlMode !== 'tilt' || e.gamma == null) return;
    const a = tiltAngle(e);
    if (calibrate) { neutral = a; calibrate = false; }
    let x = (a - neutral) / 18;
    if (Math.abs(x) < 0.12) x = 0;
    state.x = Math.max(-1, Math.min(1, x));
    $('tiltDot').style.left = `${41 + state.x * 41}%`;
    send();
  });
  $('recal').addEventListener('click', () => { calibrate = true; });

  // ── Résultat & lot ───────────────────────────────────────
  function showResult(r) {
    wakeLock?.release?.();
    wakeLock = null;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    state.x = 0;
    state.fire = false;
    held.clear();
    firePointers.clear();
    resetLobby();

    view('v-result');
    $('rTitle').textContent = r.won ? '★ VICTOIRE ★' : 'GAME OVER';
    $('rScore').textContent = r.score != null ? `SCORE ${r.score}` : '';
    $('rError').textContent = '';
    $('rRewards').innerHTML = '';
    $('rCode').hidden = true;
    $('againBtn').hidden = false;

    if (!r.won) {
      $('rText').textContent = 'La Méga-Carie a gagné cette manche… Retentez votre chance, les replays vous attendent !';
      return;
    }
    if (r.eligible) {
      $('rText').textContent = 'Bravo docteur ! Choisissez votre replay de formation offert :';
      $('rRewards').innerHTML = rewards.map((rw) => rewardCard(rw, true)).join('');
      $('againBtn').hidden = true;
      $('rRewards').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => claim(b.dataset.id)));
      return;
    }
    if (r.reason === 'already') {
      $('rText').textContent = 'Encore gagné ! Un seul replay par compte, mais votre score entre au classement.';
      if (r.previous) showCode(r.previous);
      return;
    }
    if (r.reason === 'soldout') {
      $('rText').textContent = 'Bravo ! Tous les replays du jour ont été distribués. Passez au stand Capsule, une surprise vous attend.';
      return;
    }
    $('rText').textContent = 'Bravo ! Partie un peu trop rapide pour valider le lot : passez au stand Capsule.';
  }

  function claim(rewardId) {
    $('rRewards').querySelectorAll('button').forEach((b) => { b.disabled = true; });
    $('rText').textContent = 'Création de votre code…';
    socket.emit('reward:claim', { rewardId }, (res) => {
      if (res.error) {
        $('rError').textContent = res.error;
        $('rRewards').querySelectorAll('button').forEach((b) => { b.disabled = false; });
        return;
      }
      vibrate(HAPTICS.win);
      $('rText').textContent = `Votre replay : ${res.rewardTitle.replace(/^Replay —\s*/, '')}`;
      $('rRewards').innerHTML = '';
      showCode(res);
      $('againBtn').hidden = false;
    });
  }

  function showCode(rec) {
    $('rCode').hidden = false;
    $('codeValue').textContent = rec.code;
    $('codeLink').href = rec.url;
  }

  $('copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('codeValue').textContent);
      $('copyBtn').textContent = 'Copié ✓';
    } catch {
      $('copyBtn').textContent = 'Appui long sur le code';
    }
  });

  $('againBtn').addEventListener('click', () => {
    view('v-lobby');
    socket.emit('queue:join');
  });

  init().catch(() => {
    document.querySelector('#v-loading h1').textContent = 'CONNEXION IMPOSSIBLE — RÉESSAYEZ';
  });
})();
