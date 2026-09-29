/* Ortho Invaders — Capsule · build 2026-09-29 */
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
      title: 'VAGUE 1', name: 'LES BACTÉRIES', place: 'AU CABINET',
      tip: 'Le biofilm dentaire se reconstitue en quelques heures après le brossage.',
      rows: ['plaq', 'bact', 'bact'], speed: 10, fire: 1.4, bulletSpeed: 70, dive: 0,
    },
    {
      title: 'VAGUE 2', name: 'LA PLAQUE ATTAQUE', place: 'EN SALLE DE RADIO',
      tip: 'Brackets et fils multiplient les zones de rétention : l’hygiène est la clé du traitement.',
      rows: ['candy', 'plaq', 'bact', 'bact'], speed: 12, fire: 1.05, bulletSpeed: 80, dive: 4.5,
    },
    {
      title: 'VAGUE 3', name: 'INVASION SUCRÉE', place: 'AU LABO DE PROTHÈSE',
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

  // ── Décors pré-rendus : une pièce différente par vague, en pixel art néon ──
  // Vague 1 : cabinet · Vague 2 : salle de radio · Vague 3 : laboratoire de prothèse · Boss : cabinet en alerte
  const LAMP = { x: 152, y: 58 };        // scialytique (lampe opératoire)
  const MONITOR = { x: 170, y: 92, w: 36, h: 22 };
  const FURNACE = { x: 184, y: 118 };    // hublot du four à céramique
  const BUNSEN = { x: 146, y: 139 };     // flamme du bec Bunsen

  function buildRoom(theme, drawProps) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

    // Mur carrelé
    const wall = c.createLinearGradient(0, 0, 0, HORIZON);
    wall.addColorStop(0, theme.wall[0]);
    wall.addColorStop(1, theme.wall[1]);
    c.fillStyle = wall;
    c.fillRect(0, 0, W, HORIZON);
    for (let y = 22; y < HORIZON; y += 12) r(0, y, W, 1, theme.grout);
    for (let row = 0, y = 22; y < HORIZON; y += 12, row++) {
      for (let x = (row % 2) * 6; x < W; x += 12) r(x, y, 1, 12, theme.grout);
    }
    r(0, 158, W, 3, theme.rail[0]);
    r(0, 158, W, 1, theme.rail[1]);
    // Tube néon au plafond
    r(18, 16, W - 36, 2, theme.neon[0]);
    r(18, 18, W - 36, 1, theme.neon[1]);

    drawProps(c, r);

    // Sol : carrelage en damier, en perspective
    const img = c.getImageData(0, HORIZON, W, GUM_Y - HORIZON);
    const hFloor = GUM_Y - HORIZON;
    for (let y = 0; y < hFloor; y++) {
      const k = y / hFloor;
      const row = Math.floor(Math.pow(k, 0.55) * 9);
      const scale = 7 + k * 26;
      for (let x = 0; x < W; x++) {
        const col = Math.floor((x - W / 2) / scale + 100);
        const [cr, cg, cb] = (row + col) % 2 === 0 ? theme.floor[0] : theme.floor[1];
        const i = (y * W + x) * 4;
        const shade = 0.55 + k * 0.45;
        img.data[i] = cr * shade; img.data[i + 1] = cg * shade; img.data[i + 2] = cb * shade; img.data[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, HORIZON);
    r(0, HORIZON, W, 1, theme.line);

    // Voile sombre : le décor reste lisible sans gêner le jeu
    r(0, 0, W, GUM_Y, 'rgba(8, 2, 28, 0.38)');

    // Gencive + arcade du bas avec bagues et fil orthodontique
    const gum = c.createLinearGradient(0, GUM_Y, 0, H);
    gum.addColorStop(0, '#ff5fa2');
    gum.addColorStop(0.35, '#e0307a');
    gum.addColorStop(1, '#7a0f3f');
    c.fillStyle = gum;
    c.fillRect(0, GUM_Y, W, H - GUM_Y);
    r(0, GUM_Y, W, 1, '#12062e');
    for (let i = 0; i < 12; i++) {
      const x = 6 + i * 17 + (i % 2);
      c.drawImage(S.incisor, x, GUM_Y - 5);
      r(x + 1, GUM_Y + 3, 5, 1, '#ffb3d1');
    }
    r(0, GUM_Y - 1, W, 1, '#2de2e6'); // fil
    return cv;
  }

  const ROOMS = {
    // ── Cabinet dentaire ──
    cabinet: buildRoom({
      wall: ['#120630', '#241050'], grout: 'rgba(90, 60, 170, 0.2)', rail: ['#3a1f6e', '#6b4bb8'],
      neon: ['#7ff9ff', '#1f8f98'], floor: [[34, 16, 74], [58, 36, 110]], line: '#ff2a6d',
    }, (c, r) => {
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

    }),

    // ── Salle de radiologie ──
    radio: buildRoom({
      wall: ['#06142e', '#0f2a55'], grout: 'rgba(60, 160, 220, 0.18)', rail: ['#1b3d6e', '#3f7fc0'],
      neon: ['#bfeaff', '#3a86ff'], floor: [[14, 28, 64], [26, 52, 98]], line: '#2de2e6',
    }, (c, r) => {
      const K = '#12062e';
      // Voyant « RAYONS X » (s'allume en rouge, voir drawBackground)
      r(W / 2 - 34, 21, 68, 11, K); r(W / 2 - 33, 22, 66, 9, '#3a0d18');
      const sign = renderText('RAYONS X', { color: '#ff6b6b', shadow: '#3a0d18' });
      c.drawImage(sign, Math.round(W / 2 - sign.width / 2), 23);
      // Mur de négatoscopes (radios allumées)
      for (let n = 0; n < 3; n++) {
        const x = 6 + n * 22;
        r(x, 58, 20, 28, K); r(x + 1, 59, 18, 26, '#6c6c80'); r(x + 2, 60, 16, 24, '#0d2a3a');
      }
      // radio d'une dent (racines)
      r(12, 64, 6, 7, '#bfeaff'); r(12, 71, 2, 9, '#8fcfe8'); r(16, 71, 2, 9, '#8fcfe8'); r(13, 65, 4, 3, '#e8f7ff');
      // téléradiographie de profil (crâne)
      c.fillStyle = '#8fcfe8'; c.beginPath(); c.ellipse(38, 70, 7, 8, 0, 0, Math.PI * 2); c.fill();
      r(36, 76, 8, 5, '#8fcfe8'); r(39, 77, 5, 1, '#e8f7ff'); r(31, 66, 2, 2, '#0d2a3a');
      // panoramique
      for (let i = 0; i < 7; i++) { r(52 + i * 2, 66 + Math.abs(i - 3), 1, 4, '#bfeaff'); r(52 + i * 2, 76 - Math.abs(i - 3), 1, 4, '#bfeaff'); }
      // Appareil panoramique (OPT) au centre
      r(100, 34, 14, 172, K); r(101, 34, 12, 172, '#c8c8d8'); r(101, 34, 3, 172, '#ececf8'); // colonne
      r(92, 198, 30, 8, K); r(93, 199, 28, 6, '#8f82c8');                                   // base
      r(66, 92, 82, 14, K); r(67, 93, 80, 12, '#e8e8f5'); r(67, 93, 80, 2, '#ffffff'); r(67, 103, 80, 2, '#9a9ab4'); // bras
      r(66, 106, 14, 34, K); r(67, 107, 12, 32, '#d0d0e2'); r(69, 110, 8, 8, '#2de2e6');   // tête du tube
      r(134, 106, 14, 34, K); r(135, 107, 12, 32, '#d0d0e2'); r(137, 110, 8, 20, '#12062e'); // capteur
      r(98, 140, 18, 4, K); r(99, 141, 16, 2, '#2de2e6');                                  // mentonnière
      r(88, 146, 38, 3, K); r(89, 147, 36, 1, '#8f82c8');                                  // poignées
      r(116, 60, 18, 12, K); r(117, 61, 16, 10, '#1b3d6e'); r(119, 63, 5, 2, '#7dff5c'); r(126, 63, 5, 2, '#ff3b3b'); // pupitre
      // Panneau radioprotection
      c.fillStyle = K; c.beginPath(); c.moveTo(186, 60); c.lineTo(200, 84); c.lineTo(172, 84); c.closePath(); c.fill();
      c.fillStyle = '#ffd319'; c.beginPath(); c.moveTo(186, 63); c.lineTo(197, 82); c.lineTo(175, 82); c.closePath(); c.fill();
      r(185, 72, 3, 3, K); r(181, 76, 3, 2, K); r(189, 76, 3, 2, K); r(185, 68, 3, 2, K);
      // Tablier plombé sur sa patère
      r(184, 96, 4, 4, '#c8c8d8');
      r(172, 100, 28, 64, K); r(173, 101, 26, 62, '#3f5f8f'); r(173, 101, 26, 3, '#6f93c8'); r(176, 110, 20, 2, '#2e4a73');
      r(178, 101, 16, 6, '#2e4a73');
      // Siège opérateur
      r(20, 176, 18, 5, K); r(21, 177, 16, 3, '#3f7fc0'); r(28, 181, 3, 20, '#6c6c80'); r(20, 200, 18, 3, '#4a4a60');
    }),

    // ── Laboratoire de prothèse ──
    labo: buildRoom({
      wall: ['#1a0716', '#3a1426'], grout: 'rgba(220, 110, 80, 0.16)', rail: ['#5a2a2a', '#b8683c'],
      neon: ['#ffd9a8', '#b8683c'], floor: [[46, 20, 30], [78, 36, 44]], line: '#ff901f',
    }, (c, r) => {
      const K = '#12062e';
      const sign = renderText('LABO PROTHÈSE', { color: '#ffb347', shadow: '#4a1a10' });
      c.drawImage(sign, Math.round(W / 2 - sign.width / 2), 23);
      // Étagères murales avec modèles et couronnes
      for (const y of [60, 88]) { r(6, y, 86, 3, K); r(6, y, 86, 2, '#b8683c'); }
      for (let i = 0; i < 5; i++) { // modèles en plâtre (arcades)
        const x = 10 + i * 16;
        r(x, 50, 12, 10, K); r(x + 1, 52, 10, 8, '#f2ead8'); r(x + 1, 51, 10, 2, '#ff8ab0');
        for (let t = 0; t < 4; t++) r(x + 2 + t * 2, 50, 1, 2, '#ffffff');
      }
      for (let i = 0; i < 6; i++) { // bocaux de couronnes
        const x = 10 + i * 13;
        r(x, 76, 10, 12, K); r(x + 1, 77, 8, 11, 'rgba(191, 234, 255, 0.5)'); r(x + 1, 76, 8, 2, '#b8683c');
        r(x + 3, 82, 2, 3, '#ffffff'); r(x + 5, 84, 2, 3, '#ffd319');
      }
      // Lampe d'établi articulée
      r(118, 58, 3, 40, '#8f82c8'); r(104, 56, 18, 3, '#8f82c8'); r(98, 52, 14, 7, K); r(99, 53, 12, 5, '#c8c8d8'); r(100, 58, 10, 1, '#fff6c2');
      // Four à céramique (hublot rougeoyant, voir drawBackground)
      r(162, 94, 44, 52, K); r(163, 95, 42, 50, '#4a4a60'); r(163, 95, 42, 3, '#8f82c8');
      c.fillStyle = K; c.beginPath(); c.arc(FURNACE.x, FURNACE.y, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ff6a1f'; c.beginPath(); c.arc(FURNACE.x, FURNACE.y, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffd319'; c.beginPath(); c.arc(FURNACE.x, FURNACE.y, 5, 0, Math.PI * 2); c.fill();
      r(168, 134, 14, 3, '#7dff5c'); r(186, 134, 4, 3, '#ff3b3b'); r(193, 134, 4, 3, '#ffd319');
      // Établi
      r(0, 146, 160, 8, K); r(0, 147, 160, 6, '#a86b3c'); r(0, 147, 160, 2, '#d69a5c');
      for (let i = 0; i < 4; i++) { r(4 + i * 40, 154, 36, 52, '#3a1a24'); r(4 + i * 40, 154, 36, 1, '#5a2a34'); r(19 + i * 40, 170, 6, 2, '#ff901f'); }
      // Articulateur avec modèles
      r(18, 118, 30, 3, '#c8c8d8'); r(18, 140, 30, 3, '#c8c8d8'); r(44, 118, 3, 25, '#c8c8d8'); r(46, 128, 5, 4, '#8f82c8');
      r(20, 121, 22, 6, '#f2ead8'); r(20, 134, 22, 6, '#f2ead8');
      for (let t = 0; t < 7; t++) { r(21 + t * 3, 127, 2, 2, '#ffffff'); r(21 + t * 3, 132, 2, 2, '#ffffff'); }
      // Microscope
      r(76, 142, 20, 4, K); r(77, 143, 18, 2, '#6c6c80'); r(84, 110, 4, 32, '#6c6c80'); r(80, 106, 12, 6, '#c8c8d8');
      r(78, 98, 5, 10, '#c8c8d8'); r(89, 98, 5, 10, '#c8c8d8'); r(80, 124, 14, 3, '#8f82c8');
      // Bec Bunsen (flamme animée, voir drawBackground)
      r(BUNSEN.x - 4, 142, 8, 4, K); r(BUNSEN.x - 3, 142, 6, 3, '#8f82c8'); r(BUNSEN.x - 1, 128, 3, 14, '#c8c8d8');
      // Tabouret de prothésiste
      r(56, 176, 20, 5, K); r(57, 177, 18, 3, '#b8683c'); r(64, 181, 4, 20, '#6c6c80'); r(56, 200, 20, 3, '#4a4a60');
    }),
  };
  const bg = ROOMS.cabinet;

  let roomKey = 'cabinet';
  let prevRoom = null;
  let roomFade = 0;
  function currentRoom() {
    if (!g || mode === 'attract') return 'cabinet';
    return ['cabinet', 'cabinet', 'radio', 'labo'][g.wave] || 'cabinet';
  }

  function drawBackground() {
    const want = currentRoom();
    if (want !== roomKey) { prevRoom = roomKey; roomKey = want; roomFade = 1; }
    ctx.drawImage(ROOMS[roomKey], 0, 0);
    if (roomFade > 0 && prevRoom) {
      // Fondu rétro « en escalier » entre deux pièces
      roomFade = Math.max(0, roomFade - 1 / 45);
      ctx.globalAlpha = Math.round(roomFade * 6) / 6;
      ctx.drawImage(ROOMS[prevRoom], 0, 0);
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = 'lighter';
    const flicker = Math.sin(time * 37) > 0.97 ? 0.1 : 0.35;
    ctx.globalAlpha = flicker;
    ctx.drawImage(roomKey === 'labo' ? S.glow.yellow : S.glow.cyan, 10, 8, W - 20, 20);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (roomKey === 'cabinet') {
      // Tracé cardiaque sur le moniteur
      const M = MONITOR;
      const pw = M.w - 4, ph = M.h - 4;
      for (let i = 0; i < pw; i++) {
        const t = (i + Math.floor(time * 24)) % 40;
        const y = t === 18 ? -6 : t === 19 ? 5 : t === 20 ? -2 : 0;
        ctx.fillStyle = `rgba(125, 255, 92, ${0.25 + (i / pw) * 0.6})`;
        ctx.fillRect(M.x + 2 + i, M.y + 2 + ph / 2 + y, 1, 1);
      }
      // Poussière dans la lumière du scialytique
      for (const s of stars) {
        if (s.layer !== 2) continue;
        ctx.fillStyle = 'rgba(255, 246, 194, 0.35)';
        ctx.fillRect(Math.floor(LAMP.x - 30 + ((s.x * 0.3 + time * 2) % 60)), Math.floor(70 + (s.y % 90)), 1, 1);
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.16 + 0.03 * Math.sin(time * 2);
      ctx.drawImage(S.glow.yellow, LAMP.x - 50, LAMP.y - 4, 96, 150);
      ctx.globalAlpha = 0.22 + 0.08 * Math.sin(time * 3);
      ctx.drawImage(S.glow.magenta, W / 2 - 34, 16, 68, 22);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    } else if (roomKey === 'radio') {
      // Voyant « RAYONS X » clignotant + faisceau entre le tube et le capteur
      const on = Math.floor(time * 2) % 2 === 0;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = on ? 0.55 : 0.12;
      ctx.drawImage(S.glow.magenta, W / 2 - 40, 12, 80, 30);
      const scan = (time * 0.7) % 1;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#7ff9ff';
      ctx.fillRect(80, 114 + Math.round(scan * 20), 54, 1);
      ctx.drawImage(S.glow.cyan, 90, 104 + scan * 20, 34, 20);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    } else if (roomKey === 'labo') {
      // Four qui rougeoie + flamme du bec Bunsen
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(time * 5);
      ctx.drawImage(S.glow.yellow, FURNACE.x - 24, FURNACE.y - 24, 48, 48);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      const h = 6 + Math.round(Math.sin(time * 18) * 1.5 + Math.random());
      ctx.fillStyle = '#3a86ff'; ctx.fillRect(BUNSEN.x - 1, 128 - h, 3, h);
      ctx.fillStyle = '#bfeaff'; ctx.fillRect(BUNSEN.x, 128 - h + 2, 1, h - 2);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.4;
      ctx.drawImage(S.glow.cyan, BUNSEN.x - 8, 116, 16, 16);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Boss : le cabinet passe en alerte rouge
    if (g && g.boss) {
      ctx.fillStyle = `rgba(255, 30, 60, ${0.08 + 0.07 * Math.max(0, Math.sin(time * 5))})`;
      ctx.fillRect(0, 0, W, GUM_Y);
    }
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
      panel(y0, 160);
      text(def.title, W / 2, y0 + 10, { scale: 2, colors: CHROME });
      text(def.name, W / 2, y0 + 32, { colors: GOLD });
      text(`· ${def.place} ·`, W / 2, y0 + 43, { color: '#2de2e6' });
      // Tableau des points, façon borne des années 80
      const types = [...new Set(def.rows)];
      types.forEach((type, i) => {
        const y = y0 + 58 + i * 16;
        const f = Math.floor(time * 2) % 2 ? '2' : '1';
        ctx.drawImage(S[type + f], 46, y - 2);
        text(`${ENEMY[type].name}`, 66, y + 1, { align: 'left', color: '#ffffff' });
        text(`${ENEMY[type].points * g.wave} PTS`, 172, y + 1, { align: 'right', color: '#ffd319' });
      });
      const ty = y0 + 62 + types.length * 16;
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
      wave: (n) => { if (g) { g.enemies = []; g.wave = n - 1; nextWave(); } },
    };
  }
})();

};
// Manette du stand : un téléphone Capsule dédié pilote la borne (iPad) en direct, sans appli ni serveur.
// Liaison pair-à-pair WebRTC (PeerJS) : l'iPad affiche un code, le téléphone ouvre
// capsule-med.com/pages/ortho-invaders?manette=CODE (une seule fois, le code est mémorisé).
(function () {
  const PEER_SRC = window.__orthoPeerSrc || 'https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js';
  const PEER_OPTS = Object.assign({ debug: 0 }, window.__orthoPeerOpts || {});
  const CODE_KEY = 'orthoPadCode';
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const peerId = (code) => `capsule-ortho-invaders-${code.toLowerCase()}`;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const cleanCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  const clamp = (x) => Math.max(-1, Math.min(1, Number(x) || 0));

  let peerLib = null;
  function loadPeer() {
    if (window.Peer) return Promise.resolve();
    peerLib ??= new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PEER_SRC;
      s.onload = resolve;
      s.onerror = () => { peerLib = null; reject(new Error('peerjs')); };
      document.head.appendChild(s);
    });
    return peerLib;
  }

  // ── Côté borne (iPad) ──────────────────────────────────────
  function screen({ onInput, onAction, onStatus }) {
    let code = cleanCode(store.get(CODE_KEY));
    if (code.length !== 5) {
      code = Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => ALPHABET[b % ALPHABET.length]).join('');
      store.set(CODE_KEY, code);
    }
    let peer = null;
    let conn = null;
    let lastMsg = 0;
    let stale = false;
    const release = () => { onInput({ x: 0, fire: false }); };
    const drop = (c) => {
      if (conn !== c) return;
      conn = null;
      release();
      onStatus(false);
    };

    function start() {
      loadPeer().then(() => {
        peer = new window.Peer(peerId(code), PEER_OPTS);
        peer.on('connection', (c) => {
          // Une seule manette : une nouvelle ne remplace l'actuelle que si celle-ci ne répond plus.
          if (conn && conn.open && Date.now() - lastMsg < 3000) {
            c.on('open', () => { c.send({ t: 'busy' }); setTimeout(() => c.close(), 500); });
            return;
          }
          try { conn?.close(); } catch {}
          conn = c;
          c.on('open', () => { lastMsg = Date.now(); onStatus(true); });
          c.on('data', (m) => {
            if (conn !== c || !m) return;
            lastMsg = Date.now();
            stale = false;
            if (m.t === 'in') onInput({ x: clamp(m.x), fire: Boolean(m.fire) });
            else if (m.t === 'act') onAction(String(m.a));
          });
          c.on('close', () => drop(c));
          c.on('error', () => drop(c));
        });
        peer.on('disconnected', () => setTimeout(() => { if (!peer.destroyed) peer.reconnect(); }, 2000));
        peer.on('error', (e) => {
          // unavailable-id : l'ancienne session de la page n'est pas encore libérée → on réessaie.
          if (['unavailable-id', 'network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible'].includes(e.type)) {
            peer.destroy();
            setTimeout(start, 4000);
          }
        });
      }).catch(() => setTimeout(start, 8000));
    }
    start();

    // Le téléphone envoie son état en continu : silence = on relâche les commandes, puis on le libère.
    setInterval(() => {
      if (!conn) return;
      const idle = Date.now() - lastMsg;
      if (idle > 1500 && !stale) { stale = true; release(); }
      if (idle > 8000) { const c = conn; drop(c); try { c.close(); } catch {} }
    }, 500);
    addEventListener('pagehide', () => { try { peer?.destroy(); } catch {} });

    return {
      code,
      send(msg) { if (conn?.open) { try { conn.send(msg); } catch {} } },
    };
  }

  // ── Côté téléphone : la manette ────────────────────────────
  function phone(root, urlCode) {
    document.body.appendChild(root);
    document.documentElement.classList.add('ortho-borne', 'ortho-pad');
    if (cleanCode(urlCode).length === 5) store.set(CODE_KEY, cleanCode(urlCode));
    let code = cleanCode(store.get(CODE_KEY));

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';
    document.head.appendChild(font);
    const meta = document.querySelector('meta[name=viewport]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'viewport' }));
    meta.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';

    const style = document.createElement('style');
    style.textContent = `
    html.ortho-pad body > *:not(#capsule-arcade):not(script):not(style):not(link){display:none!important}
    html.ortho-pad, html.ortho-pad body{background:#05010f!important;overflow:hidden!important;height:100%!important;margin:0!important;overscroll-behavior:none}
    #capsule-arcade{position:fixed!important;inset:0!important;z-index:2147483000;margin:0!important;padding:0!important;display:block!important;
      width:auto!important;height:auto!important;border-radius:0!important;text-align:left!important;min-height:0!important;
      background:radial-gradient(ellipse at 50% 0%,rgba(157,78,221,.35),transparent 60%),linear-gradient(180deg,#0b0322,#05010f 70%)!important}
    .mp{--c:#2de2e6;--m:#ff2a6d;--y:#ffd319;--v:#9d4edd;box-sizing:border-box;height:100%;display:grid;gap:2.4vh 12px;
      grid-template-columns:1fr 1fr;grid-template-rows:auto minmax(0,1fr) auto auto;
      grid-template-areas:"top top" "mid mid" "small small" "dirs fire";
      padding:max(14px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));color:#f5f3ff;font-family:'VT323',monospace;
      user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none}
    .mp *{box-sizing:border-box}
    .mp [hidden]{display:none!important}
    .mp-top{grid-area:top;display:flex;justify-content:space-between;align-items:center;gap:10px}
    .mp-brand{font-family:'Press Start 2P',monospace;font-size:12px;letter-spacing:.3em;color:#fff;text-shadow:0 0 8px var(--m)}
    .mp-dot{font-family:'Press Start 2P',monospace;font-size:9px;color:#8f82b8;display:flex;align-items:center;gap:8px}
    .mp-dot::before{content:'';width:10px;height:10px;border-radius:50%;background:#ff2a6d;box-shadow:0 0 8px #ff2a6d}
    .mp.on .mp-dot{color:var(--c)}
    .mp.on .mp-dot::before{background:#39ff88;box-shadow:0 0 8px #39ff88}
    .mp-mid{grid-area:mid;display:grid;align-content:center;justify-items:center;gap:2vh;text-align:center}
    .mp-title{font-family:'Press Start 2P',monospace;font-size:clamp(16px,6vw,26px);line-height:1.3;
      background:linear-gradient(180deg,#fff 10%,var(--c) 55%,#2d6cdf);-webkit-background-clip:text;background-clip:text;color:transparent}
    .mp-msg{font-size:clamp(22px,7vw,32px);line-height:1.1;color:#ffd1f4;max-width:22ch}
    .mp-hud{font-family:'Press Start 2P',monospace;font-size:clamp(12px,4vw,18px);color:var(--y);line-height:1.8}
    .mp-form{display:grid;gap:12px;justify-items:center}
    .mp-form input{font-family:'Press Start 2P',monospace;font-size:28px;letter-spacing:.3em;text-align:center;width:9ch;padding:12px 6px;
      color:#fff;background:#12062e;border:3px solid var(--c);border-radius:0;text-transform:uppercase;user-select:text;-webkit-user-select:text}
    .mp-btn{font-family:'Press Start 2P',monospace;font-size:13px;color:#12062e;background:var(--y);border:0;padding:14px 18px;box-shadow:0 4px 0 #b8900a}
    /* Deux pouces : ◀ ▶ sous le pouce gauche, TIR sous le pouce droit (inversé en mode gaucher) */
    .mp button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .mp-dir,.mp-fire{touch-action:none;border:0;color:#fff;font-family:'Press Start 2P',monospace}
    .mp-dirs{grid-area:dirs;justify-self:start;align-self:end;display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .mp-dir{width:clamp(72px,21vw,120px);height:clamp(100px,17vh,170px);background:#1f0b4a;border:4px solid var(--c)!important;font-size:30px;box-shadow:0 6px 0 #178a8d}
    .mp-fire{grid-area:fire;justify-self:end;align-self:end;width:clamp(120px,36vw,200px);aspect-ratio:1;border-radius:50%;font-size:16px;
      background:radial-gradient(circle at 35% 30%,#ff7ba3,var(--m) 55%,#8f0f3a);box-shadow:0 7px 0 #6d0a2c,0 0 28px var(--m)}
    .mp-dir.down{background:#2a1566;transform:translateY(4px);box-shadow:0 2px 0 #178a8d}
    .mp-fire.down{transform:translateY(5px);box-shadow:0 2px 0 #6d0a2c,0 0 36px var(--m)}
    .mp-small{grid-area:small;display:flex;justify-content:space-between;gap:8px}
    .mp-small button{font-family:'Press Start 2P',monospace;font-size:9px;color:#b9a8e8;background:transparent;border:2px solid #3b2470;padding:10px 10px}
    .mp.lefty{grid-template-areas:"top top" "mid mid" "small small" "fire dirs"}
    .mp.lefty .mp-dirs{justify-self:end}
    .mp.lefty .mp-fire{justify-self:start}
    /* Téléphone à l'horizontale : prise en main façon manette de console */
    @media (orientation:landscape) and (max-height:600px){
      .mp{grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:auto minmax(0,1fr) auto;gap:10px 18px;
        grid-template-areas:"top top top" "dirs mid fire" "dirs small fire";padding-top:max(10px,env(safe-area-inset-top))}
      .mp.lefty{grid-template-areas:"top top top" "fire mid dirs" "fire small dirs"}
      .mp-dirs,.mp.lefty .mp-dirs{align-self:center;justify-self:center}
      .mp-fire,.mp.lefty .mp-fire{align-self:center;justify-self:center;width:auto;height:min(62vh,230px)}
      .mp-dir{width:clamp(70px,11vw,120px);height:min(58vh,220px)}
      .mp-title{display:none}
      .mp-msg{font-size:clamp(18px,3.4vw,26px)}
      .mp-small{justify-content:center;flex-wrap:wrap}
      .mp-form{gap:8px}
      .mp-form input{font-size:22px;padding:8px 6px}
    }
    .mp.off .mp-dirs,.mp.off .mp-fire,.mp.off .mp-pause{opacity:.35}
    `;
    document.head.appendChild(style);

    root.innerHTML = `
    <div class="mp off" id="mp">
      <div class="mp-top"><span class="mp-brand">CAPSULE</span><span class="mp-dot" id="mp-dot">HORS LIGNE</span></div>
      <div class="mp-mid">
        <div class="mp-title">ORTHO<br>INVADERS</div>
        <form class="mp-form" id="mp-form" hidden>
          <div class="mp-msg">Entrez le code manette affiché en bas de la borne</div>
          <input id="mp-code" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" placeholder="•••••">
          <button class="mp-btn" type="submit">CONNECTER</button>
        </form>
        <div class="mp-msg" id="mp-msg"></div>
        <div class="mp-hud" id="mp-hud"></div>
      </div>
      <div class="mp-small">
        <button type="button" id="mp-change">CODE</button>
        <button type="button" id="mp-hand" aria-pressed="false">GAUCHER</button>
        <button type="button" class="mp-pause" id="mp-pause">❚❚ PAUSE</button>
      </div>
      <div class="mp-dirs">
        <button class="mp-dir" data-dir="-1" aria-label="Gauche">◀</button>
        <button class="mp-dir" data-dir="1" aria-label="Droite">▶</button>
      </div>
      <button class="mp-fire" id="mp-fire" aria-label="Tirer">TIR</button>
    </div>`;

    const $ = (id) => document.getElementById(id);
    const ui = $('mp');
    const msg = (t) => { $('mp-msg').textContent = t; };
    const HAPTICS = { hit: 15, hurt: [60, 40, 60], power: [20, 30, 20], win: [200, 100, 200, 100, 400], lose: [300] };
    const vibrate = (p) => { try { navigator.vibrate?.(p); } catch {} };
    const STATES = {
      coin: 'Le joueur se connecte sur la borne avec son compte Capsule',
      start: 'Appuyez sur JOUER sur la borne !',
      play: '',
      pause: 'PAUSE · appuyez sur TIR pour reprendre',
      end: 'Partie terminée · joueur suivant sur la borne',
    };

    let peer = null;
    let conn = null;
    let retry = null;
    const st = { x: 0, fire: false };

    const send = (m) => { if (conn?.open) { try { conn.send(m); } catch {} } };
    const sendState = () => send({ t: 'in', x: st.x, fire: st.fire });
    setInterval(sendState, 400); // battement de cœur : la borne relâche tout si le téléphone se tait

    function setOnline(on, text) {
      ui.classList.toggle('on', on);
      ui.classList.toggle('off', !on);
      $('mp-dot').textContent = on ? 'CONNECTÉ' : 'HORS LIGNE';
      if (text !== undefined) msg(text);
      if (!on) $('mp-hud').textContent = '';
    }

    function askCode() {
      $('mp-form').hidden = false;
      msg('');
      setOnline(false, '');
      $('mp-code').value = code || '';
    }

    function scheduleRetry(text) {
      setOnline(false, text);
      clearTimeout(retry);
      retry = setTimeout(connect, 3000);
    }

    function connect() {
      clearTimeout(retry);
      if (code.length !== 5) { askCode(); return; }
      $('mp-form').hidden = true;
      $('mp-change').textContent = `CODE ${code}`;
      msg('Connexion à la borne…');
      loadPeer().then(() => {
        if (!peer || peer.destroyed) {
          peer = new window.Peer(PEER_OPTS);
          peer.on('error', (e) => {
            if (e.type === 'peer-unavailable') { scheduleRetry('Borne introuvable : vérifiez que la page de jeu est ouverte sur l’iPad (et le code).'); return; }
            try { peer.destroy(); } catch {}
            scheduleRetry('Réseau indisponible, nouvelle tentative…');
          });
          peer.on('disconnected', () => { if (!peer.destroyed) peer.reconnect(); });
        }
        const go = () => {
          try { conn?.close(); } catch {}
          const c = peer.connect(peerId(code), { reliable: true, serialization: 'json' });
          conn = c;
          const opened = setTimeout(() => { if (conn === c && !c.open) { try { c.close(); } catch {} scheduleRetry('La borne ne répond pas, nouvelle tentative…'); } }, 10000);
          c.on('open', () => { clearTimeout(opened); setOnline(true, STATES.coin); wakeLock(); sendState(); vibrate(30); });
          c.on('data', (m) => {
            if (!m) return;
            if (m.t === 'busy') { conn = null; setOnline(false, 'Une autre manette est déjà connectée à la borne.'); clearTimeout(retry); retry = setTimeout(connect, 5000); return; }
            if (m.t === 'st') { msg(STATES[m.s] ?? ''); if (m.s !== 'play') $('mp-hud').textContent = ''; }
            if (m.haptic) vibrate(HAPTICS[m.haptic] || 20);
            if (m.hud) $('mp-hud').textContent = `SCORE ${String(m.hud.score).padStart(6, '0')}  ${'♥'.repeat(Math.max(0, m.hud.lives))}`;
          });
          c.on('close', () => { if (conn === c) { conn = null; scheduleRetry('Connexion perdue, reconnexion…'); } });
          c.on('error', () => { if (conn === c) { conn = null; scheduleRetry('Connexion perdue, reconnexion…'); } });
        };
        if (peer.open) go(); else peer.once('open', go);
      }).catch(() => scheduleRetry('Chargement impossible : vérifiez la connexion Internet du téléphone.'));
    }

    // Écran toujours allumé pendant le salon
    let lock = null;
    async function wakeLock() { try { if (!lock && navigator.wakeLock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch {} }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { st.x = 0; st.fire = false; sendState(); return; }
      wakeLock();
      if (!conn?.open) connect();
    });

    $('mp-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const c = cleanCode($('mp-code').value);
      if (c.length !== 5) { $('mp-code').focus(); return; }
      code = c;
      store.set(CODE_KEY, code);
      $('mp-code').blur();
      connect();
    });
    $('mp-change').addEventListener('click', () => { try { conn?.close(); } catch {} conn = null; clearTimeout(retry); askCode(); $('mp-code').focus(); });
    $('mp-pause').addEventListener('click', () => send({ t: 'act', a: 'pause' }));
    // Mode gaucher : TIR à gauche, ◀ ▶ à droite (mémorisé sur le téléphone)
    const setHand = (lefty) => {
      ui.classList.toggle('lefty', lefty);
      $('mp-hand').textContent = lefty ? 'DROITIER' : 'GAUCHER';
      $('mp-hand').setAttribute('aria-pressed', String(lefty));
      store.set('orthoPadLefty', lefty ? '1' : '');
    };
    setHand(store.get('orthoPadLefty') === '1');
    $('mp-hand').addEventListener('click', () => setHand(!ui.classList.contains('lefty')));

    const held = new Map();
    const upd = () => {
      const d = [...held.values()];
      st.x = d.length ? d[d.length - 1] : 0;
      root.querySelectorAll('.mp-dir').forEach((b) => b.classList.toggle('down', d.includes(+b.dataset.dir)));
      sendState();
    };
    root.querySelectorAll('.mp-dir').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture?.(e.pointerId); held.set(e.pointerId, +btn.dataset.dir); vibrate(8); upd(); });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, (e) => { held.delete(e.pointerId); upd(); });
    });
    const fire = $('mp-fire');
    fire.addEventListener('pointerdown', (e) => {
      e.preventDefault(); fire.setPointerCapture?.(e.pointerId);
      st.fire = true; fire.classList.add('down'); vibrate(10);
      sendState(); send({ t: 'act', a: 'fire' });
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) fire.addEventListener(ev, () => { st.fire = false; fire.classList.remove('down'); sendState(); });
    root.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());

    connect();
  }

  window.__orthoPad = { screen, phone };
})();

