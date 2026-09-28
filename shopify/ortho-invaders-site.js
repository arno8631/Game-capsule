/* Ortho Invaders — Capsule · build 2026-09-28 */
// Pixel art de ORTHO INVADERS — chaque caractère = 1 pixel, '.' = transparent.
(function () {
  const PALETTE = {
    k: '#12062e', // contour
    w: '#ffffff',
    W: '#cfc6f2', // ombre du blanc
    c: '#2de2e6', C: '#128c9e', // cyan
    m: '#ff2a6d', M: '#a8124a', // magenta
    y: '#ffd319', Y: '#d97a00', // jaune
    o: '#ff901f',
    g: '#7dff5c', G: '#1f9e3a', // vert bactérie
    p: '#ff8ad8', P: '#c2188f', // rose bonbon
    b: '#3a86ff', B: '#1d3fa8',
    r: '#ff3b3b', R: '#8f0f1f',
    s: '#c8c8d8', S: '#6c6c80', // métal (bracket)
    n: '#6b4424', N: '#3a220f', // carie
    v: '#9d4edd', V: '#5a2391',
    u: '#ff5fa2', U: '#c2185b', // gencive
  };

  const DEFS = {
    // Vaisseau : une capsule magenta / cyan, canon sur le dessus
    player: [
      '.......k.......',
      '......kwk......',
      '......kck......',
      '....kkmmmkk....',
      '...kmwmmmmmk...',
      '...kmwmmmmMk...',
      '.k.kmmmmmmMk.k.',
      'kckkkkkkkkkkkck',
      'kcckcwccccCkcck',
      'kcckcwccccCkcck',
      'kCCkkccccCkkCCk',
      '.kk..kCCCk..kk.',
      '......kkk......',
    ],
    // Bactérie (10 pts)
    bact1: [
      '....k...k....',
      '..k.kgggk.k..',
      '...kgggggk...',
      '.kkgGgggGgkk.',
      'kgggwkgwkgggk',
      'kgGggggggGggk',
      '.kggkrrrkggk.',
      '..kgggggggk..',
      '.k.kgk.kgk.k.',
      'k...k...k...k',
    ],
    bact2: [
      '...k.....k...',
      '..k.kgggk.k..',
      '...kgggggk...',
      '.kkgGgggGgkk.',
      'kggwkggwkgggk',
      'kgGggggggGggk',
      '.kggkrrrkggk.',
      '..kgggggggk..',
      '..kkgk.kgkk..',
      '.k..k...k..k.',
    ],
    // Plaque / tartre (20 pts)
    plaq1: [
      '....kkkkk....',
      '..kkyyyyykk..',
      '.kyywyyyyyyk.',
      'kyywyyyyyyyYk',
      'kyyrkyyyrkyYk',
      'kyyyyyyyyyyYk',
      'kYyykkkkkyyYk',
      '.kYyykwkyyYk.',
      '..kYYYYYYYk..',
      '.kk.kk.kk.kk.',
    ],
    plaq2: [
      '....kkkkk....',
      '..kkyyyyykk..',
      '.kyywyyyyyyk.',
      'kyywyyyyyyyYk',
      'kyykryyykryYk',
      'kyyyyyyyyyyYk',
      'kYyykkkkkyyYk',
      '.kYyykwkyyYk.',
      '..kYYYYYYYk..',
      '..k.kk.kk.k..',
    ],
    // Bonbon sucré (30 pts, 2 impacts)
    candy1: [
      '.............',
      'kk..kkkkk..kk',
      'kpkkpwpppkkpk',
      'kppkpppPPkppk',
      'kppkpkpkPkppk',
      'kpkkppppPkkpk',
      'kk.kpkkkPk.kk',
      '...kPPPPPk...',
      '....kkkkk....',
      '.............',
    ],
    candy2: [
      'kk.........kk',
      'kpk.kkkkk.kpk',
      'kppkpwpppkppk',
      '.kkkpppPPkkk.',
      '...kpkpkPk...',
      '.kkkppppPkkk.',
      'kppkpkkkPkppk',
      'kpk.kPPPk.kpk',
      'kk...kkk...kk',
      '.............',
    ],
    // Molaire avec bracket (bouclier destructible)
    tooth: [
      '....kkkk......kkkk....',
      '..kkwwwwkk..kkwwwwkk..',
      '.kwwwwwwwwkkwwwwwwwwk.',
      'kwwwwwwwwwwwwwwwwwwwWk',
      'kwwwwwwwwwwwwwwwwwwwWk',
      'kwwwwwwwwwwwwwwwwwwWWk',
      'kcccsssssssssssscccccc',
      'kCCCsSkkSSSSkkSsCCCCCk',
      'kwwwsssssssssssswwwWWk',
      '.kwwwwwwwwwwwwwwwwWWk.',
      '.kwwwwwwwwwwwwwwwwWWk.',
      '..kwwwwwwkkwwwwwwWWk..',
      '..kwwwwwk..kwwwwwWk...',
      '...kwwwwk..kwwwwWk....',
      '...kwwwk....kwwwWk....',
      '....kkk......kkkk.....',
    ],
    // Incisive décorative de l'arcade du bas (avec bague)
    incisor: [
      '.kkkkk.',
      'kwwwwWk',
      'kwwwwWk',
      'kwsssWk',
      'kwsSsWk',
      'kwwwwWk',
      'kwwwwWk',
      '.kWWWk.',
    ],
    // Bonus
    pu_bracket: [
      'kkkkkkk',
      'ksssssk',
      'kskkksk',
      'kkkkkkk',
      'kskkksk',
      'ksssssk',
      'kkkkkkk',
    ],
    pu_elastic: [
      '.kkkkk.',
      'kpppppk',
      'kpk.kpk',
      'kpk.kpk',
      'kpk.kpk',
      'kpppppk',
      '.kkkkk.',
    ],
    pu_fluor: [
      '...k...',
      '..kck..',
      '.kcwck.',
      'kccwcck',
      'kcccCck',
      '.kcCck.',
      '..kkk..',
    ],
    pu_life: [
      '.kk.kk.',
      'kmmkmmk',
      'kmwmmmk',
      'kmmmmmk',
      '.kmmmk.',
      '..kmk..',
      '...k...',
    ],
    heart: [
      '.k.k.',
      'kmkmk',
      'kmmmk',
      '.kmk.',
      '..k..',
    ],
    shot: ['.w.', 'cwc', 'cwc', '.c.', '.C.'],
    acid: ['.g.', 'ggg', 'gwg', 'gGg', '.G.'],
    goo: ['.mm.', 'mwpm', 'mppm', '.MM.'],
    orb: ['.kkk.', 'kmmmk', 'kmwmk', 'kmmmk', '.kkk.'],
  };

  function render(rows) {
    const w = Math.max(...rows.map((r) => r.length));
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = rows.length;
    const ctx = cv.getContext('2d');
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.' || !PALETTE[ch]) return;
        ctx.fillStyle = PALETTE[ch];
        ctx.fillRect(x, y, 1, 1);
      });
    });
    return cv;
  }

  // Silhouette colorée (flash blanc quand touché, teinte rouge en rage…)
  function tint(cv, color) {
    const f = document.createElement('canvas');
    f.width = cv.width;
    f.height = cv.height;
    const ctx = f.getContext('2d');
    ctx.drawImage(cv, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, f.width, f.height);
    return f;
  }

  // Halo lumineux (dessiné en mode « lighter »)
  function glow(color, r) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = r * 2;
    const ctx = cv.getContext('2d');
    const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, r * 2, r * 2);
    return cv;
  }

  // Boss « MÉGA-CARIE » : généré procéduralement (56×42)
  function renderBoss(frame, rage) {
    const W = 56, H = 42;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const px = (x, y, c) => { ctx.fillStyle = PALETTE[c] || c; ctx.fillRect(x, y, 1, 1); };
    for (let y = 6; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = (x - W / 2) / (W / 2), dy = (y - 24) / 18;
        const wob = 0.07 * Math.sin(x * 0.8 + frame * 2.1) + 0.05 * Math.cos(y * 1.2 + frame);
        const d = dx * dx + dy * dy;
        if (d >= 0.95 + wob) continue;
        if (d > 0.8 + wob) px(x, y, 'k');
        else if ((x * 7 + y * 3) % 13 === 0) px(x, y, 'N'); // cavités
        else if (dy < -0.62 && dx > -0.55 && dx < -0.2) px(x, y, rage ? 'r' : 'o'); // reflet
        else if (d > 0.62) px(x, y, rage ? 'R' : 'N'); // ombre
        else px(x, y, 'n');
      }
    }
    // Couronne
    for (let i = 0; i < 5; i++) {
      const cx = 14 + i * 7; // couronne posée sur la tête
      for (let h = 0; h < 6; h++) for (let w = -3; w <= 3; w++) {
        if (h < 5 - Math.abs(w) * 1.5) px(cx + w, 3 + h + (i % 2) + (i === 0 || i === 4 ? 2 : 0), h === 0 || Math.abs(w) === 3 ? 'k' : (w === -1 && h < 3 ? 'w' : 'y'));
      }
    }
    // Yeux
    for (const ex of [16, 33]) {
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const edge = x === 0 || y === 0 || x === 7 || y === 7;
        px(ex + x, 14 + y, edge ? 'k' : (rage ? 'y' : 'r'));
      }
      const pupil = 2 + (frame % 2);
      px(ex + pupil, 16, 'k'); px(ex + pupil + 1, 16, 'k'); px(ex + pupil, 17, 'k'); px(ex + pupil + 1, 17, 'k');
      px(ex + 5, 15, 'w');
    }
    // Sourcils furieux
    for (let i = 0; i < 7; i++) { px(15 + i, 12 + (i >> 1), 'k'); px(40 - i, 12 + (i >> 1), 'k'); }
    // Bouche + crocs
    for (let x = 15; x < 42; x++) { px(x, 28, 'k'); px(x, 29, 'R'); px(x, 30, 'R'); px(x, 31, 'R'); px(x, 32, 'k'); }
    for (let x = 17; x < 41; x += 4) { px(x, 29, 'w'); px(x + 1, 29, 'w'); px(x, 30, 'W'); px(x + 2, 31, 'w'); }
    return cv;
  }

  window.Sprites = {
    PALETTE,
    tint,
    load() {
      const s = {};
      for (const [k, rows] of Object.entries(DEFS)) {
        s[k] = render(rows);
        s[k + '_flash'] = tint(s[k], '#ffffff');
      }
      s.boss = [renderBoss(0, false), renderBoss(1, false)];
      s.bossRage = [renderBoss(0, true), renderBoss(1, true)];
      s.boss_flash = s.boss.map((c) => tint(c, '#ffffff'));
      s.glow = {
        cyan: glow('rgba(45,226,230,0.9)', 6),
        magenta: glow('rgba(255,42,109,0.9)', 7),
        green: glow('rgba(125,255,92,0.8)', 6),
        yellow: glow('rgba(255,211,25,0.9)', 9),
        white: glow('rgba(255,255,255,0.9)', 12),
      };
      return s;
    },
  };
})();

