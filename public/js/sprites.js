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