// Ortho Invaders — la page capsule-med.com/pages/ortho-invaders EST la borne d'arcade (plein écran).
// Non connecté : « INSERT COIN » → inscription ou connexion Capsule dans l'écran de la borne
// (formulaires natifs Shopify, comptes classiques). Connecté : on joue directement.
// Victoire : formulaire de contact natif → l'équipe crée le code 100 % lié au compte du gagnant.
(function () {
  const root = document.getElementById('capsule-arcade');
  if (!root) return;
  // Téléphone du stand : ?manette → la page devient la manette de la borne (voir pad-link.js)
  const qsPad = new URLSearchParams(location.search);
  if (qsPad.has('manette') && window.__orthoPad) { window.__orthoPad.phone(root, qsPad.get('manette')); return; }
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
  // Mode téléphone-manette (iPad du stand) : ?borne&serveur=https://…&cle=… une seule fois, mémorisé ;
  // ?local revient au jeu tactile sur la tablette.
  const qs = new URLSearchParams(location.search);
  let REMOTE = null;
  try {
    if (qs.has('local')) localStorage.removeItem('orthoRemote');
    if (qs.get('serveur')) localStorage.setItem('orthoRemote', JSON.stringify({ server: qs.get('serveur').replace(/\/$/, ''), key: qs.get('cle') || '' }));
    REMOTE = STAND ? JSON.parse(localStorage.getItem('orthoRemote') || 'null') : null;
  } catch {}
  // Fonction de tag (Supabase capsule) : appelée sans clé, elle fait ses propres contrôles
  // (origine capsule-med.com, identifiant numérique, tags jeuJO uniquement).
  const TAG_URL = 'https://qyibpvgbxxdilaewiyys.supabase.co/functions/v1/ortho-jeu-tag';
  const RULES = root.dataset.rules || '/pages/reglements-jeux-jo-2025';
  const REWARDS = [
    { id: 'biomecanique', speaker: 'Dr Skander Ellouze', title: 'Replay Biomécanique : maîtriser les clés de l’excellence en orthodontie' },
    { id: 'contentions', speaker: 'Dr Philippides', title: 'Replay Adieu les urgences : maîtriser le collage des contentions' },
  ];
  const WON_KEY = `orthoInvadersWon:${customerId}`;
  const PLAYED_KEY = `orthoInvadersPlayed:${customerId}`; // une seule partie par participant
  // Comptes de test Capsule (identifiants clients Shopify) : parties illimitées, pas de déconnexion auto
  const TESTERS = ['23773949821273', '23276575129945', '23130642612569'];
  const TESTER = logged && TESTERS.includes(String(customerId));
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
  .ca-pad{display:none;width:min(100%,420px);grid-template-columns:1fr 1fr 1.1fr;gap:10px;height:clamp(64px,9vh,110px);touch-action:none;user-select:none;-webkit-user-select:none}
  .ca.touch.logged .ca-pad{display:grid}
  .ca.touch .ca-keys{display:none}
  .ca-pad button{touch-action:none;border:0;color:#fff;font-family:'Press Start 2P',monospace;-webkit-tap-highlight-color:transparent}
  .ca-dir{background:#1f0b4a;border:3px solid var(--c)!important;font-size:20px;box-shadow:0 4px 0 #178a8d}
  .ca-dir.down{background:#2a1566;transform:translateY(3px)}
  .ca-fire{border-radius:50%;aspect-ratio:1;justify-self:center;height:100%;font-size:11px;
    background:radial-gradient(circle at 35% 30%,#ff7ba3,var(--m) 55%,#8f0f3a);box-shadow:0 6px 0 #6d0a2c,0 0 24px var(--m)}
  .ca-fire.down{transform:translateY(4px)}
  /* En partie : on libère un max de place pour l'écran de jeu */
  .ca.paired .ca-pad{display:none!important}
  .ca-bar .ca-padcode{color:#2de2e6}
  .ca.playing{gap:.6vh}
  .ca.playing .ca-bar{display:none}
  .ca.playing .ca-head{gap:0;padding:max(.6vh,env(safe-area-inset-top)) 16px .6vh}
  .ca.playing .ca-head .b,.ca.playing .ca-head .s,.ca.playing .ca-head::before{display:none}
  .ca.playing .ca-head .t{font-size:clamp(12px,min(2.2vh,4vw),30px)}
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
          <button type="button" class="ca-btn ca-retry" hidden>↻ Rejouer (compte test)</button>
        </div></div>

        <div class="ca-ov" id="ca-sent" hidden><div class="ca-card">
          <p class="ca-t big">★ BRAVO ★</p>
          <p class="ca-p">Votre victoire est enregistrée. L'équipe Capsule crée votre code personnel (100 %, usage unique, lié à votre compte) et vous l'envoie par email. Sur le stand : présentez cet écran.</p>
          <p class="ca-p ca-count" id="ca-sent-count"></p>
          <a class="ca-btn alt ca-next" href="#">▶ Joueur suivant</a>
          <button type="button" class="ca-btn ca-retry" hidden>↻ Rejouer (compte test)</button>
        </div></div>

        <div class="ca-ov" id="ca-done" hidden><div class="ca-card">
          <p class="ca-t big">PARTIE<br>JOUÉE</p>
          <p class="ca-p">Vous avez déjà joué votre partie : <b>une partie par participant</b>. Merci et à bientôt sur Capsule !</p>
          <p class="ca-p ca-count" id="ca-done-count"></p>
          <a class="ca-btn alt ca-next" href="#">▶ Joueur suivant</a>
        </div></div>

        <!-- Mode téléphone-manette -->
        <div class="ca-ov" id="ca-r-attract" hidden><div class="ca-card">
          <p class="ca-t big ca-blink">SCANNEZ<br>POUR JOUER</p>
          <img id="ca-r-qr" alt="QR code pour jouer avec votre téléphone" style="width:52cqw;justify-self:center;image-rendering:pixelated;border:2cqw solid #fff;box-shadow:0 0 0 1cqw var(--m),0 0 8cqw var(--m)">
          <p class="ca-p">Votre téléphone devient la manette. Connectez-vous avec votre compte Capsule, ou créez-le en 30 s.</p>
          <p class="ca-h">★ À GAGNER ★</p>
          <div class="ca-prizes">${prizeCards}</div>
          <p class="ca-count" id="ca-r-queue"></p>
        </div></div>
        <div class="ca-ov" id="ca-r-ready" hidden><div class="ca-card">
          <p class="ca-p">AU TOUR DE</p>
          <p class="ca-t big" id="ca-r-name"></p>
          <p class="ca-t ca-blink">▶ START<br>SUR VOTRE TÉLÉPHONE</p>
          <p class="ca-count" id="ca-r-count"></p>
        </div></div>
        <div class="ca-ov" id="ca-r-winner" hidden><div class="ca-card">
          <p class="ca-t big">★ GAGNANT ★</p>
          <p class="ca-t" id="ca-r-wname" style="color:var(--c)"></p>
          <p class="ca-p" id="ca-r-wwhat"></p>
        </div></div>
        <div class="ca-ov" id="ca-r-off" hidden><div class="ca-card">
          <p class="ca-t">CONNEXION<br>À LA BORNE…</p>
          <p class="ca-p" id="ca-r-err">Vérifiez le Wi-Fi de la tablette.</p>
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
      ${TESTER ? '<span style="color:#ffd319">★ COMPTE TEST · PARTIES ILLIMITÉES</span>' : ''}
      <span class="ca-padcode" id="ca-pad-code" hidden></span>
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

  const overlays = ['ca-coin', 'ca-register', 'ca-login', 'ca-start', 'ca-end', 'ca-sent', 'ca-done', 'ca-pause', 'ca-r-attract', 'ca-r-ready', 'ca-r-winner', 'ca-r-off'];
  const PAD_STATES = { 'ca-pause': 'pause', 'ca-start': 'start', 'ca-end': 'end', 'ca-sent': 'end', 'ca-done': 'end' };
  let padState = 'coin';
  const show = (id) => {
    overlays.forEach((o) => { $(o).hidden = o !== id; });
    root.querySelector('.ca').classList.toggle('playing', id === null || id === 'ca-pause');
    padState = id === null ? 'play' : PAD_STATES[id] || 'coin';
    pad?.send({ t: 'st', s: padState });
  };

  // ── Manette du stand : un téléphone Capsule dédié, relié en direct à l'iPad (?borne) ──
  const padActions = {};
  let pad = null;
  if (STAND && !REMOTE && window.__orthoPad) {
    const ca = root.querySelector('.ca');
    pad = window.__orthoPad.screen({
      onInput: (s) => window.Game?.setRemote(s),
      onAction: (a) => padActions[a]?.(),
      onStatus: (on) => {
        ca.classList.toggle('paired', on);
        $('ca-pad-code').hidden = on; // le code n'est affiché que tant qu'aucune manette n'est reliée
        setTimeout(() => window.Game?.fit?.(), 50);
        if (on) pad.send({ t: 'st', s: padState });
      },
    });
    $('ca-pad-code').textContent = `MANETTE : CODE ${pad.code}`;
    $('ca-pad-code').hidden = false;
  }
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

  if (REMOTE) { startRemote(); return; }

  // ── iPad = écran de la borne, le téléphone du visiteur = manette (serveur temps réel) ──
  function startRemote() {
    const ca = root.querySelector('.ca');
    ca.classList.remove('logged');               // pas de manette tactile sur l'iPad
    root.querySelectorAll('.ca-bar a[href*="logout"]').forEach((a) => a.remove());
    show('ca-r-off');
    let current = null;
    let readyTimer = null;
    let winnerTimer = null;
    const script = document.createElement('script');
    script.src = `${REMOTE.server}/socket.io/socket.io.js`;
    script.onerror = () => { $('ca-r-err').textContent = 'Serveur de la borne injoignable. Vérifiez le Wi-Fi, ou ouvrez la page avec ?local pour jouer sur la tablette.'; };
    script.onload = () => {
      let room = '';
      try { room = localStorage.getItem('orthoRemoteRoom') || ''; } catch {}
      const socket = io(REMOTE.server, { auth: { role: 'screen', key: REMOTE.key, room } });
      const backToAttract = () => { if (current) return; Game.stop(); show('ca-r-attract'); };

      socket.on('connect_error', () => show('ca-r-off'));
      socket.on('fatal', (msg) => { $('ca-r-err').textContent = msg; show('ca-r-off'); });
      socket.on('room', ({ code, qr }) => {
        try { localStorage.setItem('orthoRemoteRoom', code); } catch {}
        $('ca-r-qr').src = qr;
        if (!current && Game.mode === 'attract') show('ca-r-attract');
      });
      socket.on('queue', ({ queue, current: cur, prizesLeft }) => {
        const next = queue.length ? `PROCHAIN : ${esc(queue[0]).toUpperCase()}${queue.length > 1 ? ` +${queue.length - 1}` : ''}` : 'PERSONNE EN ATTENTE';
        $('ca-r-queue').innerHTML = `${cur ? `EN JEU : ${esc(cur).toUpperCase()}<br>` : ''}${next}<br>${prizesLeft} REPLAYS À GAGNER`;
      });
      socket.on('game:ready', ({ gameId, name }) => {
        current = { gameId, name };
        Game.stop();
        $('ca-r-name').textContent = name.toUpperCase();
        show('ca-r-ready');
        let left = 30;
        clearInterval(readyTimer);
        $('ca-r-count').textContent = `${left} S`;
        readyTimer = setInterval(() => { left -= 1; $('ca-r-count').textContent = `${Math.max(0, left)} S`; }, 1000);
        try { Sfx.coin(); } catch {}
      });
      socket.on('game:start', ({ gameId, name }) => {
        if (!current || current.gameId !== gameId) return;
        clearInterval(readyTimer);
        show(null);
        Game.start({
          name,
          onFeedback: (data) => socket.emit('feedback', data),
          onEnd: (result) => {
            socket.emit('game:over', { gameId, ...result });
            current = null;
            setTimeout(backToAttract, 5000);
          },
        });
      });
      socket.on('game:cancel', () => { current = null; clearInterval(readyTimer); backToAttract(); });
      socket.on('input', (state) => Game.setRemote(state));
      socket.on('winner', ({ name, reward, speaker }) => {
        $('ca-r-wname').textContent = name.toUpperCase();
        $('ca-r-wwhat').textContent = `remporte « ${reward.replace(/^Replay —\s*/, '')} » · ${speaker}`;
        show('ca-r-winner');
        try { Sfx.win(); } catch {}
        clearTimeout(winnerTimer);
        winnerTimer = setTimeout(() => { if (!current) show('ca-r-attract'); }, 7000);
      });
    };
    document.body.appendChild(script);
    // Le son se débloque au premier toucher de l'équipe sur l'iPad
    root.addEventListener('pointerdown', () => { try { Sfx.unlock(); } catch {} }, { once: true });
  }

  // ── Tag Shopify de chaque praticien connecté à la borne (nouvel inscrit ou compte existant) ──
  // Fonction Edge Supabase capsule « ortho-jeu-tag » : ajoute jeuJO, jeuJO-2026 et
  // jeuJO-inscrit / jeuJO-compte-existant. Une fois par session d'onglet et par compte.
  // Comptes de test capsule exclus : ils ne faussent pas les statistiques jeuJO.
  if (logged && !TESTER) {
    const TAGGED_KEY = `orthoTagged:${customerId}`;
    let done = false;
    try { done = sessionStorage.getItem(TAGGED_KEY) === '1'; } catch {}
    if (!done) {
      fetch(TAG_URL, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: String(customerId) }),
      }).then((r) => { if (r.ok) { try { sessionStorage.setItem(TAGGED_KEY, '1'); } catch {} } }).catch(() => {});
    }
  }

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
    if (TESTER) { $(elId).textContent = 'Compte test : pas de déconnexion automatique'; return; }
    let left = seconds;
    const tick = () => {
      $(elId).textContent = `${label} dans ${left} s`;
      if (left-- <= 0) { clearInterval(countdown); location.href = LOGOUT_URL; }
    };
    tick();
    countdown = setInterval(tick, 1000);
  }

  const posted = new URLSearchParams(location.search).get('contact_posted') === 'true';
  if (posted && (store.get(WON_KEY) || (TESTER && store.get('orthoInvadersTestSent')))) {
    show('ca-sent');
    logoutIn(20, 'ca-sent-count', 'Déconnexion automatique');
  } else if (store.get(PLAYED_KEY) && !TESTER) {
    show('ca-done');
    logoutIn(10, 'ca-done-count', 'Déconnexion automatique');
  } else {
    show('ca-start');
  }

  function play() {
    if (!TESTER) {
      if (store.get(PLAYED_KEY)) { show('ca-done'); logoutIn(10, 'ca-done-count', 'Déconnexion automatique'); return; }
      store.set(PLAYED_KEY, String(Date.now()));
    }
    Sfx.unlock();
    show(null);
    document.activeElement?.blur?.();
    startedAt = Date.now();
    Game.start({ name: 'DOCTEUR', onEnd: end, onFeedback: (d) => pad?.send({ t: 'fb', ...d }) });
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
      TESTER ? '[COMPTE TEST — ne pas créer de code]' : 'NOUVEAU GAGNANT — ORTHO INVADERS',
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
    if (!TESTER) store.set(WON_KEY, reward.id);
    else store.set(`orthoInvadersTestSent`, '1');
    clearInterval(countdown);
  });

  $('ca-play').addEventListener('click', play);
  root.querySelectorAll('.ca-retry').forEach((b) => { b.hidden = !TESTER; b.addEventListener('click', play); });

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
  const resume = () => { show(null); Game.paused = false; };
  $('ca-resume').addEventListener('click', resume);
  // Manette du stand : TIR reprend après une pause, PAUSE bascule. Le lancement reste sur l'iPad (JOUER),
  // ce premier toucher débloquant le son et le plein écran.
  padActions.fire = () => { if (Game.paused) resume(); };
  padActions.pause = () => { if (Game.paused) resume(); else pause(); };

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
