// ORTHO INVADERS — moteur de jeu, format PORTRAIT (216×336, mis à l'échelle en pixels nets).
// 3 vagues (bactéries → plaque → sucres) puis le boss « MÉGA-CARIE ». Vaincre le boss = VICTOIRE.
(function () {
  const W = 216, H = 336;
  const HUD_H = 15;
  const HORIZON = 206;
  const TOOTH_Y = 258;
  const PLAYER_Y = 290;
  const INVASION_Y = 280;
  const GUM_Y = 318;

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  const S = Sprites.load();

  // Remplit son conteneur en gardant le ratio ; expose la taille d'un « pixel » pour l'effet cathodique.
  // Le conteneur de référence est le premier ancêtre [data-fit] (sinon le parent direct).
  const fitBox = canvas.closest('[data-fit]') || canvas.parentElement;
  function fit() {
    const cs = getComputedStyle(fitBox);
    const bw = fitBox.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const bh = fitBox.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (bw <= 0 || bh <= 0) return;
    const scale = Math.min(bw / W, bh / H);
    canvas.style.width = `${Math.floor(W * scale)}px`;
    canvas.style.height = `${Math.floor(H * scale)}px`;
    canvas.parentElement.style.setProperty('--px', `${scale}px`);
  }
  addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(fitBox);
  fit();

  // ── Police pixel 5×7 dessinée à la main ─────────────────
  const GLYPHS = {
    A: '.###.#...##...#######...##...##...#', B: '####.#...##...#####.#...##...#####.',
    C: '.###.#...##....#....#....#...#.###.', D: '####.#...##...##...##...##...#####.',
    E: '######....#....####.#....#....#####', F: '######....#....####.#....#....#....',
    G: '.###.#...##....#.####...##...#.####', H: '#...##...##...#######...##...##...#',
    I: '.###...#....#....#....#....#...###.', J: '..###...#....#....#....#.#..#..##..',
    K: '#...##..#.#.#..##...#.#..#..#.#...#', L: '#....#....#....#....#....#....#####',
    M: '#...###.###.#.##.#.##...##...##...#', N: '#...##...###..##.#.##..###...##...#',
    O: '.###.#...##...##...##...##...#.###.', P: '####.#...##...#####.#....#....#....',
    Q: '.###.#...##...##...##.#.##..#..##.#', R: '####.#...##...#####.#.#..#..#.#...#',
    S: '.#####....#.....###.....#....#####.', T: '#####..#....#....#....#....#....#..',
    U: '#...##...##...##...##...##...#.###.', V: '#...##...##...##...##...#.#.#...#..',
    W: '#...##...##...##.#.##.#.##.#.#.#.#.', X: '#...##...#.#.#...#...#.#.#...##...#',
    Y: '#...##...#.#.#...#....#....#....#..', Z: '#####....#...#...#...#...#....#####',
    0: '.###.#...##..###.#.###..##...#.###.', 1: '..#...##....#....#....#....#...###.',
    2: '.###.#...#....#...#...#...#...#####', 3: '####.....#....#.###.....#....#####.',
    4: '...#...##..#.#.#..#.#####...#....#.', 5: '######....####.....#....##...#.###.',
    6: '.###.#....#....####.#...##...#.###.', 7: '#####....#...#...#...#....#....#...',
    8: '.###.#...##...#.###.#...##...#.###.', 9: '.###.#...##...#.####....#....#.###.',
    ' ': '...................................', '.': '................................#..',
    ',': '.........................#...#.....', ':': '.......#..............#............',
    '!': '..#....#....#....#....#.........#..', '?': '.###.#...#....#...#...#.........#..',
    "'": '..#....#...#.......................', '-': '...............###.................',
    '+': '.......#....#..#####..#....#.......', '/': '....#....#...#...#...#...#....#....',
    '%': '##..###..#...#...#...#...#..###..##', '(': '...#...#...#....#....#.....#.....#.',
    ')': '.#.....#.....#....#....#...#...#...', '<': '...#...#...#...#.....#.....#.....#.',
    '>': '.#.....#.....#.....#...#...#...#...', '=': '..........#####.....#####..........',
    '*': '..#....#..#####.###..#.#.#...#.....', '♥': '......#.#.###########.###...#......',
    '·': '...............#...................', '"': '.#.#..#.#..........................',
    '▶': '#....##...###..####.###..##...#....', '◀': '....#...##..###.####..###...##....#',
  };
  const ACCENTS = {
    'É': ['E', 'acute'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'], 'Ë': ['E', 'trema'],
    'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Î': ['I', 'circ'], 'Ï': ['I', 'trema'],
    'Ô': ['O', 'circ'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ç': ['C', 'cedil'],
  };
  const ACCENT_PX = {
    acute: [[3, -2], [2, -1]], grave: [[1, -2], [2, -1]], circ: [[2, -2], [1, -1], [3, -1]],
    trema: [[1, -1], [3, -1]], cedil: [[2, 7], [1, 8]],
  };
  const textCache = new Map();

  function renderText(str, { scale = 1, color = '#f5f3ff', colors = null, shadow = '#12062e' }) {
    const chars = [...str.toUpperCase().replace(/Œ/g, 'OE').replace(/’/g, "'").replace(/[«»]/g, '"').replace(/…/g, '...')];
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, chars.length * 6 * scale + scale);
    cv.height = 11 * scale;
    const c = cv.getContext('2d');
    const draw = (ox, oy, fill) => {
      chars.forEach((ch, i) => {
        const [base, acc] = ACCENTS[ch] || [ch, null];
        const g = GLYPHS[base] || GLYPHS['?'];
        const x0 = ox + i * 6 * scale, y0 = oy + 2 * scale;
        for (let p = 0; p < 35; p++) {
          if (g[p] !== '#') continue;
          const gy = Math.floor(p / 5);
          c.fillStyle = fill || (colors ? colors[gy] : color);
          c.fillRect(x0 + (p % 5) * scale, y0 + gy * scale, scale, scale);
        }
        if (acc) for (const [ax, ay] of ACCENT_PX[acc]) {
          c.fillStyle = fill || (colors ? colors[0] : color);
          c.fillRect(x0 + ax * scale, y0 + ay * scale, scale, scale);
        }
      });
    };
    if (shadow) draw(scale, scale, shadow);
    draw(0, 0, null);
    return cv;
  }

  function text(str, x, y, opts = {}) {
    const key = `${str}|${opts.scale || 1}|${opts.color || ''}|${opts.colors || ''}|${opts.shadow === undefined ? 'd' : opts.shadow}`;
    let cv = textCache.get(key);
    if (!cv) {
      cv = renderText(String(str), opts);
      if (textCache.size > 400) textCache.clear();
      textCache.set(key, cv);
    }
    const align = opts.align || 'center';
    const dx = align === 'center' ? Math.round(cv.width / 2) : align === 'right' ? cv.width : 0;
    ctx.drawImage(cv, Math.round(x - dx), Math.round(y - 2 * (opts.scale || 1)));
    return cv.width;
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

  const CHROME = ['#ffffff', '#ffffff', '#d6fbff', '#2de2e6', '#2de2e6', '#3a86ff', '#3a86ff']; // logo « arcade »
  const GOLD = ['#fff6c2', '#ffe45c', '#ffd319', '#ffd319', '#ffb319', '#ff901f', '#ff6a1f'];
  const HOT = ['#ffd1e1', '#ff8ab0', '#ff2a6d', '#ff2a6d', '#e0185a', '#b3124a', '#8f0f3a'];

  // ── Contenu des vagues ───────────────────────────────────
  const WAVES = [
    {
      title: 'VAGUE 1', name: 'LES BACTÉRIES',
      tip: 'Le biofilm dentaire se reconstitue en quelques heures après le brossage.',
      rows: ['plaq', 'bact', 'bact'], speed: 10, fire: 1.4, bulletSpeed: 70, dive: 0,
    },
    {
      title: 'VAGUE 2', name: 'LA PLAQUE ATTAQUE',
      tip: 'Brackets et fils multiplient les zones de rétention : l’hygiène est la clé du traitement.',
      rows: ['candy', 'plaq', 'bact', 'bact'], speed: 12, fire: 1.05, bulletSpeed: 80, dive: 4.5,
    },
    {
      title: 'VAGUE 3', name: 'INVASION SUCRÉE',
      tip: 'Chaque prise sucrée relance l’acidité en bouche : attention aux grignotages sous appareil.',
      rows: ['candy', 'candy', 'plaq', 'plaq', 'bact'], speed: 14, fire: 0.85, bulletSpeed: 90, dive: 3,
    },
  ];
  const ENEMY = {
    bact: { points: 10, hp: 1, name: 'BACTÉRIE', colors: ['#7dff5c', '#1f9e3a'] },
    plaq: { points: 20, hp: 1, name: 'PLAQUE', colors: ['#ffd319', '#d97a00'] },
    candy: { points: 30, hp: 2, name: 'SUCRE', colors: ['#ff8ad8', '#c2188f'] },
  };
  const POWERUPS = [
    { type: 'bracket', label: 'TIR TRIPLE', weight: 35, glow: 'cyan' },
    { type: 'elastic', label: 'TIR RAPIDE', weight: 35, glow: 'magenta' },
    { type: 'fluor', label: 'BOUCLIER FLUOR', weight: 20, glow: 'cyan' },
    { type: 'life', label: '+1 VIE', weight: 10, glow: 'magenta' },
  ];
  const COLS = 8, GAP_X = 22, GAP_Y = 17, FORM_TOP = 36;

  // ── Entrées : manette téléphone, clavier, manette Bluetooth (Gamepad API) ──
  const remote = { x: 0, fire: false };
  const keys = {};
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Ne bloque le défilement de la page que pendant une partie (jeu intégré au site)
    const playing = g && mode !== 'attract' && mode !== 'over' && !paused;
    if (playing && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
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
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const mx = lx + x, my = ly + y;
        if (x * x + y * y > radius * radius + 1 || mx < 0 || my < 0 || mx >= t.w || my >= t.h) continue;
        // Bords rongés irréguliers
        if (Math.abs(x) + Math.abs(y) === radius * 2 && Math.random() < 0.5) continue;
        t.mask[my * t.w + mx] = 0;
        t.c.clearRect(mx, my, 1, 1);
      }
    }
    return true;
  }

  // ── État ─────────────────────────────────────────────────
  let g = null;           // partie en cours
  let mode = 'attract';   // attract | intro | play | banner | over
  let session = null;     // { gameId, name, hiScore, onEnd, onFeedback }
  let paused = false;
  let time = 0;
  let lastHud = '';
  let hiScore = 0;
  try { hiScore = Number(localStorage.getItem('orthoInvadersHi')) || 0; } catch {}

  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * W, y: Math.random() * HORIZON, layer: Math.floor(Math.random() * 3), tw: Math.random() * 6,
  }));

  function newGame() {
    g = {
      score: 0, lives: 3, wave: 0,
      player: { x: W / 2 - 7, inv: 0, cool: 0, triple: 0, rapid: 0, shield: false, vx: 0 },
      bullets: [], ebullets: [], enemies: [], powerups: [], particles: [], rings: [], popups: [],
      teeth: [0, 1, 2, 3].map((i) => makeTooth(26 + i * 47)),
      boss: null, fx: 0, fy: FORM_TOP, dir: 1, fireT: 2, diveT: 5, marchT: 0, marchI: 0,
      banner: null, total: 0, entryT: 0, combo: 0, comboT: 0,
      shake: 0, flash: 0, flashColor: '#ffffff', hitstop: 0,
    };
  }

  function spawnWave(i) {
    const def = WAVES[i];
    g.enemies = [];
    def.rows.forEach((type, r) => {
      for (let c = 0; c < COLS; c++) {
        g.enemies.push({
          type, sx: c * GAP_X, sy: r * GAP_Y, row: r, col: c,
          hp: ENEMY[type].hp, flash: 0, x: 0, y: -20, dive: null, back: 0,
        });
      }
    });
    g.fx = Math.round((W - ((COLS - 1) * GAP_X + 13)) / 2);
    g.fy = FORM_TOP;
    g.total = g.enemies.length;
    g.dir = 1;
    g.fireT = 2.2;
    g.diveT = def.dive || 99;
    g.entryT = 0;
  }

  function showBanner(kind, next, duration = 3.6) {
    mode = 'banner';
    g.banner = { kind, t: duration, total: duration, next };
  }

  function nextWave() {
    g.wave += 1;
    g.bullets = [];
    g.ebullets = [];
    if (g.wave <= WAVES.length) {
      Sfx.wave();
      showBanner('wave', () => spawnWave(g.wave - 1));
    } else {
      Sfx.boss();
      showBanner('boss', () => {
        g.enemies = [];
        g.boss = {
          x: W / 2 - 28, y: -50, hp: 90, max: 90, t: 0, flash: 0, fireT: 2.5, aimT: 3.5,
          laserT: 6, laser: null, minionT: 5, dead: 0, entering: true,
        };
        g.shake = 4;
      }, 3.2);
    }
  }

  const feedback = (data) => session?.onFeedback?.(data);

  function burst(x, y, colors, n = 14, speed = 70) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.3 + Math.random());
      g.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0.35 + Math.random() * 0.45, color: colors[i % colors.length], size: Math.random() < 0.25 ? 2 : 1 });
    }
  }

  function ring(x, y, color, max = 14, speed = 60) {
    g.rings.push({ x, y, r: 1, max, color, speed });
  }

  function popup(x, y, str, color = '#ffd319') {
    g.popups.push({ x, y, str, color, life: 1 });
  }

  function dropPowerup(x, y, chance) {
    if (Math.random() > chance) return;
    const pool = POWERUPS.filter((p) => p.type !== 'life' || g.lives < 5);
    let r = Math.random() * pool.reduce((s, p) => s + p.weight, 0);
    const pick = pool.find((p) => (r -= p.weight) < 0) || pool[0];
    g.powerups.push({ ...pick, x, y, t: 0 });
  }

  function killEnemy(e) {
    e.dead = true;
    if (g.comboT > 0) g.combo += 1; else g.combo = 1;
    g.comboT = 1.3;
    const mult = Math.min(4, 1 + Math.floor(g.combo / 4));
    const pts = ENEMY[e.type].points * g.wave * mult * (e.dive ? 2 : 1);
    g.score += pts;
    popup(e.x + 6, e.y, `+${pts}`, mult > 1 ? '#2de2e6' : '#ffd319');
    if (g.combo > 3 && g.combo % 4 === 0) popup(W / 2, 150, `COMBO X${mult}`, '#ff2a6d');
    Sfx.hit();
    feedback({ haptic: 'hit' });
    burst(e.x + 6, e.y + 5, [...ENEMY[e.type].colors, '#ffffff'], 16);
    ring(e.x + 6, e.y + 5, ENEMY[e.type].colors[0], 10);
    g.shake = Math.max(g.shake, 1.2);
    dropPowerup(e.x + 3, e.y + 4, e.dive ? 0.25 : 0.09);
  }

  function hurtPlayer() {
    const p = g.player;
    if (p.inv > 0 || mode !== 'play') return;
    if (p.shield) {
      p.shield = false;
      p.inv = 1;
      Sfx.hit();
      ring(p.x + 7, PLAYER_Y + 6, '#2de2e6', 18, 90);
      return;
    }
    g.lives -= 1;
    p.inv = 2.2;
    p.triple = 0;
    p.rapid = 0;
    Sfx.hurt();
    feedback({ haptic: 'hurt' });
    burst(p.x + 7, PLAYER_Y + 6, ['#ff2a6d', '#ffd319', '#ffffff', '#2de2e6'], 30, 100);
    ring(p.x + 7, PLAYER_Y + 6, '#ff2a6d', 22, 100);
    g.shake = 5;
    g.flash = 0.35;
    g.flashColor = '#ff2a6d';
    if (g.lives <= 0) endGame(false);
  }

  function endGame(won) {
    mode = 'over';
    g.won = won;
    g.overT = 0;
    if (won) {
      g.score += g.lives * 1000;
      Sfx.win();
      feedback({ haptic: 'win' });
    } else {
      Sfx.lose();
      feedback({ haptic: 'lose' });
    }
    g.record = g.score > hiScore;
    if (g.record) {
      hiScore = g.score;
      try { localStorage.setItem('orthoInvadersHi', String(hiScore)); } catch {}
    }
    const result = { won, score: g.score, wave: g.wave };
    setTimeout(() => session?.onEnd?.(result), 2600);
  }

  // ── Mise à jour ──────────────────────────────────────────
  function update(dt) {
    time += dt;
    for (const s of stars) {
      s.y += dt * (3 + s.layer * 5);
      if (s.y > HORIZON) { s.y -= HORIZON; s.x = Math.random() * W; }
    }
    if (!g) return;

    g.shake = Math.max(0, g.shake - dt * 12);
    g.flash = Math.max(0, g.flash - dt);
    for (const pt of g.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 90 * dt; pt.vx *= 0.98; pt.life -= dt; }
    g.particles = g.particles.filter((pt) => pt.life > 0);
    for (const r of g.rings) r.r += r.speed * dt;
    g.rings = g.rings.filter((r) => r.r < r.max);
    for (const pp of g.popups) { pp.y -= 16 * dt; pp.life -= dt * 0.9; }
    g.popups = g.popups.filter((pp) => pp.life > 0);

    if (g.hitstop > 0) { g.hitstop -= dt; return; }

    if (mode === 'intro') {
      g.introT -= dt;
      updatePlayer(dt, false);
      if (g.introT <= 0) nextWave();
      return;
    }
    if (mode === 'banner') {
      updatePlayer(dt, false);
      updateBullets(dt);
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
      if (g.won && Math.random() < 0.15) {
        const cols = ['#ffd319', '#2de2e6', '#ff2a6d', '#7dff5c'];
        burst(20 + Math.random() * (W - 40), 30 + Math.random() * 140, cols, 18, 80);
      }
      return;
    }
    if (mode !== 'play') return;

    g.comboT = Math.max(0, g.comboT - dt);
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
    p.vx = inp.x * 115;
    p.x = Math.max(3, Math.min(W - 18, p.x + p.vx * dt));
    p.inv = Math.max(0, p.inv - dt);
    p.cool = Math.max(0, p.cool - dt);
    p.triple = Math.max(0, p.triple - dt);
    p.rapid = Math.max(0, p.rapid - dt);
    const maxBullets = (p.rapid ? 6 : 3) * (p.triple ? 3 : 1);
    if (canFire && inp.fire && p.cool <= 0 && g.bullets.length < maxBullets) {
      const bx = p.x + 6;
      for (const vx of p.triple ? [-40, 0, 40] : [0]) g.bullets.push({ x: bx, y: PLAYER_Y - 3, vx, vy: -260 });
      p.cool = p.rapid ? 0.12 : 0.28;
      p.muzzle = 0.05;
      Sfx.shoot();
    }
    p.muzzle = Math.max(0, (p.muzzle || 0) - dt);
  }

  function enemyAt(b) {
    for (const e of g.enemies) {
      if (e.dead || e.y < 0) continue;
      if (b.x + 1 >= e.x && b.x <= e.x + 13 && b.y + 4 >= e.y && b.y <= e.y + 10) return e;
    }
    return null;
  }

  function updateBullets(dt) {
    const p = g.player;
    for (const b of g.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      for (const t of g.teeth) if (toothHit(t, b.x + 1, b.y, 1)) { b.dead = true; break; }
      if (b.dead) continue;
      const e = enemyAt(b);
      if (e) {
        b.dead = true;
        e.hp -= 1;
        e.flash = 0.08;
        if (e.hp <= 0) killEnemy(e);
        else { Sfx.hit(); burst(b.x, b.y, ['#ffffff', '#ff8ad8'], 4, 30); }
        continue;
      }
      const bo = g.boss;
      if (!bo || bo.dead || bo.entering) continue;
      if (b.x > bo.x + 6 && b.x < bo.x + 50 && b.y > bo.y + 6 && b.y < bo.y + 40) {
        b.dead = true;
        bo.hp -= 1;
        bo.flash = 0.06;
        g.score += 50;
        feedback({ haptic: 'hit' });
        burst(b.x, b.y, ['#6b4424', '#ffd319', '#ffffff'], 6, 50);
        dropPowerup(b.x, b.y, 0.03);
        if (bo.hp <= 0) {
          bo.dead = 2.6;
          bo.laser = null;
          g.score += 5000;
          popup(bo.x + 28, bo.y + 14, '+5000', '#2de2e6');
          g.ebullets = [];
          g.hitstop = 0.25;
          g.flash = 0.5;
          g.flashColor = '#ffffff';
        }
      }
    }
    g.bullets = g.bullets.filter((b) => !b.dead && b.y > -6 && b.x > -6 && b.x < W + 6);

    for (const b of g.ebullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      for (const t of g.teeth) if (toothHit(t, b.x, b.y + 3, 2)) { b.dead = true; burst(b.x, b.y + 3, ['#ffffff', '#cfc6f2'], 4, 25); break; }
      if (b.dead) continue;
      if (b.x > p.x + 2 && b.x < p.x + 13 && b.y + 4 > PLAYER_Y + 2 && b.y < PLAYER_Y + 12) {
        b.dead = true;
        hurtPlayer();
      }
    }
    g.ebullets = g.ebullets.filter((b) => !b.dead && b.y < GUM_Y + 4 && b.x > -8 && b.x < W + 8);
  }

  const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

  function startDive(e, free = false) {
    e.dive = { t: 0, x0: e.x, y0: e.y, side: e.x + 6 < W / 2 ? 1 : -1, shot: false, free };
  }

  function updateEnemies(dt) {
    const alive = g.enemies.filter((e) => !e.dead);
    if (!alive.length) {
      g.enemies = [];
      nextWave();
      return;
    }
    const def = WAVES[g.wave - 1];
    g.entryT += dt;
    const entering = g.entryT < 1.8;
    const inForm = alive.filter((e) => !e.dive && !e.free);
    const speed = def.speed * (1 + 2.2 * (1 - alive.length / g.total));

    if (!entering && inForm.length) {
      g.fx += g.dir * speed * dt;
      const minX = Math.min(...inForm.map((e) => e.sx)) + g.fx;
      const maxX = Math.max(...inForm.map((e) => e.sx)) + g.fx + 13;
      if ((g.dir > 0 && maxX > W - 3) || (g.dir < 0 && minX < 3)) {
        g.dir *= -1;
        g.fy += 4;
      }
    }

    const p = g.player;
    for (const e of alive) {
      e.flash = Math.max(0, e.flash - dt);
      const tx = g.fx + e.sx;
      const ty = g.fy + e.sy + Math.sin(time * 3 + e.col * 0.7) * 1.2;
      if (e.dive) {
        const d = e.dive;
        d.t += dt;
        const k = d.t / 2.6;
        e.x = d.x0 + Math.sin(d.t * 2.4) * 34 * d.side + (p.x - d.x0) * ease(k) * 0.7;
        e.y = d.y0 + Math.pow(k, 1.5) * (H + 30 - d.y0);
        if (!d.shot && d.t > 0.7 && e.y < PLAYER_Y - 40) {
          d.shot = true;
          const dx = p.x + 7 - (e.x + 6), dy = PLAYER_Y - (e.y + 10), len = Math.hypot(dx, dy) || 1;
          g.ebullets.push({ x: e.x + 6, y: e.y + 10, vx: (dx / len) * 85, vy: (dy / len) * 85, kind: 'acid' });
        }
        for (const t of g.teeth) for (let x = 2; x < 12; x += 4) toothHit(t, e.x + x, e.y + 9, 2);
        if (e.x + 11 > p.x + 2 && e.x + 2 < p.x + 13 && e.y + 9 > PLAYER_Y + 2 && e.y < PLAYER_Y + 12) {
          hurtPlayer();
          killEnemy(e);
          continue;
        }
        if (e.y > H + 10) {
          if (d.free) { e.dead = true; continue; }
          e.dive = null;
          e.back = 1;
        }
      } else if (e.back > 0) {
        e.back = Math.max(0, e.back - dt * 1.2);
        e.x = tx;
        e.y = ty - ease(e.back) * 140;
      } else {
        const delay = e.row * 0.12 + e.col * 0.04;
        const k = ease((g.entryT - delay) / 0.8);
        e.x = tx + (1 - k) * (e.col - COLS / 2) * 10;
        e.y = ty - (1 - k) * 180;
      }
    }
    if (entering) return;

    for (const e of inForm) for (const t of g.teeth) for (let x = 1; x < 13; x += 3) toothHit(t, e.x + x, e.y + 9, 2);

    if (inForm.some((e) => e.y + 10 >= INVASION_Y)) {
      hurtPlayer();
      g.fy = FORM_TOP;
    }

    g.marchT -= dt * (speed / def.speed);
    if (g.marchT <= 0) {
      g.marchT = 0.5;
      g.marchI += 1;
      Sfx.march(g.marchI);
    }

    g.fireT -= dt;
    if (g.fireT <= 0 && inForm.length) {
      g.fireT = def.fire * (0.5 + Math.random());
      const cols = new Map();
      for (const e of inForm) if (!cols.has(e.col) || cols.get(e.col).row < e.row) cols.set(e.col, e);
      const shooters = [...cols.values()];
      const e = shooters[Math.floor(Math.random() * shooters.length)];
      g.ebullets.push({ x: e.x + 6, y: e.y + 10, vx: 0, vy: def.bulletSpeed, kind: e.type === 'candy' ? 'goo' : 'acid' });
    }

    // Piqués façon Galaga : un ennemi quitte la formation et fonce sur le joueur
    g.diveT -= dt;
    if (g.diveT <= 0 && inForm.length > 2) {
      g.diveT = def.dive * (0.7 + Math.random() * 0.6);
      const low = inForm.filter((e) => e.row >= 1);
      const e = (low.length ? low : inForm)[Math.floor(Math.random() * (low.length || inForm.length))];
      startDive(e);
      Sfx.march(0);
    }
  }

  function updateBoss(dt) {
    const bo = g.boss;
    bo.flash = Math.max(0, bo.flash - dt);
    if (bo.entering) {
      bo.y += (40 - bo.y) * dt * 1.8;
      g.shake = Math.max(g.shake, 1);
      if (bo.y > 38) bo.entering = false;
      return;
    }
    if (bo.dead) {
      bo.dead -= dt;
      g.shake = 3;
      if (Math.random() < 0.55) {
        const x = bo.x + Math.random() * 56, y = bo.y + 6 + Math.random() * 34;
        burst(x, y, ['#6b4424', '#ffd319', '#ff2a6d', '#ffffff'], 8, 90);
        if (Math.random() < 0.3) { ring(x, y, '#ffd319', 16, 80); Sfx.hit(); }
      }
      if (bo.dead <= 0) {
        g.boss = null;
        burst(W / 2, 60, ['#ffd319', '#ffffff', '#2de2e6', '#ff2a6d'], 80, 160);
        ring(W / 2, 60, '#ffffff', 90, 160);
        endGame(true);
      }
      return;
    }
    const rage = bo.hp < bo.max / 2;
    if (rage && !bo.raged) {
      bo.raged = true;
      popup(W / 2, 110, 'ELLE S’ÉNERVE !', '#ff3b3b');
      g.shake = 4;
    }

    // Petits piqueurs libérés par le boss
    for (const e of g.enemies) {
      if (e.dead || !e.dive) continue;
      const d = e.dive;
      d.t += dt;
      const k = d.t / 2.4;
      e.x = d.x0 + Math.sin(d.t * 2.6) * 30 * d.side + (g.player.x - d.x0) * ease(k) * 0.6;
      e.y = d.y0 + Math.pow(k, 1.4) * (H + 30 - d.y0);
      const p = g.player;
      if (e.x + 11 > p.x + 2 && e.x + 2 < p.x + 13 && e.y + 9 > PLAYER_Y + 2 && e.y < PLAYER_Y + 12) { hurtPlayer(); killEnemy(e); }
      if (e.y > H + 10) e.dead = true;
    }
    g.enemies = g.enemies.filter((e) => !e.dead);

    // Laser : préavis clignotant puis rayon vertical
    if (bo.laser) {
      const L = bo.laser;
      L.t -= dt;
      if (L.phase === 'warn' && L.t <= 0) {
        L.phase = 'fire';
        L.t = 0.9;
        g.shake = 3;
        Sfx.hurt();
      } else if (L.phase === 'fire') {
        const p = g.player;
        for (const t of g.teeth) for (let y = 0; y < 16; y += 3) for (let dx = -3; dx <= 3; dx += 3) toothHit(t, L.x + dx, TOOTH_Y + y, 2);
        if (Math.abs(p.x + 7 - L.x) < 8) hurtPlayer();
        if (L.t <= 0) bo.laser = null;
      }
      return;
    }

    bo.t += dt * (rage ? 1.4 : 1);
    bo.x = W / 2 - 28 + Math.sin(bo.t * 0.9) * (W / 2 - 34);
    bo.y = 40 + Math.sin(bo.t * 1.9) * 6;

    bo.fireT -= dt;
    if (bo.fireT <= 0) {
      bo.fireT = rage ? 1.15 : 1.6;
      const n = rage ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.22;
        g.ebullets.push({ x: bo.x + 28, y: bo.y + 32, vx: Math.cos(a) * 72, vy: Math.sin(a) * 72, kind: 'orb' });
      }
    }
    bo.aimT -= dt;
    if (bo.aimT <= 0) {
      bo.aimT = rage ? 0.9 : 1.7;
      const dx = g.player.x + 7 - (bo.x + 28), dy = PLAYER_Y - (bo.y + 32), len = Math.hypot(dx, dy) || 1;
      g.ebullets.push({ x: bo.x + 28, y: bo.y + 32, vx: (dx / len) * 100, vy: (dy / len) * 100, kind: 'acid' });
    }
    if (rage) {
      bo.laserT -= dt;
      if (bo.laserT <= 0) {
        bo.laserT = 5.5;
        bo.laser = { phase: 'warn', t: 1, x: Math.round(g.player.x + 7) };
      }
      bo.minionT -= dt;
      if (bo.minionT <= 0) {
        bo.minionT = 6.5;
        for (const side of [-1, 1]) {
          const e = { type: 'bact', sx: 0, sy: 0, row: 0, col: 0, hp: 1, flash: 0, x: bo.x + 28 + side * 14, y: bo.y + 30, back: 0, free: true };
          g.enemies.push(e);
          startDive(e, true);
        }
      }
    }
  }

  function updatePowerups(dt) {
    const p = g.player;
    for (const u of g.powerups) {
      u.t += dt;
      u.y += 40 * dt;
      u.x += Math.sin(u.t * 4) * 12 * dt;
      if (u.y + 7 > PLAYER_Y && u.y < PLAYER_Y + 12 && u.x + 7 > p.x && u.x < p.x + 15) {
        u.dead = true;
        if (u.type === 'bracket') p.triple = 10;
        if (u.type === 'elastic') p.rapid = 10;
        if (u.type === 'fluor') p.shield = true;
        if (u.type === 'life') g.lives += 1;
        popup(p.x + 7, PLAYER_Y - 12, u.label, '#2de2e6');
        ring(p.x + 7, PLAYER_Y + 6, '#2de2e6', 16, 70);
        Sfx.power();
        feedback({ haptic: 'power' });
      }
    }
    g.powerups = g.powerups.filter((u) => !u.dead && u.y < GUM_Y);
  }

  // ── Décor pré-rendu : un cabinet dentaire en pixel art, ambiance néon ──
  const LAMP = { x: 152, y: 58 };        // scialytique (lampe opératoire)
  const MONITOR = { x: 170, y: 92, w: 36, h: 22 };
  const bg = (() => {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

    // Mur carrelé
    const wall = c.createLinearGradient(0, 0, 0, HORIZON);
    wall.addColorStop(0, '#120630');
    wall.addColorStop(1, '#241050');
    c.fillStyle = wall;
    c.fillRect(0, 0, W, HORIZON);
    for (let y = 22; y < HORIZON; y += 12) r(0, y, W, 1, 'rgba(90, 60, 170, 0.22)');
    for (let row = 0, y = 22; y < HORIZON; y += 12, row++) {
      for (let x = (row % 2) * 6; x < W; x += 12) r(x, y, 1, 12, 'rgba(90, 60, 170, 0.16)');
    }
    // Plinthe / cimaise
    r(0, 158, W, 3, '#3a1f6e');
    r(0, 158, W, 1, '#6b4bb8');
    // Tube néon au plafond
    r(18, 16, W - 36, 2, '#7ff9ff');
    r(18, 18, W - 36, 1, '#1f8f98');

    // Enseigne néon « CAPSULE »
    const sign = renderText('CAPSULE', { color: '#ff5fa2', shadow: '#5a0b3a' });
    c.drawImage(sign, Math.round(W / 2 - sign.width / 2), 23);

    // Négatoscope avec panoramique dentaire (mur gauche)
    r(6, 94, 54, 38, '#12062e');
    r(7, 95, 52, 36, '#6c6c80');
    r(9, 97, 48, 32, '#0d2a3a');
    for (let i = 0; i < 14; i++) {           // arcade du haut
      const x = 12 + i * 3, y = 104 + Math.round(Math.pow((i - 6.5) / 6.5, 2) * 5);
      r(x, y, 2, 5, '#bfeaff');
      r(x, y + 5, 2, 2, '#5aa9c9');
    }
    for (let i = 0; i < 14; i++) {           // arcade du bas
      const x = 12 + i * 3, y = 122 - Math.round(Math.pow((i - 6.5) / 6.5, 2) * 5);
      r(x, y - 5, 2, 5, '#bfeaff');
      r(x, y - 7, 2, 2, '#5aa9c9');
    }
    r(9, 97, 48, 1, 'rgba(255,255,255,0.35)');
    // Diplôme
    r(10, 60, 26, 20, '#d9a441');
    r(12, 62, 22, 16, '#f5ecd2');
    for (let i = 0; i < 4; i++) r(15, 65 + i * 3, 16 - (i % 2) * 5, 1, '#8a7a5a');
    r(28, 73, 4, 4, '#c2185b');

    // Moniteur (tracé animé plus tard)
    const M = MONITOR;
    r(M.x - 1, M.y - 1, M.w + 2, M.h + 2, '#12062e');
    r(M.x, M.y, M.w, M.h, '#3b3b52');
    r(M.x + 2, M.y + 2, M.w - 4, M.h - 4, '#04160c');
    r(M.x + M.w / 2 - 2, M.y + M.h, 4, 4, '#3b3b52');

    // Meuble à tiroirs + plan de travail (droite)
    r(160, 132, 52, 74, '#2f2360');
    r(160, 132, 52, 3, '#8f82c8');
    for (let i = 0; i < 4; i++) {
      r(163, 139 + i * 16, 46, 14, '#3b2d78');
      r(163, 139 + i * 16, 46, 1, '#5a4aa0');
      r(182, 145 + i * 16, 8, 2, '#2de2e6');
    }
    // Flacons sur le plan de travail
    r(166, 124, 5, 8, '#7ff9ff'); r(167, 122, 3, 2, '#e0e0f0');
    r(174, 126, 5, 6, '#ffd319'); r(175, 124, 3, 2, '#e0e0f0');
    r(198, 120, 8, 12, '#e8e8f5'); r(199, 118, 6, 2, '#c2185b');

    // Scialytique : bras depuis le plafond + tête de lampe
    r(LAMP.x + 10, 18, 2, 26, '#8f82c8');
    r(LAMP.x - 2, 42, 16, 2, '#8f82c8');
    r(LAMP.x - 2, 42, 2, 12, '#8f82c8');
    r(LAMP.x - 14, 54, 30, 8, '#12062e');
    r(LAMP.x - 13, 55, 28, 6, '#b8b8d0');
    r(LAMP.x - 10, 61, 22, 2, '#fff6c2');

    // Fauteuil dentaire (centre) : dossier incliné, assise, repose-jambes, socle
    const K = '#12062e', SEAT = '#b3124a', SEAT_HI = '#ff5fa2', SEAT_DK = '#6d0a2c';
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.beginPath(); c.ellipse(104, 206, 44, 5, 0, 0, Math.PI * 2); c.fill();            // ombre au sol
    r(94, 186, 24, 20, K); r(96, 186, 20, 20, '#6c6c80'); r(96, 186, 3, 20, '#9a9ab4'); // pied
    r(84, 202, 44, 4, K); r(85, 203, 42, 3, '#4a4a60');                                 // socle
    const chair = (x, top, h) => { r(x, top - 1, 1, h + 2, K); r(x, top, 1, h, SEAT); r(x, top, 1, 1, SEAT_HI); r(x, top + h - 2, 1, 2, SEAT_DK); };
    for (let x = 64; x <= 122; x++) chair(x, 176, 12);                                 // assise
    for (let x = 123; x <= 156; x++) chair(x, 176 + Math.round((x - 123) * 0.42), 10);  // repose-jambes
    for (let y = 136; y <= 178; y++) {                                                  // dossier
      const x0 = Math.round(44 + (y - 136) * 0.5);
      r(x0 - 1, y, 20, 1, K); r(x0, y, 18, 1, SEAT); r(x0, y, 2, 1, SEAT_HI); r(x0 + 15, y, 3, 1, SEAT_DK);
    }
    r(38, 126, 20, 11, K); r(39, 127, 18, 9, SEAT); r(39, 127, 18, 2, SEAT_HI);          // têtière
    r(110, 166, 3, 11, '#4a4a60'); r(98, 164, 26, 3, K); r(99, 165, 24, 2, '#8f82c8');   // accoudoir
    // Crachoir
    r(28, 164, 14, 4, K); r(29, 164, 12, 3, '#7ff9ff'); r(33, 168, 4, 22, '#4a4a60');
    // Plateau d'instruments sur bras articulé
    r(118, 150, 2, 18, '#8f82c8'); r(104, 146, 34, 5, K); r(105, 147, 32, 3, '#c8c8d8');
    r(108, 144, 1, 3, '#ffffff'); r(107, 143, 3, 2, '#bfeaff');                     // miroir
    r(114, 143, 1, 4, '#ffffff'); r(115, 143, 2, 1, '#ffffff');                     // sonde
    r(121, 143, 1, 4, '#ffffff'); r(123, 143, 1, 4, '#ffffff'); r(122, 145, 1, 1, '#ffffff'); // précelles
    r(128, 144, 6, 2, '#2de2e6');                                                    // porte-instruments

    // Plante (gauche)
    r(8, 188, 16, 18, K); r(9, 189, 14, 17, '#c46a2a'); r(9, 189, 14, 2, '#e08a3a');
    for (const [x, y, w] of [[12, 176, 3], [7, 180, 5], [17, 178, 5], [10, 172, 2], [19, 172, 2], [14, 170, 2]]) r(x, y, w, 10, '#1f9e3a');
    for (const [x, y] of [[12, 176], [8, 180], [18, 178], [14, 170]]) r(x, y, 2, 2, '#7dff5c');

    // Sol : carrelage en damier, en perspective
    const img = c.getImageData(0, HORIZON, W, GUM_Y - HORIZON);
    const hFloor = GUM_Y - HORIZON;
    for (let y = 0; y < hFloor; y++) {
      const k = y / hFloor;
      const row = Math.floor(Math.pow(k, 0.55) * 9);
      const scale = 7 + k * 26;
      for (let x = 0; x < W; x++) {
        const col = Math.floor((x - W / 2) / scale + 100);
        const dark = (row + col) % 2 === 0;
        const i = (y * W + x) * 4;
        const shade = 0.55 + k * 0.45;
        const [cr, cg, cb] = dark ? [34, 16, 74] : [58, 36, 110];
        img.data[i] = cr * shade; img.data[i + 1] = cg * shade; img.data[i + 2] = cb * shade; img.data[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, HORIZON);
    r(0, HORIZON, W, 1, '#ff2a6d');

    // Voile sombre : le décor reste lisible sans gêner le jeu
    r(0, 0, W, GUM_Y, 'rgba(8, 2, 28, 0.38)');

    // Gencive + arcade du bas avec bagues et fil orthodontique
    const gum = c.createLinearGradient(0, GUM_Y, 0, H);
    gum.addColorStop(0, '#ff5fa2');
    gum.addColorStop(0.35, '#e0307a');
    gum.addColorStop(1, '#7a0f3f');
    c.fillStyle = gum;
    c.fillRect(0, GUM_Y, W, H - GUM_Y);
    c.fillStyle = '#12062e';
    c.fillRect(0, GUM_Y, W, 1);
    for (let i = 0; i < 12; i++) {
      const x = 6 + i * 17 + (i % 2);
      c.drawImage(S.incisor, x, GUM_Y - 5);
      c.fillStyle = '#ffb3d1';
      c.fillRect(x + 1, GUM_Y + 3, 5, 1);
    }
    c.fillStyle = '#2de2e6';
    c.fillRect(0, GUM_Y - 1, W, 1); // fil
    return cv;
  })();

  function drawBackground() {
    ctx.drawImage(bg, 0, 0);
    // Tracé cardiaque sur le moniteur
    const M = MONITOR;
    const pw = M.w - 4, ph = M.h - 4;
    for (let i = 0; i < pw; i++) {
      const t = (i + Math.floor(time * 24)) % 40;
      const y = t === 18 ? -6 : t === 19 ? 5 : t === 20 ? -2 : 0;
      const fade = i / pw;
      ctx.fillStyle = `rgba(125, 255, 92, ${0.25 + fade * 0.6})`;
      ctx.fillRect(M.x + 2 + i, M.y + 2 + ph / 2 + y, 1, 1);
    }
    // Poussière qui flotte dans la lumière du scialytique
    for (const s of stars) {
      if (s.layer !== 2) continue;
      const x = LAMP.x - 30 + ((s.x * 0.3 + time * 2) % 60);
      const y = 70 + (s.y % 90);
      ctx.fillStyle = 'rgba(255, 246, 194, 0.35)';
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
    ctx.globalCompositeOperation = 'lighter';
    // Faisceau du scialytique
    ctx.globalAlpha = 0.16 + 0.03 * Math.sin(time * 2);
    ctx.drawImage(S.glow.yellow, LAMP.x - 50, LAMP.y - 4, 96, 150);
    // Tube néon (vacille de temps en temps) et enseigne CAPSULE
    const flicker = Math.sin(time * 37) > 0.97 ? 0.1 : 0.35;
    ctx.globalAlpha = flicker;
    ctx.drawImage(S.glow.cyan, 10, 8, W - 20, 20);
    ctx.globalAlpha = 0.22 + 0.08 * Math.sin(time * 3);
    ctx.drawImage(S.glow.magenta, W / 2 - 34, 16, 68, 22);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function glowAt(name, x, y, alpha = 1, size = null) {
    const gl = S.glow[name];
    const s = size || gl.width;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.drawImage(gl, Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawRing(r) {
    const steps = Math.max(8, Math.round(r.r * 5));
    ctx.fillStyle = r.color;
    ctx.globalAlpha = 1 - r.r / r.max;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      ctx.fillRect(Math.round(r.x + Math.cos(a) * r.r), Math.round(r.y + Math.sin(a) * r.r), 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const p = g.player;
    const visible = mode === 'over' ? g.won : !(p.inv > 0 && Math.floor(time * 14) % 2);
    if (!visible) return;
    const x = Math.round(p.x);
    // Réacteur
    const fl = Math.floor(time * 20) % 3;
    ctx.fillStyle = '#ffd319';
    ctx.fillRect(x + 6, PLAYER_Y + 13, 3, 1 + fl);
    ctx.fillStyle = '#ff901f';
    ctx.fillRect(x + 7, PLAYER_Y + 14 + fl, 1, 2);
    glowAt('yellow', x + 7.5, PLAYER_Y + 15, 0.35, 10);
    ctx.drawImage(S.player, x, PLAYER_Y);
    if (p.muzzle > 0) glowAt('white', x + 7.5, PLAYER_Y - 1, 0.8, 10);
    if (p.shield) {
      const r = 11;
      ctx.fillStyle = '#2de2e6';
      const n = 28;
      for (let i = 0; i < n; i++) {
        if ((i + Math.floor(time * 12)) % 3 === 0) continue;
        const a = (i / n) * Math.PI * 2;
        ctx.fillRect(Math.round(x + 7.5 + Math.cos(a) * r), Math.round(PLAYER_Y + 6.5 + Math.sin(a) * r), 1, 1);
      }
      glowAt('cyan', x + 7.5, PLAYER_Y + 6.5, 0.35, 26);
    }
  }

  function drawEntities() {
    for (const t of g.teeth) ctx.drawImage(t.cv, t.x, t.y);

    const frame = Math.floor(g.marchI + time * 0.0001) % 2;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const f = e.dive ? Math.floor(time * 8) % 2 : frame;
      const key = e.type + (f ? '2' : '1') + (e.flash > 0 ? '_flash' : '');
      ctx.drawImage(S[key], Math.round(e.x), Math.round(e.y));
      if (e.dive) glowAt(e.type === 'bact' ? 'green' : e.type === 'plaq' ? 'yellow' : 'magenta', e.x + 6, e.y + 5, 0.35, 20);
    }

    const bo = g.boss;
    if (bo) {
      const f = Math.floor(time * 4) % 2;
      const shake = bo.dead ? (Math.random() - 0.5) * 5 : 0;
      const rage = bo.hp < bo.max / 2;
      const spr = bo.flash > 0 ? S.boss_flash[f] : (rage ? S.bossRage : S.boss)[f];
      glowAt(rage ? 'magenta' : 'yellow', bo.x + 28, bo.y + 24, 0.3 + 0.1 * Math.sin(time * 5), 80);
      ctx.drawImage(spr, Math.round(bo.x + shake), Math.round(bo.y));
      if (bo.laser) {
        const L = bo.laser;
        const mouthY = Math.round(bo.y + 32);
        if (L.phase === 'warn') {
          if (Math.floor(time * 16) % 2) {
            ctx.fillStyle = '#ff3b3b';
            for (let y = mouthY; y < GUM_Y; y += 4) ctx.fillRect(L.x, y, 1, 2);
          }
          glowAt('magenta', bo.x + 28, mouthY, 0.8, 18 + Math.sin(time * 30) * 4);
        } else {
          const wv = 6 + Math.round(Math.sin(time * 40) * 1.5);
          ctx.fillStyle = '#ff2a6d';
          ctx.fillRect(L.x - wv, mouthY, wv * 2, GUM_Y - mouthY);
          ctx.fillStyle = '#ffd1e1';
          ctx.fillRect(L.x - wv + 3, mouthY, (wv - 3) * 2, GUM_Y - mouthY);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(L.x - 1, mouthY, 2, GUM_Y - mouthY);
          for (let y = mouthY; y < GUM_Y; y += 24) glowAt('magenta', L.x, y, 0.6, 30);
        }
      }
      // Barre de vie du boss
      if (!bo.entering) {
        const bw = 150, bx = Math.round(W / 2 - bw / 2), by = HUD_H + 4;
        ctx.fillStyle = '#12062e';
        ctx.fillRect(bx - 2, by - 2, bw + 4, 8);
        ctx.fillStyle = '#3d0a5c';
        ctx.fillRect(bx, by, bw, 4);
        ctx.fillStyle = rage ? '#ff3b3b' : '#ff2a6d';
        ctx.fillRect(bx, by, Math.max(0, Math.round((bo.hp / bo.max) * bw)), 4);
        ctx.fillStyle = '#ffd1e1';
        ctx.fillRect(bx, by, Math.max(0, Math.round((bo.hp / bo.max) * bw)), 1);
        text('MÉGA-CARIE', W / 2, by + 7, { color: '#ffd319' });
      }
    }

    for (const u of g.powerups) {
      glowAt(u.glow, u.x + 3.5, u.y + 3.5, 0.5 + 0.3 * Math.sin(u.t * 8), 18);
      ctx.drawImage(S['pu_' + u.type + (Math.floor(u.t * 6) % 2 ? '_flash' : '')], Math.round(u.x), Math.round(u.y));
    }

    for (const b of g.bullets) {
      glowAt('cyan', b.x + 1.5, b.y + 2, 0.55, 10);
      ctx.drawImage(S.shot, Math.round(b.x), Math.round(b.y));
    }
    for (const b of g.ebullets) {
      const spr = S[b.kind] || S.acid;
      glowAt(b.kind === 'acid' ? 'green' : 'magenta', b.x, b.y + 2, 0.5, 10);
      ctx.drawImage(spr, Math.round(b.x - spr.width / 2), Math.round(b.y));
    }

    drawPlayer();

    for (const r of g.rings) drawRing(r);
    for (const pt of g.particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.min(1, pt.life * 3);
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
    for (const pp of g.popups) {
      if (pp.life < 0.3 && Math.floor(time * 20) % 2) continue;
      text(pp.str, pp.x, pp.y, { color: pp.color });
    }
  }

  function drawHud() {
    ctx.fillStyle = 'rgba(6, 1, 26, 0.75)';
    ctx.fillRect(0, 0, W, HUD_H);
    ctx.fillStyle = '#ff2a6d';
    ctx.fillRect(0, HUD_H, W, 1);
    text('SCORE', 4, 4, { align: 'left', color: '#ff8ab0', shadow: null });
    text(String(g.score).padStart(6, '0'), 36, 4, { align: 'left', color: '#2de2e6' });
    const hi = Math.max(hiScore, session?.hiScore || 0, g.score);
    text(`HI ${String(hi).padStart(6, '0')}`, 146, 4, { align: 'center', color: '#ffd319' });
    for (let i = 0; i < Math.min(g.lives, 5); i++) ctx.drawImage(S.heart, W - 8 - i * 7, 5);

    // Bonus actifs (au-dessus de la gencive)
    const p = g.player;
    const tags = [];
    if (p.triple) tags.push(['bracket', p.triple / 10]);
    if (p.rapid) tags.push(['elastic', p.rapid / 10]);
    if (p.shield) tags.push(['fluor', 1]);
    tags.forEach(([type, k], i) => {
      const x = 4 + i * 26;
      ctx.drawImage(S['pu_' + type], x, H - 11);
      ctx.fillStyle = '#12062e';
      ctx.fillRect(x + 9, H - 8, 14, 3);
      ctx.fillStyle = '#2de2e6';
      ctx.fillRect(x + 9, H - 8, Math.round(14 * k), 3);
    });
    text(session?.name ? session.name.toUpperCase().slice(0, 14) : 'MODE LIBRE', W - 4, H - 10, { align: 'right', color: '#ffffff' });
  }

  function panel(y, h) {
    ctx.fillStyle = 'rgba(8, 2, 28, 0.86)';
    ctx.fillRect(8, y, W - 16, h);
    ctx.fillStyle = '#ff2a6d';
    ctx.fillRect(8, y, W - 16, 1);
    ctx.fillRect(8, y + h - 1, W - 16, 1);
    ctx.fillStyle = '#2de2e6';
    ctx.fillRect(8, y + 2, W - 16, 1);
    ctx.fillRect(8, y + h - 3, W - 16, 1);
  }

  function drawOverlayText() {
    if (mode === 'intro') {
      const n = Math.ceil(g.introT);
      text('PRÊT, DOCTEUR ?', W / 2, 96, { scale: 2, colors: GOLD });
      const k = g.introT % 1;
      text(String(n), W / 2, 124 + (1 - k) * 4, { scale: 5, colors: CHROME });
      text('DÉFENDEZ', W / 2, 184, { colors: HOT });
      text("L'ARCADE DENTAIRE !", W / 2, 196, { colors: HOT });
    }
    if (mode === 'banner' && g.banner) {
      const b = g.banner;
      const slide = Math.min(1, (b.total - b.t) * 4) * Math.min(1, b.t * 4);
      const y0 = Math.round(70 - (1 - slide) * 30);
      if (b.kind === 'boss') {
        panel(y0, 116);
        if (Math.floor(time * 6) % 2) text('! ALERTE !', W / 2, y0 + 12, { scale: 2, colors: HOT });
        text('MÉGA-CARIE', W / 2, y0 + 36, { scale: 2, colors: GOLD });
        ctx.drawImage(S.boss[Math.floor(time * 4) % 2], W / 2 - 28, y0 + 54);
        text('VISEZ LA BOUCHE, ESQUIVEZ', W / 2, y0 + 100, { color: '#2de2e6' });
        text('LE RAYON ROUGE !', W / 2, y0 + 108, { color: '#2de2e6' });
        return;
      }
      const def = WAVES[g.wave - 1];
      panel(y0, 150);
      text(def.title, W / 2, y0 + 10, { scale: 2, colors: CHROME });
      text(def.name, W / 2, y0 + 32, { colors: GOLD });
      // Tableau des points, façon borne des années 80
      const types = [...new Set(def.rows)];
      types.forEach((type, i) => {
        const y = y0 + 48 + i * 16;
        const f = Math.floor(time * 2) % 2 ? '2' : '1';
        ctx.drawImage(S[type + f], 46, y - 2);
        text(`${ENEMY[type].name}`, 66, y + 1, { align: 'left', color: '#ffffff' });
        text(`${ENEMY[type].points * g.wave} PTS`, 172, y + 1, { align: 'right', color: '#ffd319' });
      });
      const ty = y0 + 52 + types.length * 16;
      text('LE SAVIEZ-VOUS ?', W / 2, ty, { color: '#2de2e6' });
      wrap(def.tip, 32).forEach((line, i) => text(line, W / 2, ty + 12 + i * 10, { color: '#cfc6f2', shadow: null }));
    }
    if (mode === 'over') {
      ctx.fillStyle = `rgba(6, 1, 26, ${Math.min(0.7, g.overT)})`;
      ctx.fillRect(0, 0, W, H);
      const bob = Math.round(Math.sin(time * 4) * 2);
      if (g.won) {
        text('VICTOIRE', W / 2, 100 + bob, { scale: 3, colors: GOLD });
        text('LA MÉGA-CARIE EST VAINCUE', W / 2, 136, { color: '#ffffff' });
      } else {
        text('GAME', W / 2, 90 + bob, { scale: 4, colors: HOT });
        text('OVER', W / 2, 124 + bob, { scale: 4, colors: HOT });
      }
      text('SCORE', W / 2, 166, { color: '#ff8ab0' });
      text(String(g.score), W / 2, 178, { scale: 2, colors: CHROME });
      if (g.record && Math.floor(time * 4) % 2) text('NOUVEAU RECORD !', W / 2, 204, { color: '#ffd319' });
    }
  }

  // Démo en arrière-plan de l'écran d'accueil
  const attractEnemies = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) attractEnemies.push({ type: ['candy', 'plaq', 'bact', 'bact'][r], x: 30 + c * 22, y: 40 + r * 18 });
  const attractTeeth = [0, 1, 2, 3].map((i) => 26 + i * 47);

  function drawAttract() {
    const off = Math.sin(time * 0.8) * 14;
    const f = Math.floor(time * 2) % 2 ? '2' : '1';
    for (const e of attractEnemies) ctx.drawImage(S[e.type + f], Math.round(e.x + off), e.y + Math.round(Math.sin(time * 3 + e.x) * 1));
    for (const x of attractTeeth) ctx.drawImage(S.tooth, x, TOOTH_Y);
    const px = Math.round(W / 2 - 7 + Math.sin(time * 1.3) * 70);
    ctx.drawImage(S.player, px, PLAYER_Y);
    if (Math.floor(time * 3) % 3 === 0) ctx.drawImage(S.shot, px + 6, PLAYER_Y - 30 - ((time * 200) % 100));
  }

  // ── Boucle ───────────────────────────────────────────────
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    if (!paused) update(dt);
    ctx.save();
    if (g && g.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * g.shake * 2), Math.round((Math.random() - 0.5) * g.shake * 2));
    drawBackground();
    if (mode === 'attract' || !g) drawAttract();
    else drawEntities();
    ctx.restore();
    if (g && mode !== 'attract') {
      drawHud();
      drawOverlayText();
      if (g.flash > 0) {
        ctx.globalAlpha = Math.min(0.6, g.flash);
        ctx.fillStyle = g.flashColor;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (paused) {
        ctx.fillStyle = 'rgba(6, 1, 26, 0.72)';
        ctx.fillRect(0, 0, W, H);
        text('PAUSE', W / 2, 150, { scale: 3, colors: GOLD });
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ── API pour la borne ────────────────────────────────────
  window.Game = {
    W, H,
    start(opts = {}) {
      session = opts;
      paused = false;
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
    get paused() { return paused; },
    set paused(v) { paused = Boolean(v) && Boolean(g) && mode !== 'attract'; },
    get hiScore() { return hiScore; },
    fit,
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
