// Pixel art de ORTHO INVADERS — chaque caractère = 1 pixel, '.' = transparent.
(function () {
  const PALETTE = {
    k: '#12062e', // contour
    w: '#ffffff',
    W: '#dcd6f7', // ombre blanc
    c: '#2de2e6', C: '#128c9e', // cyan
    m: '#ff2a6d', M: '#b3124a', // magenta
    y: '#ffd319', Y: '#e08a00', // jaune
    o: '#ff901f',
    g: '#6bff5c', G: '#1f9e3a', // vert bactérie
    p: '#ff7bd5', P: '#c2188f', // rose bonbon
    b: '#3a86ff', B: '#1d3fa8', // bleu
    r: '#ff3b3b', R: '#8f0f1f', // rouge
    s: '#b8b8c8', S: '#6c6c80', // métal bracket
    n: '#5a3a1e', N: '#2b1a0c', // carie brune
    v: '#9d4edd',
  };

  const DEFS = {
    // Vaisseau : une capsule mi-magenta mi-cyan avec son canon.
    player: [
      '.......w.......',
      '......kwk......',
      '......kwk......',
      '..kkkkkwkkkkk..',
      '.kmmmmmwccccck.',
      'kmwwmmmwcccccck',
      'kmmmmmmwcccccck',
      'kMMMMMMwCCCCCCk',
      '.kMMMMMwCCCCCk.',
      '..kkkkkkkkkkk..',
    ],
    // Bactérie (10 pts)
    bact1: [
      '...kkkkk...',
      '..kgggggk..',
      '.kgwkgwkgk.',
      'kgggggggggk',
      'kgGgkkkgGgk',
      '.kgggggggk.',
      'k.k.k.k.k.k',
      '.k.k.k.k.k.',
    ],
    bact2: [
      '...kkkkk...',
      '..kgggggk..',
      '.kgkwgkwgk.',
      'kgggggggggk',
      'kgGgkkkgGgk',
      '.kgggggggk.',
      '.k.k.k.k.k.',
      'k.k.k.k.k.k',
    ],
    // Plaque dentaire (20 pts)
    plaq1: [
      '..k.kkk.k..',
      '.kykyyykyk.',
      'kyyyyyyyyyk',
      'kyrkyyyrkyk',
      'kyyyyyyyyyk',
      'kYyykkkyyYk',
      '.kYyyyyyYk.',
      'kk.kk.kk.kk',
    ],
    plaq2: [
      '..k.kkk.k..',
      '.kykyyykyk.',
      'kyyyyyyyyyk',
      'kykryyykryk',
      'kyyyyyyyyyk',
      'kYyykkkyyYk',
      '.kYyyyyyYk.',
      '.kk.kk.kk..',
    ],
    // Bonbon sucré (30 pts)
    candy1: [
      'kk.......kk',
      'kpk.kkk.kpk',
      'kppkpwppkpk',
      '.kkpPppPkk.',
      'kppkpkpkppk',
      'kpk.kkk.kpk',
      'kk.......kk',
      '...........',
    ],
    candy2: [
      '...........',
      'kk.......kk',
      'kpk.kkk.kpk',
      'kppkpwppkpk',
      '.kkpPppPkk.',
      'kppkpkpkppk',
      'kpk.kkk.kpk',
      'kk.......kk',
    ],
    // Dent (bouclier destructible)
    tooth: [
      '....kkkk......kkkk....',
      '..kkwwwwkk..kkwwwwkk..',
      '.kwwwwwwwwkkwwwwwwwwk.',
      'kwwwwwwwwwwwwwwwwwwwWk',
      'kwwwwwwwwwwwwwwwwwwwWk',
      'kwwwwwwwwwwwwwwwwwwWWk',
      'kwwwsssssssssssswwwWWk',
      'kwwwsSkkSSSSkkSswwwWWk',
      'kwwwsssssssssssswwwWWk',
      '.kwwwwwwwwwwwwwwwwWWk.',
      '.kwwwwwwwwwwwwwwwwWWk.',
      '..kwwwwwwkkwwwwwwWWk..',
      '..kwwwwwk..kwwwwwWk...',
      '...kwwwwk..kwwwwWk....',
      '...kwwwk....kwwwWk....',
      '....kkk......kkkk.....',
    ],
    // Bonus
    pu_bracket: [ // tir triple
      'kkkkkkk',
      'ksssssk',
      'kskkksk',
      'kkkkkkk',
      'kskkksk',
      'ksssssk',
      'kkkkkkk',
    ],
    pu_elastic: [ // tir rapide
      '.kkkkk.',
      'kpppppk',
      'kpk.kpk',
      'kpk.kpk',
      'kpk.kpk',
      'kpppppk',
      '.kkkkk.',
    ],
    pu_fluor: [ // bouclier
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
    shot: ['w', 'c', 'c', 'C'],
    acid: ['.g.', 'ggg', 'gGg', '.G.'],
    goo: ['.mm.', 'mwpm', 'mppm', '.MM.'],
  };

  function render(rows, scale = 1) {
    const w = Math.max(...rows.map((r) => r.length));
    const h = rows.length;
    const cv = document.createElement('canvas');
    cv.width = w * scale;
    cv.height = h * scale;
    const ctx = cv.getContext('2d');
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.' || !PALETTE[ch]) return;
        ctx.fillStyle = PALETTE[ch];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      });
    });
    return cv;
  }

  // Version blanche (flash quand touché)
  function flash(cv) {
    const f = document.createElement('canvas');
    f.width = cv.width;
    f.height = cv.height;
    const ctx = f.getContext('2d');
    ctx.drawImage(cv, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, f.width, f.height);
    return f;
  }

  // Boss « MÉGA-CARIE » : généré procéduralement (48×34)
  function renderBoss(frame) {
    const W = 48, H = 34;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const px = (x, y, c) => { ctx.fillStyle = PALETTE[c]; ctx.fillRect(x, y, 1, 1); };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2);
        const wob = 0.08 * Math.sin(x * 0.9 + frame * 2) + 0.06 * Math.cos(y * 1.3);
        const d = dx * dx + dy * dy;
        if (d < 0.92 + wob) px(x, y, d > 0.78 + wob ? 'k' : ((x * 7 + y * 3) % 11 === 0 ? 'N' : 'n'));
      }
    }
    // Couronne
    for (let i = 0; i < 5; i++) {
      const cx = 12 + i * 6;
      for (let h = 0; h < 5; h++) for (let w = -h; w <= h; w++) if (h < 4 - Math.abs(w)) px(cx + w, 1 + h, h === 0 ? 'k' : 'y');
    }
    // Yeux
    for (const ex of [15, 29]) {
      for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) px(ex + x, 11 + y, (x === 0 || y === 0 || x === 5 || y === 5) ? 'k' : 'r');
      px(ex + 2 + (frame % 2), 13, 'w'); px(ex + 3 + (frame % 2), 13, 'w');
    }
    // Bouche + crocs
    for (let x = 14; x < 35; x++) { px(x, 22, 'k'); px(x, 23, 'R'); px(x, 24, 'R'); px(x, 25, 'k'); }
    for (let x = 16; x < 34; x += 4) { px(x, 23, 'w'); px(x + 1, 23, 'w'); px(x, 24, 'W'); }
    return cv;
  }

  window.Sprites = {
    PALETTE,
    load() {
      const s = {};
      for (const [k, rows] of Object.entries(DEFS)) {
        s[k] = render(rows);
        s[k + '_flash'] = flash(s[k]);
      }
      s.boss = [renderBoss(0), renderBoss(1)];
      s.boss_flash = s.boss.map(flash);
      s.toothRows = DEFS.tooth;
      return s;
    },
  };
})();