// Effets sonores 8-bit générés en WebAudio (aucun fichier à charger).
(function () {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq = 440, to = null, dur = 0.1, type = 'square', vol = 0.08, delay = 0 }) {
    if (muted) return;
    const a = ac();
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur = 0.2, vol = 0.12) {
    if (muted) return;
    const a = ac();
    const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = a.createBufferSource();
    const g = a.createGain();
    g.gain.value = vol;
    src.buffer = buf;
    src.connect(g).connect(a.destination);
    src.start();
  }

  const melody = (notes, step = 0.1, type = 'square') =>
    notes.forEach((f, i) => f && tone({ freq: f, dur: step * 0.9, type, delay: i * step, vol: 0.07 }));

  window.Sfx = {
    unlock: () => ac(),
    toggle: () => (muted = !muted),
    shoot: () => tone({ freq: 880, to: 220, dur: 0.08, vol: 0.04 }),
    hit: () => { noise(0.12, 0.08); tone({ freq: 300, to: 60, dur: 0.12, type: 'triangle' }); },
    hurt: () => { noise(0.4, 0.15); tone({ freq: 200, to: 40, dur: 0.4, type: 'sawtooth', vol: 0.1 }); },
    power: () => melody([523, 659, 784, 1047], 0.06),
    march: (i) => tone({ freq: [98, 92, 87, 82][i % 4], dur: 0.07, type: 'triangle', vol: 0.12 }),
    wave: () => melody([392, 523, 659, 784, 0, 659, 784], 0.09),
    boss: () => melody([110, 0, 104, 0, 98, 0, 92, 87, 82], 0.12, 'sawtooth'),
    win: () => melody([523, 523, 523, 659, 0, 587, 659, 784, 0, 1047, 1047], 0.11),
    lose: () => melody([392, 370, 349, 330, 0, 262], 0.16, 'triangle'),
    coin: () => melody([988, 1319], 0.08),
  };
})();

