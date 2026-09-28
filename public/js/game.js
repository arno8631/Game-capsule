// ORTHO INVADERS — moteur de jeu (canvas 384×216, mis à l'échelle en pixels nets).
// 3 vagues (bactéries → plaque → sucres) puis le boss « MÉGA-CARIE ». Vaincre le boss = VICTOIRE.
(function () {
  const W = 384, H = 216;
  const PLAYER_Y = 194;
  const TOOTH_Y = 164;
  const INVASION_Y = 184;

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  const S = Sprites.load();

  function fit() {
    const scale = Math.min(innerWidth / W, innerHeight / H);
    canvas.style.width = `${Math.floor(W * scale)}px`;
    canvas.style.height = `${Math.floor(H * scale)}px`;
  }
  addEventListener('resize', fit);
  fit();

  // ── Contenu pédagogique affiché entre les vagues ──────────
  const WAVES = [
    {
      title: 'VAGUE 1/3 · LES BACTÉRIES',
      tip: 'Le biofilm dentaire se reconstitue en quelques heures après le brossage.',
      rows: ['plaq', 'bact', 'bact'], cols: 8, speed: 12, fire: 1.3, bulletSpeed: 62,
    },
    {
      title: 'VAGUE 2/3 · LA PLAQUE ATTAQUE',
      tip: 'Brackets et fils multiplient les zones de rétention : l’hygiène est la clé du traitement.',
      rows: ['candy', 'plaq', 'plaq', 'bact'], cols: 8, speed: 16, fire: 0.95, bulletSpeed: 74,
    },
    {
      title: 'VAGUE 3/3 · INVASION SUCRÉE',
      tip: 'Chaque apport sucré relance l’acidité salivaire : attention aux grignotages sous appareil.',
      rows: ['candy', 'candy', 'plaq', 'bact'], cols: 9, speed: 19, fire: 0.75, bulletSpeed: 84,
    },
  ];
  const BOSS_INTRO = {
    title: 'ALERTE · MÉGA-CARIE',
    tip: 'Un ancrage solide fait toute la différence. Tenez bon, docteur !',
  };
  const ENEMY = {
    bact: { points: 10, hp: 1 },
    plaq: { points: 20, hp: 1 },
    candy: { points: 30, hp: 2 },
  };
  const POWERUPS = [
    { type: 'bracket', label: 'TIR TRIPLE', weight: 35 },
    { type: 'elastic', label: 'TIR RAPIDE', weight: 35 },
    { type: 'fluor', label: 'BOUCLIER FLUOR', weight: 20 },
    { type: 'life', label: '+1 VIE', weight: 10 },
  ];

  // ── Entrées : manette téléphone, clavier, manette Bluetooth (Gamepad API) ──
  const remote = { x: 0, fire: false };
  const keys = {};
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', (e) => { keys[e.code] = false; });

  function readInput() {
    let x = remote.x;
    let fire = remote.fire;
    if (keys.ArrowLeft || keys.KeyA || keys.KeyQ) x = -1;
    if (keys.ArrowRight || keys.KeyD) x = 1;
    if (keys.Space || keys.ArrowUp) fire = true;
    for (const pad of navigator.getGamepads ? navigator.getGamepads() : []) {
      if (!pad) continue;
      const ax = pad.axes[0] || 0;
      if (Math.abs(ax) > 0.25) x = ax;
      if (pad.buttons[14]?.pressed) x = -1;
      if (pad.buttons[15]?.pressed) x = 1;
      if (pad.buttons[0]?.pressed || pad.buttons[1]?.pressed || pad.buttons[7]?.pressed) fire = true;
    }
    return { x: Math.max(-1, Math.min(1, x)), fire };
  }

  // ── Dents-boucliers destructibles (masque au pixel) ───────
  function makeTooth(x) {
    const cv = document.createElement('canvas');
    cv.width = S.tooth.width;
    cv.height = S.tooth.height;
    const c = cv.getContext('2d');
    c.drawImage(S.tooth, 0, 0);
    const data = c.getImageData(0, 0, cv.width, cv.height).data;
    const mask = new Uint8Array(cv.width * cv.height);
    for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 0 ? 1 : 0;
    return { x, y: TOOTH_Y, w: cv.width, h: cv.height, cv, c, mask };
  }

  function toothHit(t, px, py, radius) {
    const lx = Math.floor(px - t.x), ly = Math.floor(py - t.y);
    if (lx < 0 || ly < 0 || lx >= t.w || ly >= t.h || !t.mask[ly * t.w + lx]) return false;
    t.c.save();
    t.c.globalCompositeOperation = 'destination-out';
    t.c.beginPath();
    t.c.arc(lx, ly, radius, 0, Math.PI * 2);
    t.c.fill();
    t.c.restore();
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const mx = lx + x, my = ly + y;
        if (x * x + y * y <= radius * radius && mx >= 0 && my >= 0 && mx < t.w && my < t.h) t.mask[my * t.w + mx] = 0;
      }
    }
    return true;
  }

  // ── État ─────────────────────────────────────────────────
  let g = null;           // partie en cours
  let mode = 'attract';   // attract | intro | play | banner | over
  let session = null;     // { gameId, name, onEnd, onFeedback }
  let time = 0;
  let lastHud = '';
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * 120, s: Math.random() }));

  function newGame() {
    g = {
      score: 0, lives: 3, wave: 0,
      player: { x: W / 2 - 7, inv: 0, cool: 0, triple: 0, rapid: 0, shield: false, flash: 0 },
      bullets: [], ebullets: [], enemies: [], powerups: [], particles: [], popups: [],
      teeth: [0, 1, 2, 3].map((i) => makeTooth(38 + i * 92)),
      boss: null, dir: 1, fireT: 1.5, marchT: 0, marchI: 0, banner: null, total: 0,
      started: performance.now(),
    };
  }

  function spawnWave(i) {
    const def = WAVES[i];
    g.enemies = [];
    const gapX = 20, gapY = 15;
    const startX = Math.round((W - (def.cols - 1) * gapX - 11) / 2);
    def.rows.forEach((type, r) => {
      for (let c = 0; c < def.cols; c++) {
        g.enemies.push({ type, x: startX + c * gapX, y: 26 + r * gapY, row: r, hp: ENEMY[type].hp, flash: 0 });
      }
    });
    g.total = g.enemies.length;
    g.dir = 1;
    g.fireT = 2;
  }

  function showBanner(title, tip, next, duration = 3.2) {
    mode = 'banner';
    g.banner = { title, tip, t: duration, next };
  }

  function nextWave() {
    g.wave += 1;
    g.bullets = [];
    g.ebullets = [];
    if (g.wave <= WAVES.length) {
      Sfx.wave();
      showBanner(WAVES[g.wave - 1].title, WAVES[g.wave - 1].tip, () => spawnWave(g.wave - 1));
    } else {
      Sfx.boss();
      showBanner(BOSS_INTRO.title, BOSS_INTRO.tip, () => {
        g.enemies = [];
        g.boss = { x: W / 2 - 24, y: 24, hp: 80, max: 80, t: 0, flash: 0, fireT: 2, aimT: 3, dead: 0 };
      });
    }
  }

  function feedback(data) {
    session?.onFeedback?.(data);
  }

  function burst(x, y, colors, n = 12, speed = 60) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.3 + Math.random());
      g.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.4 + Math.random() * 0.4, color: colors[i % colors.length] });
    }
  }

  function popup(x, y, text, color = '#ffd319') {
    g.popups.push({ x, y, text, color, life: 1 });
  }

  function addScore(n) {
    g.score += n;
  }

  function dropPowerup(x, y, chance) {
    if (Math.random() > chance) return;
    const pool = POWERUPS.filter((p) => p.type !== 'life' || g.lives < 5);
    let r = Math.random() * pool.reduce((s, p) => s + p.weight, 0);
    const pick = pool.find((p) => (r -= p.weight) < 0) || pool[0];
    g.powerups.push({ ...pick, x, y });
  }

  function hurtPlayer() {
    const p = g.player;
    if (p.inv > 0 || mode !== 'play') return;
    if (p.shield) {
      p.shield = false;
      p.inv = 1;
      Sfx.hit();
      burst(p.x + 7, PLAYER_Y + 4, ['#2de2e6', '#fff'], 14);
      return;
    }
    g.lives -= 1;
    p.inv = 2.2;
    p.triple = 0;
    p.rapid = 0;
    Sfx.hurt();
    feedback({ haptic: 'hurt' });
    burst(p.x + 7, PLAYER_Y + 4, ['#ff2a6d', '#ffd319', '#fff'], 24, 90);
    if (g.lives <= 0) endGame(false);
  }

  function endGame(won) {
    mode = 'over';
    g.won = won;
    g.overT = 0;
    if (won) {
      addScore(g.lives * 1000);
      Sfx.win();
      feedback({ haptic: 'win' });
    } else {
      Sfx.lose();
      feedback({ haptic: 'lose' });
    }
    const result = { won, score: g.score, wave: g.wave };
    setTimeout(() => session?.onEnd?.(result), 2200);
  }

  // ── Mise à jour ──────────────────────────────────────────
  function update(dt) {
    time += dt;
    for (const s of stars) { s.x -= dt * (4 + s.s * 8); if (s.x < 0) s.x += W; }
    if (!g) return;

    for (const pt of g.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 60 * dt; pt.life -= dt; }
    g.particles = g.particles.filter((pt) => pt.life > 0);
    for (const pp of g.popups) { pp.y -= 14 * dt; pp.life -= dt; }
    g.popups = g.popups.filter((pp) => pp.life > 0);

    if (mode === 'intro') {
      g.introT -= dt;
      if (g.introT <= 0) nextWave();
      return;
    }
    if (mode === 'banner') {
      updatePlayer(dt, false);
      g.banner.t -= dt;
      if (g.banner.t <= 0) {
        const next = g.banner.next;
        g.banner = null;
        mode = 'play';
        next();
      }
      return;
    }
    if (mode === 'over') {
      g.overT += dt;
      return;
    }
    if (mode !== 'play') return;

    updatePlayer(dt, true);
    updateBullets(dt);
    if (g.boss) updateBoss(dt);
    else updateEnemies(dt);
    updatePowerups(dt);

    const hud = `${g.score}|${g.lives}|${g.wave}`;
    if (hud !== lastHud) {
      lastHud = hud;
      feedback({ hud: { score: g.score, lives: g.lives, wave: g.wave } });
    }
  }

  function updatePlayer(dt, canFire) {
    const p = g.player;
    const inp = readInput();
    p.x = Math.max(4, Math.min(W - 19, p.x + inp.x * 130 * dt));
    p.inv = Math.max(0, p.inv - dt);
    p.cool = Math.max(0, p.cool - dt);
    p.triple = Math.max(0, p.triple - dt);
    p.rapid = Math.max(0, p.rapid - dt);
    const maxBullets = p.rapid ? 6 : 3;
    if (canFire && inp.fire && p.cool <= 0 && g.bullets.length < maxBullets * (p.triple ? 3 : 1)) {
      const bx = p.x + 7;
      const spread = p.triple ? [-45, 0, 45] : [0];
      for (const vx of spread) g.bullets.push({ x: bx, y: PLAYER_Y - 2, vx, vy: -230 });
      p.cool = p.rapid ? 0.13 : 0.3;
      Sfx.shoot();
    }
  }

  function updateBullets(dt) {
    // Tirs du joueur
    for (const b of g.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      for (const t of g.teeth) if (toothHit(t, b.x, b.y, 1)) { b.dead = true; break; }
      if (b.dead) continue;
      for (const e of g.enemies) {
        if (e.dead || b.x < e.x || b.x > e.x + 11 || b.y < e.y || b.y > e.y + 8) continue;
        b.dead = true;
        e.hp -= 1;
        e.flash = 0.08;
        if (e.hp <= 0) {
          e.dead = true;
          const pts = ENEMY[e.type].points * g.wave;
          addScore(pts);
          popup(e.x + 5, e.y, `+${pts}`);
          Sfx.hit();
          feedback({ haptic: 'hit' });
          const col = { bact: ['#6bff5c', '#1f9e3a'], plaq: ['#ffd319', '#e08a00'], candy: ['#ff7bd5', '#c2188f'] }[e.type];
          burst(e.x + 5, e.y + 4, [...col, '#fff']);
          dropPowerup(e.x + 2, e.y + 4, 0.1);
        }
        break;
      }
      if (b.dead || !g.boss || g.boss.dead) continue;
      const bo = g.boss;
      if (b.x > bo.x + 4 && b.x < bo.x + 44 && b.y > bo.y + 2 && b.y < bo.y + 32) {
        b.dead = true;
        bo.hp -= 1;
        bo.flash = 0.06;
        addScore(50);
        feedback({ haptic: 'hit' });
        burst(b.x, b.y, ['#5a3a1e', '#ffd319'], 5, 40);
        dropPowerup(b.x, b.y, 0.035);
        if (bo.hp <= 0) {
          bo.dead = 2.2;
          addScore(5000);
          popup(bo.x + 24, bo.y + 10, '+5000', '#2de2e6');
          g.ebullets = [];
        }
      }
    }
    g.bullets = g.bullets.filter((b) => !b.dead && b.y > -4 && b.x > -4 && b.x < W + 4);

    // Tirs ennemis
    const p = g.player;
    for (const b of g.ebullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      for (const t of g.teeth) if (toothHit(t, b.x, b.y + 2, 2)) { b.dead = true; break; }
      if (b.dead) continue;
      if (b.x > p.x + 2 && b.x < p.x + 13 && b.y + 3 > PLAYER_Y + 1 && b.y < PLAYER_Y + 10) {
        b.dead = true;
        hurtPlayer();
      }
    }
    g.ebullets = g.ebullets.filter((b) => !b.dead && b.y < H && b.x > -6 && b.x < W + 6);
  }

  function updateEnemies(dt) {
    const alive = g.enemies.filter((e) => !e.dead);
    if (!alive.length) {
      g.enemies = [];
      nextWave();
      return;
    }
    const def = WAVES[g.wave - 1];
    const speed = def.speed * (1 + 2.2 * (1 - alive.length / g.total));
    let edge = false;
    for (const e of alive) {
      e.x += g.dir * speed * dt;
      e.flash = Math.max(0, e.flash - dt);
      if ((g.dir > 0 && e.x > W - 16) || (g.dir < 0 && e.x < 5)) edge = true;
    }
    if (edge) {
      g.dir *= -1;
      for (const e of alive) e.y += 6;
    }
    // Les envahisseurs rongent les dents qu'ils touchent
    for (const e of alive) for (const t of g.teeth) for (let x = 1; x < 11; x += 3) toothHit(t, e.x + x, e.y + 7, 2);

    if (alive.some((e) => e.y + 8 >= INVASION_Y)) {
      hurtPlayer();
      const minY = Math.min(...alive.map((e) => e.y));
      for (const e of alive) e.y -= minY - 26;
    }

    g.marchT -= dt * (speed / def.speed);
    if (g.marchT <= 0) {
      g.marchT = 0.5;
      g.marchI += 1;
      Sfx.march(g.marchI);
    }

    g.fireT -= dt;
    if (g.fireT <= 0) {
      g.fireT = def.fire * (0.5 + Math.random());
      const cols = new Map();
      for (const e of alive) {
        const key = Math.round(e.x);
        if (!cols.has(key) || cols.get(key).y < e.y) cols.set(key, e);
      }
      const shooters = [...cols.values()];
      const e = shooters[Math.floor(Math.random() * shooters.length)];
      g.ebullets.push({ x: e.x + 5, y: e.y + 8, vx: 0, vy: def.bulletSpeed, kind: 'acid' });
    }
  }

  function updateBoss(dt) {
    const bo = g.boss;
    bo.flash = Math.max(0, bo.flash - dt);
    if (bo.dead) {
      bo.dead -= dt;
      if (Math.random() < 0.5) burst(bo.x + Math.random() * 48, bo.y + Math.random() * 34, ['#5a3a1e', '#ffd319', '#ff2a6d', '#fff'], 6, 80);
      if (bo.dead <= 0) {
        g.boss = null;
        endGame(true);
      }
      return;
    }
    const rage = bo.hp < bo.max / 2;
    bo.t += dt * (rage ? 1.35 : 1);
    bo.x = W / 2 - 24 + Math.sin(bo.t * 0.8) * (W / 2 - 44);
    bo.y = 24 + Math.sin(bo.t * 1.9) * 6;

    bo.fireT -= dt;
    if (bo.fireT <= 0) {
      bo.fireT = rage ? 1.05 : 1.5;
      const n = rage ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.24;
        g.ebullets.push({ x: bo.x + 24, y: bo.y + 28, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, kind: 'goo' });
      }
    }
    bo.aimT -= dt;
    if (bo.aimT <= 0) {
      bo.aimT = rage ? 0.8 : 1.6;
      const dx = g.player.x + 7 - (bo.x + 24), dy = PLAYER_Y - (bo.y + 28);
      const len = Math.hypot(dx, dy);
      g.ebullets.push({ x: bo.x + 24, y: bo.y + 28, vx: (dx / len) * 95, vy: (dy / len) * 95, kind: 'acid' });
    }
  }

  function updatePowerups(dt) {
    const p = g.player;
    for (const u of g.powerups) {
      u.y += 42 * dt;
      if (u.y + 7 > PLAYER_Y && u.y < PLAYER_Y + 10 && u.x + 7 > p.x && u.x < p.x + 15) {
        u.dead = true;
        if (u.type === 'bracket') p.triple = 10;
        if (u.type === 'elastic') p.rapid = 10;
        if (u.type === 'fluor') p.shield = true;
        if (u.type === 'life') g.lives += 1;
        popup(p.x + 7, PLAYER_Y - 8, u.label, '#2de2e6');
        Sfx.power();
        feedback({ haptic: 'power' });
      }
    }
    g.powerups = g.powerups.filter((u) => !u.dead && u.y < H);
  }

  // ── Rendu ────────────────────────────────────────────────
  const bg = (() => {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const grad = c.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0b0322');
    grad.addColorStop(0.55, '#24094f');
    grad.addColorStop(0.62, '#12062e');
    grad.addColorStop(1, '#12062e');
    c.fillStyle = grad;
    c.fillRect(0, 0, W, H);
    // Soleil rétro
    const cx = W / 2, cy = 118, r = 46;
    const sun = c.createLinearGradient(0, cy - r, 0, cy + r);
    sun.addColorStop(0, '#ffd319');
    sun.addColorStop(0.5, '#ff901f');
    sun.addColorStop(1, '#ff2a6d');
    c.fillStyle = sun;
    c.globalAlpha = 0.35;
    c.beginPath();
    c.arc(cx, cy, r, Math.PI, 0);
    c.fill();
    c.globalAlpha = 1;
    c.fillStyle = '#24094f';
    for (let i = 0; i < 6; i++) c.fillRect(cx - r, cy - 22 + i * 4 + i * i * 0.6, r * 2, 1 + i * 0.5);
    return cv;
  })();

  function drawBackground() {
    ctx.drawImage(bg, 0, 0);
    for (const s of stars) {
      ctx.fillStyle = s.s > 0.7 ? '#ffffff' : '#7a5fc4';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }
    // Grille synthwave
    ctx.strokeStyle = 'rgba(247, 6, 207, 0.35)';
    ctx.lineWidth = 1;
    const horizon = 118;
    ctx.beginPath();
    for (let i = -12; i <= 12; i++) {
      ctx.moveTo(W / 2 + i * 8, horizon);
      ctx.lineTo(W / 2 + i * 60, H);
    }
    const off = (time * 0.6) % 1;
    for (let i = 0; i < 9; i++) {
      const y = horizon + Math.pow((i + off) / 9, 2) * (H - horizon);
      ctx.moveTo(0, Math.floor(y) + 0.5);
      ctx.lineTo(W, Math.floor(y) + 0.5);
    }
    ctx.stroke();
  }

  function text(str, x, y, { color = '#f5f3ff', size = 8, align = 'center', shadow = '#12062e' } = {}) {
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    if (shadow) {
      ctx.fillStyle = shadow;
      ctx.fillText(str, x + 1, y + 1);
    }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function wrap(str, maxChars) {
    const lines = [];
    let line = '';
    for (const word of str.split(' ')) {
      if ((line + ' ' + word).trim().length > maxChars) { lines.push(line.trim()); line = word; }
      else line += ' ' + word;
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function drawEntities() {
    for (const t of g.teeth) ctx.drawImage(t.cv, t.x, t.y);

    const frame = Math.floor(g.marchI) % 2;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const key = e.type + (frame ? '2' : '1') + (e.flash > 0 ? '_flash' : '');
      ctx.drawImage(S[key], Math.round(e.x), Math.round(e.y));
    }

    const bo = g.boss;
    if (bo) {
      const f = Math.floor(time * 4) % 2;
      const shake = bo.dead ? (Math.random() - 0.5) * 4 : 0;
      ctx.drawImage((bo.flash > 0 ? S.boss_flash : S.boss)[f], Math.round(bo.x + shake), Math.round(bo.y));
      // Barre de vie
      const bw = 160;
      ctx.fillStyle = '#12062e';
      ctx.fillRect(W / 2 - bw / 2 - 1, 13, bw + 2, 6);
      ctx.fillStyle = bo.hp < bo.max / 2 ? '#ff3b3b' : '#ff2a6d';
      ctx.fillRect(W / 2 - bw / 2, 14, Math.max(0, (bo.hp / bo.max) * bw), 4);
      text('MÉGA-CARIE', W / 2, 20, { size: 5, color: '#ffd319' });
    }

    for (const u of g.powerups) {
      const blink = Math.floor(time * 8) % 2;
      ctx.drawImage(S['pu_' + u.type + (blink ? '_flash' : '')], Math.round(u.x), Math.round(u.y));
    }

    for (const b of g.bullets) ctx.drawImage(S.shot, Math.round(b.x), Math.round(b.y));
    for (const b of g.ebullets) ctx.drawImage(b.kind === 'goo' ? S.goo : S.acid, Math.round(b.x - 1), Math.round(b.y));

    const p = g.player;
    const visible = mode === 'over' ? g.won : !(p.inv > 0 && Math.floor(time * 12) % 2);
    if (visible) {
      ctx.drawImage(S.player, Math.round(p.x), PLAYER_Y);
      if (p.shield) {
        ctx.strokeStyle = `rgba(45, 226, 230, ${0.5 + 0.3 * Math.sin(time * 8)})`;
        ctx.beginPath();
        ctx.arc(p.x + 7.5, PLAYER_Y + 5, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const pt of g.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 1, 1);
    }
    for (const pp of g.popups) {
      ctx.globalAlpha = Math.max(0, pp.life);
      text(pp.text, pp.x, pp.y, { size: 5, color: pp.color });
      ctx.globalAlpha = 1;
    }

    // Sol (gencive)
    ctx.fillStyle = '#ff2a6d';
    ctx.fillRect(0, 206, W, 1);
    ctx.fillStyle = '#b3124a';
    ctx.fillRect(0, 207, W, 9);
  }

  function drawHud() {
    text(`SCORE ${String(g.score).padStart(6, '0')}`, 6, 4, { size: 6, align: 'left', color: '#2de2e6' });
    text(session?.name ? session.name.toUpperCase().slice(0, 16) : 'MODE LIBRE', W / 2, 4, { size: 6, color: '#ffd319' });
    for (let i = 0; i < Math.min(g.lives, 6); i++) ctx.drawImage(S.pu_life, W - 12 - i * 9, 3);
    const p = g.player;
    let bx = 6;
    if (p.triple) { text(`TRIPLE ${Math.ceil(p.triple)}`, bx, 209, { size: 5, align: 'left', shadow: null }); bx += 70; }
    if (p.rapid) { text(`RAPIDE ${Math.ceil(p.rapid)}`, bx, 209, { size: 5, align: 'left', shadow: null }); bx += 70; }
    if (p.shield) text('FLUOR', bx, 209, { size: 5, align: 'left', shadow: null });
    text('CAPSULE', W - 6, 209, { size: 5, align: 'right', color: '#ffd319', shadow: null });
  }

  function drawOverlayText() {
    if (mode === 'intro') {
      const n = Math.ceil(g.introT);
      text('PRÊT, DOCTEUR ?', W / 2, 70, { size: 12, color: '#ffd319' });
      text(String(n), W / 2, 96, { size: 24, color: '#2de2e6' });
      text('Protégez les dents !', W / 2, 132, { size: 6 });
    }
    if (mode === 'banner' && g.banner) {
      const { title, tip } = g.banner;
      ctx.fillStyle = 'rgba(18, 6, 46, 0.82)';
      ctx.fillRect(0, 64, W, 70);
      ctx.fillStyle = '#ff2a6d';
      ctx.fillRect(0, 64, W, 2);
      ctx.fillRect(0, 132, W, 2);
      text(title, W / 2, 74, { size: 10, color: '#ffd319' });
      text('LE SAVIEZ-VOUS ?', W / 2, 96, { size: 5, color: '#2de2e6' });
      wrap(tip, 52).forEach((line, i) => text(line, W / 2, 106 + i * 9, { size: 5 }));
    }
    if (mode === 'over') {
      ctx.fillStyle = `rgba(18, 6, 46, ${Math.min(0.75, g.overT)})`;
      ctx.fillRect(0, 0, W, H);
      if (g.won) {
        text('VICTOIRE !', W / 2, 70, { size: 20, color: '#ffd319' });
        text('La Méga-Carie est vaincue', W / 2, 104, { size: 7 });
        text(`SCORE ${g.score}`, W / 2, 124, { size: 9, color: '#2de2e6' });
      } else {
        text('GAME OVER', W / 2, 76, { size: 20, color: '#ff2a6d' });
        text(`SCORE ${g.score}`, W / 2, 114, { size: 9, color: '#2de2e6' });
      }
    }
  }

  // Démo en arrière-plan de l'écran d'accueil
  const attractEnemies = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) attractEnemies.push({ type: ['candy', 'plaq', 'bact'][r], x: 60 + c * 26, y: 30 + r * 18 });

  function drawAttract() {
    const off = Math.sin(time * 0.7) * 30;
    const frame = Math.floor(time * 2) % 2;
    ctx.globalAlpha = 0.5;
    for (const e of attractEnemies) ctx.drawImage(S[e.type + (frame ? '2' : '1')], Math.round(e.x + off), e.y);
    ctx.drawImage(S.player, W / 2 - 7 + Math.round(Math.sin(time * 1.3) * 60), PLAYER_Y);
    for (let i = 0; i < 4; i++) ctx.drawImage(S.tooth, 38 + i * 92, TOOTH_Y);
    ctx.globalAlpha = 1;
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    update(dt);
    drawBackground();
    if (mode === 'attract' || !g) drawAttract();
    else {
      drawEntities();
      drawHud();
      drawOverlayText();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ── API pour la borne ────────────────────────────────────
  window.Game = {
    start(opts = {}) {
      session = opts;
      remote.x = 0;
      remote.fire = false;
      lastHud = '';
      newGame();
      g.introT = 3;
      mode = 'intro';
    },
    stop() {
      session = null;
      g = null;
      mode = 'attract';
    },
    setRemote(state) {
      remote.x = state.x;
      remote.fire = state.fire;
    },
    get mode() { return mode; },
  };

  // Test de recette (/screen?debug) : forcer la fin de partie.
  // Le serveur refuse toujours une victoire plus courte que MIN_WIN_SECONDS.
  if (new URLSearchParams(location.search).has('debug')) {
    window.Game.debug = {
      win: () => g && mode === 'play' && endGame(true),
      lose: () => g && mode === 'play' && endGame(false),
      boss: () => { if (g) { g.enemies = []; g.wave = WAVES.length; nextWave(); } },
    };
  }
})();