window.__orthoInvadersGame = function () {
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

  // ── Décor pré-rendu ──────────────────────────────────────
  const bg = (() => {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const sky = c.createLinearGradient(0, 0, 0, HORIZON);
    sky.addColorStop(0, '#06011a');
    sky.addColorStop(0.55, '#1a0544');
    sky.addColorStop(0.85, '#3d0a5c');
    sky.addColorStop(1, '#7a1060');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, HORIZON);
    // Soleil rétro rayé
    const cx = W / 2, cy = HORIZON - 4, r = 44;
    for (let y = -r; y < 0; y++) {
      const band = (y + r) / r; // 0 en haut, 1 à l'horizon
      const gap = band > 0.45 && ((-y) % 7 < Math.floor(band * 4));
      if (gap) continue;
      const half = Math.floor(Math.sqrt(r * r - y * y));
      const col = band < 0.35 ? '#ffd319' : band < 0.6 ? '#ff901f' : band < 0.8 ? '#ff5a4f' : '#ff2a6d';
      c.fillStyle = col;
      c.fillRect(cx - half, cy + y, half * 2, 1);
    }
    // Montagnes pixel
    let h1 = 10, h2 = 6;
    for (let x = 0; x < W; x++) {
      h1 += (Math.sin(x * 0.13) + Math.sin(x * 0.051) * 1.6 + (Math.random() - 0.5)) * 0.9;
      h1 = Math.max(4, Math.min(26, h1));
      h2 = 6 + Math.abs(Math.sin(x * 0.09)) * 12 + Math.sin(x * 0.31) * 2;
      const far = Math.round(h1);
      c.fillStyle = '#2a0b55';
      c.fillRect(x, HORIZON - far, 1, far);
      c.fillStyle = '#9d4edd';
      c.fillRect(x, HORIZON - far, 1, 1);
      if (x < 70 || x > W - 70) {
        const near = Math.round(h2 * (x < 70 ? (70 - x) / 70 : (x - (W - 70)) / 70) * 1.6);
        c.fillStyle = '#16063a';
        c.fillRect(x, HORIZON - near, 1, near);
        c.fillStyle = '#2de2e6';
        if (near > 1) c.fillRect(x, HORIZON - near, 1, 1);
      }
    }
    // Sol : dégradé + lignes de fuite fixes
    const floor = c.createLinearGradient(0, HORIZON, 0, GUM_Y);
    floor.addColorStop(0, '#2a0648');
    floor.addColorStop(1, '#0b0220');
    c.fillStyle = floor;
    c.fillRect(0, HORIZON, W, GUM_Y - HORIZON);
    c.fillStyle = '#ff2a6d';
    c.fillRect(0, HORIZON, W, 1);
    for (let i = -14; i <= 14; i++) {
      for (let y = HORIZON + 1; y < GUM_Y; y++) {
        const k = (y - HORIZON) / (GUM_Y - HORIZON);
        const x = Math.round(W / 2 + i * (4 + k * 34));
        if (x < 0 || x >= W) continue;
        c.fillStyle = `rgba(247, 6, 207, ${0.25 + k * 0.4})`;
        c.fillRect(x, y, 1, 1);
      }
    }
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
    for (const s of stars) {
      const tw = Math.sin(time * 3 + s.tw) > 0.6;
      ctx.fillStyle = s.layer === 2 ? (tw ? '#ffffff' : '#bfb4ff') : s.layer === 1 ? '#8a6fd6' : '#4b3494';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
      if (s.layer === 2 && tw) {
        ctx.fillStyle = 'rgba(191,180,255,0.5)';
        ctx.fillRect(Math.floor(s.x) - 1, Math.floor(s.y), 3, 1);
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y) - 1, 1, 3);
      }
    }
    // Lignes horizontales du sol qui défilent
    const off = (time * 0.55) % 1;
    for (let i = 0; i < 10; i++) {
      const k = Math.pow((i + off) / 10, 2.2);
      const y = Math.floor(HORIZON + 1 + k * (GUM_Y - HORIZON - 2));
      ctx.fillStyle = `rgba(247, 6, 207, ${0.2 + k * 0.55})`;
      ctx.fillRect(0, y, W, 1);
    }
    // Pulsation du soleil
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 + 0.06 * Math.sin(time * 1.5);
    ctx.drawImage(S.glow.yellow, W / 2 - 60, HORIZON - 80, 120, 110);
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

};
// Ortho Invaders — la page capsule-med.com/pages/ortho-invaders EST la borne d'arcade (plein écran).
// Non connecté : « INSERT COIN » → inscription ou connexion Capsule dans l'écran de la borne
// (formulaires natifs Shopify, comptes classiques). Connecté : on joue directement.
// Victoire : formulaire de contact natif → l'équipe crée le code 100 % lié au compte du gagnant.
(function () {
  const root = document.getElementById('capsule-arcade');
  if (!root) return;
  // La borne sort de la section du thème (calques, carrousels, transformations) et se place
  // directement dans <body>, au-dessus de tout ; le reste du site est masqué (voir CSS).
  document.body.appendChild(root);
  document.documentElement.classList.add('ortho-borne');
  const customerId = root.dataset.customerId
    || window.ShopifyAnalytics?.meta?.page?.customerId
    || window.__st?.cid;
  const logged = Boolean(customerId);

  const PAGE = location.pathname;
  // Mode stand (tablette de la borne) : ?borne dans l'adresse → plein écran au premier toucher,
  // et on revient en mode stand après chaque déconnexion « Joueur suivant ».
  const STAND = new URLSearchParams(location.search).has('borne') || (() => { try { return sessionStorage.getItem('orthoStand') === '1'; } catch { return false; } })();
  if (STAND) { try { sessionStorage.setItem('orthoStand', '1'); } catch {} }
  const RULES = root.dataset.rules || '/pages/reglements-jeux-jo-2025';
  const REWARDS = [
    { id: 'biomecanique', speaker: 'Dr Skander Ellouze', title: 'Replay Biomécanique : maîtriser les clés de l’excellence en orthodontie' },
    { id: 'contentions', speaker: 'Dr Philippides', title: 'Replay Adieu les urgences : maîtriser le collage des contentions' },
  ];
  const WON_KEY = `orthoInvadersWon:${customerId}`;
  const PLAYED_KEY = `orthoInvadersPlayed:${customerId}`; // une seule partie par participant
  const LOGOUT_URL = `/account/logout?return_url=${encodeURIComponent(PAGE + (STAND ? '?borne' : ''))}`;
  // Remise à zéro par l'équipe (ex. partie interrompue) : ouvrir la page avec ?reset
  if (new URLSearchParams(location.search).has('reset')) {
    try { Object.keys(localStorage).filter((k) => k.startsWith('orthoInvaders')).forEach((k) => localStorage.removeItem(k)); } catch {}
  }
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Pacifico&family=Press+Start+2P&family=VT323&display=swap';
  document.head.appendChild(font);

  const css = `
  html.ortho-borne body > *:not(#capsule-arcade):not(script):not(style):not(link){display:none!important}
  html.ortho-borne, html.ortho-borne body{background:#05010f!important;overflow:hidden!important;height:100%!important;margin:0!important}
  #capsule-arcade{position:fixed!important;inset:0!important;z-index:2147483000;overflow:hidden;margin:0!important;padding:0!important;
    display:block!important;place-items:normal!important;min-height:0!important;border-radius:0!important;text-align:left!important;width:auto!important;height:auto!important;
    background:radial-gradient(ellipse at 50% 0%,rgba(157,78,221,.35),transparent 60%),linear-gradient(180deg,#0b0322,#05010f 70%)}
  .ca{--c:#2de2e6;--m:#ff2a6d;--y:#ffd319;--v:#9d4edd;--ink:#f5f3ff;--dim:#b9a8e8;--bg:#12062e;
    box-sizing:border-box;height:100%;display:grid;grid-template-columns:100%;grid-template-rows:auto minmax(0,1fr) auto auto;gap:1.2vh;justify-items:center;
    padding:0 16px max(1.2vh,env(safe-area-inset-bottom));font-family:'VT323',ui-monospace,monospace;color:var(--ink)}
  .ca *{box-sizing:border-box}
  .ca [hidden]{display:none!important}
  .ca-head{position:relative;justify-self:stretch;display:grid;justify-items:center;gap:.4vh;width:calc(100% + 32px);margin:0 -16px;padding:max(1.4vh,env(safe-area-inset-top)) 16px 1vh;
    background:linear-gradient(180deg,#1a0544,#0b0322);border-bottom:3px solid var(--m);box-shadow:0 0 30px rgba(255,42,109,.5);overflow:hidden;isolation:isolate}
  .ca-head::before{content:'';position:absolute;z-index:-1;left:50%;bottom:-45%;width:min(60vw,26vh);aspect-ratio:1;transform:translateX(-50%);border-radius:50%;
    background:linear-gradient(180deg,var(--y),#ff901f 45%,var(--m) 80%);opacity:.5;
    -webkit-mask:repeating-linear-gradient(180deg,#000 0 9%,transparent 9% 11%);mask:repeating-linear-gradient(180deg,#000 0 9%,transparent 9% 11%)}
  .ca-head .b{font-family:'Press Start 2P',monospace;font-size:clamp(8px,1.3vh,14px);letter-spacing:.6em;padding:.45em .5em .45em 1.1em;
    color:var(--c);border:2px solid var(--c);box-shadow:0 0 10px var(--c);background:rgba(6,1,26,.6)}
  .ca-head .t{font-family:'Press Start 2P',monospace;font-size:clamp(18px,min(4vh,6vw),56px);line-height:1;white-space:nowrap;
    background:linear-gradient(180deg,#fff 0 42%,#bff7ff 50%,var(--c) 62%,#3a86ff);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(.08em .08em 0 var(--m)) drop-shadow(0 0 .3em rgba(255,42,109,.7))}
  .ca-head .s{font-family:'Pacifico',cursive;font-size:clamp(14px,min(2.3vh,4.4vw),32px);line-height:1.1;color:#ffd1f4;text-shadow:0 0 4px #f706cf,0 0 12px #f706cf}
  .ca-stage{width:100%;height:100%;min-height:0;display:grid;place-items:center}
  .ca-screen{position:relative;line-height:0;border-radius:12px;overflow:hidden;
    box-shadow:0 0 0 3px #05010f,0 0 0 6px var(--v),0 0 36px rgba(157,78,221,.6),0 0 90px rgba(255,42,109,.25)}
  .ca-screen canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges;filter:saturate(1.15) contrast(1.05)}
  .ca-crt{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;z-index:1;
    background:repeating-linear-gradient(180deg,rgba(0,0,0,.28) 0 calc(var(--px,4px)*.32),transparent calc(var(--px,4px)*.32) var(--px,4px)),
    radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(0,0,0,.55) 100%)}
  .ca-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:6%;
    background:rgba(8,2,28,.86);line-height:normal;container-type:inline-size;overflow:auto;z-index:2}
  .ca-ov.top{align-items:flex-start}
  .ca-card{width:100%;display:grid;gap:3cqw;text-align:center;margin:auto 0}
  .ca-t{font-family:'Press Start 2P',monospace;font-size:5.2cqw;line-height:1.4;color:var(--y);text-shadow:.12em .12em 0 var(--m);margin:0}
  .ca-t.big{font-size:7.6cqw}
  .ca-blink{animation:ca-blink 1s steps(2,start) infinite}
  @keyframes ca-blink{to{visibility:hidden}}
  .ca-p{font-size:4.6cqw;line-height:1.1;color:var(--dim);margin:0}
  .ca-p b{color:var(--y);font-weight:normal}
  .ca-count{font-family:'Press Start 2P',monospace;font-size:2.8cqw;color:var(--c);line-height:1.6}
  .ca-h{font-family:'Press Start 2P',monospace;font-size:3.4cqw;color:var(--c);margin:1cqw 0 0;line-height:1.5}
  #capsule-arcade .ca-btn{font-family:'Press Start 2P',monospace;font-size:3.3cqw;line-height:1.3;text-transform:uppercase;border:0;cursor:pointer;
    padding:3.4cqw;background:var(--y);color:#12062e;box-shadow:0 5px 0 #b8860b;text-decoration:none;display:block;width:100%;text-align:center}
  #capsule-arcade .ca-btn.alt{background:var(--c);box-shadow:0 5px 0 #178a8d}
  #capsule-arcade .ca-btn:disabled{opacity:.5}
  #capsule-arcade .ca-link{font-family:'Press Start 2P',monospace;font-size:2.8cqw;color:var(--dim);background:none;border:0;cursor:pointer;text-decoration:underline;padding:1cqw;line-height:1.6}
  .ca-btn:focus-visible,.ca-rw:focus-visible,.ca-link:focus-visible{outline:3px solid var(--c);outline-offset:3px}
  .ca-prizes{display:grid;gap:2.4cqw}
  .ca-prize{display:grid;gap:1cqw;text-align:left;border:2px solid var(--m);background:rgba(18,6,46,.9);padding:2.6cqw 3cqw}
  .ca-prize .w,.ca-rw .w{font-family:'Press Start 2P',monospace;font-size:2.5cqw;color:var(--y);line-height:1.5}
  .ca-prize .t,.ca-rw .t{font-size:4.2cqw;line-height:1}
  .ca-rw{font:inherit;color:var(--ink);background:var(--bg);border:3px solid var(--m);padding:3cqw;cursor:pointer;text-align:left;display:grid;gap:1.4cqw}
  .ca-rw.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
  .ca-f{display:grid;gap:2.2cqw;text-align:left}
  .ca-f label{font-family:'Press Start 2P',monospace;font-size:2.6cqw;color:var(--dim);display:grid;gap:1.4cqw;line-height:1.4}
  .ca-f input,.ca-f select{font:inherit;font-size:max(16px,4.6cqw);padding:1.8cqw 3cqw;color:var(--ink);background:#0b0322;border:2px solid var(--v);border-radius:0;width:100%}
  .ca-f input:focus,.ca-f select:focus{outline:none;border-color:var(--c)}
  .ca-f .row{display:grid;grid-template-columns:1fr 1fr;gap:2.4cqw}
  .ca-f label.chk{display:flex;gap:2cqw;align-items:flex-start;font-family:'VT323',monospace;font-size:4cqw;line-height:1.05}
  .ca-f label.chk input{width:5cqw;height:5cqw;min-width:18px;min-height:18px;flex:none;accent-color:var(--m);padding:0}
  .ca-pad{display:none;width:min(100%,560px);grid-template-columns:1fr 1fr 1.25fr;gap:12px;height:clamp(100px,15vh,170px);touch-action:none;user-select:none;-webkit-user-select:none}
  .ca.touch.logged .ca-pad{display:grid}
  .ca.touch .ca-keys{display:none}
  .ca-pad button{touch-action:none;border:0;color:#fff;font-family:'Press Start 2P',monospace;-webkit-tap-highlight-color:transparent}
  .ca-dir{background:#1f0b4a;border:4px solid var(--c)!important;font-size:26px;box-shadow:0 5px 0 #178a8d}
  .ca-dir.down{background:#2a1566;transform:translateY(3px)}
  .ca-fire{border-radius:50%;aspect-ratio:1;justify-self:center;height:100%;font-size:14px;
    background:radial-gradient(circle at 35% 30%,#ff7ba3,var(--m) 55%,#8f0f3a);box-shadow:0 6px 0 #6d0a2c,0 0 24px var(--m)}
  .ca-fire.down{transform:translateY(4px)}
  .ca-bar{display:flex;gap:6px 18px;justify-content:center;flex-wrap:wrap;align-items:center}
  .ca-bar a,.ca-bar span{font-family:'Press Start 2P',monospace;font-size:10px;color:#8f82b8;line-height:1.8}
  #capsule-arcade .ca-fs{font-family:'Press Start 2P',monospace;font-size:11px;line-height:1;color:#12062e;background:var(--c);border:0;
    padding:9px 12px;cursor:pointer;box-shadow:0 3px 0 #178a8d}
  #capsule-arcade .ca-fs:active{transform:translateY(2px);box-shadow:0 1px 0 #178a8d}
  .ca.stand .ca-site{display:none}
  @media (prefers-reduced-motion:reduce){.ca-blink{animation:none}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const prizeCards = REWARDS.map((r) => `<div class="ca-prize"><span class="w">${esc(r.speaker.toUpperCase())} · 249 € OFFERT</span><span class="t">${esc(r.title)}</span></div>`).join('');
  const back = encodeURIComponent(PAGE);

  root.innerHTML = `
  <div class="ca${logged ? ' logged' : ''}${STAND ? ' stand' : ''}">
    <header class="ca-head"><span class="b">CAPSULE</span><span class="t">ORTHO INVADERS</span><span class="s">Défendez l'arcade dentaire !</span></header>
    <div class="ca-stage" data-fit>
      <div class="ca-screen">
        <canvas id="game" width="216" height="336" aria-label="Ortho Invaders"></canvas>
        <div class="ca-crt" aria-hidden="true"></div>

        <!-- Non connecté : accueil de la borne -->
        <div class="ca-ov" id="ca-coin"><div class="ca-card">
          <p class="ca-t big ca-blink">INSERT<br>COIN</p>
          <p class="ca-p">Protégez l'arcade dentaire, battez la <b>Méga-Carie</b> et gagnez un <b>replay de formation</b>.</p>
          <p class="ca-h">★ À GAGNER ★</p>
          <div class="ca-prizes">${prizeCards}</div>
          <p class="ca-p" style="font-size:4.4cqw">Jeu gratuit réservé aux praticiens inscrits sur Capsule.</p>
          <button type="button" class="ca-btn" data-go="ca-register">▶ Créer mon compte et jouer</button>
          <button type="button" class="ca-btn alt" data-go="ca-login">J'ai déjà un compte</button>
        </div></div>

        <!-- Inscription : formulaire natif Shopify (comptes classiques) -->
        <div class="ca-ov top" id="ca-register" hidden><div class="ca-card">
          <p class="ca-t">NOUVEAU<br>JOUEUR</p>
          <form class="ca-f" method="post" action="/account" accept-charset="UTF-8" id="ca-reg-form">
            <input type="hidden" name="form_type" value="create_customer">
            <input type="hidden" name="utf8" value="✓">
            <input type="hidden" name="customer[tags]" id="ca-tags" value="jeuJO, jeuJO-2026, jeuJO-inscrit">
            <input type="hidden" name="return_to" value="${esc(PAGE)}">
            <div class="row">
              <label>PRÉNOM<input name="customer[first_name]" autocomplete="given-name" required></label>
              <label>NOM<input name="customer[last_name]" autocomplete="family-name" required></label>
            </div>
            <label>PROFESSION
              <select id="ca-prof" required>
                <option value="">Choisir…</option>
                <option value="Orthodontiste">Orthodontiste</option>
                <option value="Omnipraticien">Chirurgien-dentiste omnipraticien</option>
                <option value="Assistante">Assistant(e) dentaire</option>
                <option value="Etudiant">Étudiant(e) / interne</option>
                <option value="Autre-profession">Autre</option>
              </select>
            </label>
            <label>EMAIL PROFESSIONNEL<input type="email" name="customer[email]" autocomplete="email" required></label>
            <label>MOT DE PASSE (6 CARACTÈRES MIN.)<input type="password" name="customer[password]" autocomplete="new-password" minlength="6" required></label>
            <label class="chk"><input type="checkbox" name="customer[accepts_marketing]" value="true" checked>Je souhaite recevoir les nouveautés Capsule : formations, replays, cas cliniques.</label>
            <button class="ca-btn" type="submit">▶ Créer mon compte et jouer</button>
          </form>
          <button type="button" class="ca-link" data-go="ca-login">J'ai déjà un compte</button>
          <button type="button" class="ca-link" data-go="ca-coin">◀ Retour</button>
        </div></div>

        <!-- Connexion : formulaire natif Shopify -->
        <div class="ca-ov" id="ca-login" hidden><div class="ca-card">
          <p class="ca-t">CONNEXION</p>
          <p class="ca-p">Utilisez votre compte Capsule habituel.</p>
          <form class="ca-f" method="post" action="/account/login" accept-charset="UTF-8">
            <input type="hidden" name="form_type" value="customer_login">
            <input type="hidden" name="utf8" value="✓">
            <input type="hidden" name="return_url" value="${esc(PAGE)}">
            <label>EMAIL<input type="email" name="customer[email]" autocomplete="email" required></label>
            <label>MOT DE PASSE<input type="password" name="customer[password]" autocomplete="current-password" required></label>
            <button class="ca-btn alt" type="submit">▶ Me connecter et jouer</button>
          </form>
          <a class="ca-link" href="/account/login#recover">Mot de passe oublié ?</a>
          <button type="button" class="ca-link" data-go="ca-register">Créer un compte</button>
          <button type="button" class="ca-link" data-go="ca-coin">◀ Retour</button>
        </div></div>

        <!-- Connecté : prêt à jouer -->
        <div class="ca-ov" id="ca-start" hidden><div class="ca-card">
          <p class="ca-t big">PRÊT,<br>DOCTEUR ?</p>
          <p class="ca-p">3 vagues, puis la <b>Méga-Carie</b>. Battez-la et choisissez votre replay offert. <b>Une seule partie par participant</b> : concentrez-vous !</p>
          <div class="ca-prizes">${prizeCards}</div>
          <button type="button" class="ca-btn" id="ca-play">▶ Jouer</button>
        </div></div>

        <div class="ca-ov" id="ca-end" hidden><div class="ca-card">
          <p class="ca-t" id="ca-end-t"></p>
          <p class="ca-p" id="ca-end-p"></p>
          <form class="ca-f" id="ca-win" method="post" action="/contact#contact_form" accept-charset="UTF-8" hidden>
            <input type="hidden" name="form_type" value="contact">
            <input type="hidden" name="utf8" value="✓">
            <input type="hidden" name="contact[name]" value="Gagnant Ortho Invaders">
            <input type="hidden" name="contact[body]" id="ca-body">
            <div class="ca-card" id="ca-rws"></div>
            <label>VOTRE EMAIL DE COMPTE CAPSULE<input type="email" name="contact[email]" id="ca-email" autocomplete="email" required></label>
            <button class="ca-btn" type="submit" id="ca-send" disabled>Valider mon gain</button>
          </form>
          <p class="ca-p ca-count" id="ca-end-count"></p>
          <a class="ca-btn alt" id="ca-next" href="#">▶ Joueur suivant</a>
        </div></div>

        <div class="ca-ov" id="ca-sent" hidden><div class="ca-card">
          <p class="ca-t big">★ BRAVO ★</p>
          <p class="ca-p">Votre victoire est enregistrée. L'équipe Capsule crée votre code personnel (100 %, usage unique, lié à votre compte) et vous l'envoie par email. Sur le stand : présentez cet écran.</p>
          <p class="ca-p ca-count" id="ca-sent-count"></p>
          <a class="ca-btn alt ca-next" href="#">▶ Joueur suivant</a>
        </div></div>

        <div class="ca-ov" id="ca-done" hidden><div class="ca-card">
          <p class="ca-t big">PARTIE<br>JOUÉE</p>
          <p class="ca-p">Vous avez déjà joué votre partie : <b>une partie par participant</b>. Merci et à bientôt sur Capsule !</p>
          <p class="ca-p ca-count" id="ca-done-count"></p>
          <a class="ca-btn alt ca-next" href="#">▶ Joueur suivant</a>
        </div></div>

        <div class="ca-ov" id="ca-pause" hidden><div class="ca-card">
          <p class="ca-t big">PAUSE</p>
          <button type="button" class="ca-btn" id="ca-resume">▶ Reprendre</button>
        </div></div>
      </div>
    </div>
    <div class="ca-pad" aria-label="Manette tactile">
      <button class="ca-dir" data-dir="-1" aria-label="Gauche">◀</button>
      <button class="ca-dir" data-dir="1" aria-label="Droite">▶</button>
      <button class="ca-fire" id="ca-fire" aria-label="Tirer">TIR</button>
    </div>
    <div class="ca-bar">
      <span class="ca-keys">← → BOUGER · ESPACE TIRER · P PAUSE</span>
      <button type="button" class="ca-fs" id="ca-fs" hidden>⛶ PLEIN ÉCRAN</button>
      ${logged ? `<a href="/account/logout?return_url=${encodeURIComponent(PAGE + (STAND ? '?borne' : ''))}">▶ JOUEUR SUIVANT (DÉCONNEXION)</a>` : ''}
      <a href="${esc(RULES)}" target="_blank" rel="noopener">RÈGLEMENT</a>
      <a class="ca-site" href="/">CAPSULE-MED.COM</a>
    </div>
  </div>`;

  // La page est la borne : plus de défilement derrière
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  // Le moteur de jeu cherche <canvas id="game"> : il démarre une fois la borne posée dans la page.
  window.__orthoInvadersGame();

  const $ = (id) => document.getElementById(id);
  if (matchMedia('(pointer: coarse)').matches) root.querySelector('.ca').classList.add('touch');
  // ── Plein écran (masque la barre d'adresse et les onglets du navigateur) ──
  const docEl = document.documentElement;
  const fsSupported = Boolean(docEl.requestFullscreen || docEl.webkitRequestFullscreen);
  const isFull = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  async function enterFull() {
    try {
      if (docEl.requestFullscreen) await docEl.requestFullscreen({ navigationUI: 'hide' });
      else docEl.webkitRequestFullscreen();
    } catch {}
    try { await screen.orientation?.lock?.('portrait'); } catch {}
  }
  function exitFull() {
    try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch {}
  }
  function syncFs() {
    const b = $('ca-fs');
    b.hidden = !fsSupported;
    b.textContent = isFull() ? '✕ QUITTER LE PLEIN ÉCRAN' : '⛶ PLEIN ÉCRAN';
    setTimeout(() => window.Game?.fit?.(), 50);
  }
  $('ca-fs').addEventListener('click', () => (isFull() ? exitFull() : enterFull()));
  document.addEventListener('fullscreenchange', syncFs);
  document.addEventListener('webkitfullscreenchange', syncFs);
  if (STAND && fsSupported) {
    // Les navigateurs exigent un geste : le premier toucher sur la borne passe en plein écran.
    const auto = (e) => { if (!isFull() && !e.target.closest('input,select,textarea')) enterFull(); };
    root.addEventListener('pointerdown', auto, { capture: true });
  }

  const overlays = ['ca-coin', 'ca-register', 'ca-login', 'ca-start', 'ca-end', 'ca-sent', 'ca-done', 'ca-pause'];
  const show = (id) => overlays.forEach((o) => { $(o).hidden = o !== id; });
  syncFs();

  root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
    show(b.dataset.go);
    try { Sfx.unlock(); Sfx.coin(); } catch {}
    $(b.dataset.go).querySelector('input:not([type=hidden])')?.focus();
  }));

  // La profession devient un tag client (segmentation Shopify)
  $('ca-reg-form').addEventListener('submit', () => {
    const prof = $('ca-prof').value;
    if (prof) $('ca-tags').value = `jeuJO, jeuJO-2026, jeuJO-inscrit, ${prof}`;
  });

  if (!logged) {
    const hash = location.hash.replace('#', '');
    show(hash === 'inscription' ? 'ca-register' : hash === 'connexion' ? 'ca-login' : 'ca-coin');
    return;
  }

  let startedAt = 0;
  let last = null;
  let reward = null;

  // ── Une partie par participant, puis déconnexion pour le joueur suivant ──
  root.querySelectorAll('#ca-next, .ca-next').forEach((a) => { a.href = LOGOUT_URL; });
  let countdown = null;
  function logoutIn(seconds, elId, label) {
    clearInterval(countdown);
    let left = seconds;
    const tick = () => {
      $(elId).textContent = `${label} dans ${left} s`;
      if (left-- <= 0) { clearInterval(countdown); location.href = LOGOUT_URL; }
    };
    tick();
    countdown = setInterval(tick, 1000);
  }

  const posted = new URLSearchParams(location.search).get('contact_posted') === 'true';
  if (posted && store.get(WON_KEY)) {
    show('ca-sent');
    logoutIn(20, 'ca-sent-count', 'Déconnexion automatique');
  } else if (store.get(PLAYED_KEY)) {
    show('ca-done');
    logoutIn(10, 'ca-done-count', 'Déconnexion automatique');
  } else {
    show('ca-start');
  }

  function play() {
    if (store.get(PLAYED_KEY)) { show('ca-done'); logoutIn(10, 'ca-done-count', 'Déconnexion automatique'); return; }
    store.set(PLAYED_KEY, String(Date.now()));
    Sfx.unlock();
    show(null);
    document.activeElement?.blur?.();
    startedAt = Date.now();
    Game.start({ name: 'DOCTEUR', onEnd: end });
  }

  function end({ won, score, wave }) {
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    last = { won, score, wave, seconds };
    show('ca-end');
    $('ca-end-t').textContent = won ? '★ VICTOIRE ★' : 'GAME OVER';
    $('ca-win').hidden = true;
    $('ca-next').hidden = false;
    if (!won) {
      $('ca-end-p').textContent = `${score} points. La Méga-Carie a gagné cette fois… Merci d'avoir joué ! Suivez-nous sur capsule-med.com pour les prochaines formations.`;
      logoutIn(12, 'ca-end-count', 'Joueur suivant');
      return;
    }
    $('ca-end-p').textContent = `Bravo ! ${score} points. Choisissez votre replay offert :`;
    $('ca-rws').innerHTML = REWARDS.map((r) => `<button type="button" class="ca-rw" data-id="${r.id}"><span class="w">${esc(r.speaker.toUpperCase())}</span><span class="t">${esc(r.title)}</span></button>`).join('');
    $('ca-rws').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      reward = REWARDS.find((r) => r.id === b.dataset.id);
      $('ca-rws').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      $('ca-send').disabled = false;
    }));
    reward = null;
    $('ca-send').disabled = true;
    $('ca-win').hidden = false;
    $('ca-next').hidden = true;
    // Le gagnant a 2 minutes pour valider, puis la borne se libère.
    logoutIn(120, 'ca-end-count', 'Déconnexion automatique');
  }

  $('ca-win').addEventListener('submit', (e) => {
    if (!reward || !last) { e.preventDefault(); return; }
    const when = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    $('ca-body').value = [
      'NOUVEAU GAGNANT — ORTHO INVADERS',
      last.seconds < 90 ? '⚠ PARTIE ANORMALEMENT COURTE (moins de 90 s) : vérifier avant de créer le code.' : 'Durée de partie normale.',
      `Replay choisi : ${reward.title} (${reward.speaker})`,
      `Email déclaré : ${$('ca-email').value}`,
      `Compte client Shopify : ${customerId}`,
      `Score : ${last.score} · Durée de la partie : ${last.seconds} s · Vague : ${last.wave}`,
      `Date : ${when}`,
      `Appareil : ${matchMedia('(pointer: coarse)').matches ? 'tactile (tablette du stand ou mobile)' : 'ordinateur'}`,
      '',
      'À faire : Réductions > Créer > Montant de réduction sur les produits, 100 %, produit = replay choisi,',
      'Admissibilité = ce client uniquement, Limite = 1 utilisation. Puis envoyer le code au gagnant.',
    ].join('\n');
    store.set(WON_KEY, reward.id);
    clearInterval(countdown);
  });

  $('ca-play').addEventListener('click', play);

  function pause() {
    if (!window.Game || ['attract', 'over'].includes(Game.mode) || Game.paused) return;
    Game.paused = true;
    if (Game.paused) show('ca-pause');
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('blur', pause);
  addEventListener('keydown', (e) => { if (e.code === 'KeyP' || e.code === 'Escape') pause(); });
  addEventListener('keyup', (e) => {
    if (e.code === 'Space' && window.Game && !['attract', 'over'].includes(Game.mode)) e.preventDefault();
  }, true);
  $('ca-resume').addEventListener('click', () => { show(null); Game.paused = false; });

  // Manette tactile (tablette du stand, mobile)
  const st = { x: 0, fire: false };
  const held = new Map();
  const sync = () => window.Game?.setRemote(st);
  root.querySelectorAll('.ca-dir').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture?.(e.pointerId); held.set(e.pointerId, +btn.dataset.dir); upd(); });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, (e) => { held.delete(e.pointerId); upd(); });
  });
  function upd() {
    const d = [...held.values()];
    st.x = d.length ? d[d.length - 1] : 0;
    root.querySelectorAll('.ca-dir').forEach((b) => b.classList.toggle('down', d.includes(+b.dataset.dir)));
    sync();
  }
  const fire = $('ca-fire');
  fire.addEventListener('pointerdown', (e) => { e.preventDefault(); fire.setPointerCapture?.(e.pointerId); st.fire = true; fire.classList.add('down'); sync(); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) fire.addEventListener(ev, () => { st.fire = false; fire.classList.remove('down'); sync(); });
  root.addEventListener('contextmenu', (e) => { if (e.target.closest('.ca-pad')) e.preventDefault(); });
})();
