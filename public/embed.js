// Intégration du jeu dans la page capsule-med.com/pages/ortho-invaders.
// <div id="capsule-arcade" data-customer-id="…"></div>
// <script src="https://<serveur-arcade>/embed.js" defer></script>
(function () {
  const script = document.currentScript;
  const API = new URL(script.src).origin;
  const root = document.getElementById('capsule-arcade');
  if (!root) return;

  const customerId = root.dataset.customerId
    || window.ShopifyAnalytics?.meta?.page?.customerId
    || window.__st?.cid;
  if (!customerId) return; // la page affiche l'inscription / connexion

  for (const f of ['press-start-2p', 'vt323']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `${API}/fonts/${f}/index.css`;
    document.head.appendChild(l);
  }

  const css = `
  .ca{--c:#2de2e6;--m:#ff2a6d;--y:#ffd319;--v:#9d4edd;--ink:#f5f3ff;--dim:#b9a8e8;--bg:#12062e;
    font-family:'VT323',ui-monospace,monospace;color:var(--ink);display:grid;gap:12px;justify-items:center}
  .ca *{box-sizing:border-box}
  .ca [hidden]{display:none!important}
  #capsule-arcade .ca-btn{color:#12062e}
  .ca-stage{width:100%;height:min(80vh,760px);display:grid;place-items:center}
  .ca-screen{position:relative;line-height:0;border-radius:12px;overflow:hidden;
    box-shadow:0 0 0 3px #05010f,0 0 0 6px var(--v),0 0 36px rgba(157,78,221,.6)}
  .ca-screen canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges;filter:saturate(1.15) contrast(1.05)}
  .ca-crt{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;
    background:repeating-linear-gradient(180deg,rgba(0,0,0,.28) 0 calc(var(--px,4px)*.32),transparent calc(var(--px,4px)*.32) var(--px,4px)),
    radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(0,0,0,.55) 100%)}
  .ca-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:6%;
    background:rgba(8,2,28,.86);line-height:normal;container-type:inline-size;overflow:auto;z-index:2}
  .ca-ov[hidden]{display:none}
  .ca-card{width:100%;display:grid;gap:4cqw;text-align:center}
  .ca-t{font-family:'Press Start 2P',monospace;font-size:6.4cqw;line-height:1.4;color:var(--y);text-shadow:.12em .12em 0 var(--m);margin:0}
  .ca-p{font-size:5.4cqw;line-height:1.05;color:var(--dim);margin:0}
  .ca-p b{color:var(--y);font-weight:normal}
  .ca-btn{font-family:'Press Start 2P',monospace;font-size:4.2cqw;text-transform:uppercase;border:0;cursor:pointer;
    padding:4.4cqw;background:var(--y);color:var(--bg);box-shadow:0 5px 0 #b8860b;text-decoration:none;display:block}
  .ca-btn.alt{background:var(--c);box-shadow:0 5px 0 #178a8d}
  .ca-btn:focus-visible,.ca-rw:focus-visible{outline:3px solid var(--c);outline-offset:3px}
  .ca-rw{font:inherit;color:var(--ink);background:var(--bg);border:3px solid var(--m);padding:3cqw;cursor:pointer;text-align:left;display:grid;gap:1.4cqw}
  .ca-rw .w{font-family:'Press Start 2P',monospace;font-size:3cqw;color:var(--y);line-height:1.5}
  .ca-rw .t{font-size:5.4cqw;line-height:1}
  .ca-code{font-family:'Press Start 2P',monospace;font-size:6cqw;padding:4cqw;border:3px dashed var(--y);color:var(--y);word-break:break-all}
  .ca-pad{display:none;width:min(100%,520px);grid-template-columns:1fr 1fr 1.25fr;gap:10px;height:120px;touch-action:none;user-select:none;-webkit-user-select:none}
  .ca.touch .ca-pad{display:grid}
  .ca.touch .ca-keys{display:none}
  .ca-pad button{touch-action:none;border:0;color:#fff;font-family:'Press Start 2P',monospace;-webkit-tap-highlight-color:transparent}
  .ca-dir{background:#1f0b4a;border:4px solid var(--c)!important;font-size:24px}
  .ca-dir.down{background:#2a1566}
  .ca-fire{border-radius:50%;aspect-ratio:1;justify-self:center;height:100%;font-size:13px;
    background:radial-gradient(circle at 35% 30%,#ff7ba3,var(--m) 55%,#8f0f3a);box-shadow:0 0 24px var(--m)}
  .ca-fire.down{transform:translateY(3px)}
  .ca-keys{font-family:'Press Start 2P',monospace;font-size:10px;color:#6b5a9e;margin:0;text-align:center;line-height:1.8}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  root.innerHTML = `
  <div class="ca">
    <div class="ca-stage" data-fit>
      <div class="ca-screen">
        <canvas id="game" width="216" height="336" aria-label="Ortho Invaders"></canvas>
        <div class="ca-crt" aria-hidden="true"></div>
        <div class="ca-ov" id="ca-start"><div class="ca-card">
          <p class="ca-t" id="ca-hello">CHARGEMENT…</p>
          <p class="ca-p" id="ca-sub"></p>
          <div id="ca-prev" hidden><div class="ca-code" id="ca-prev-code"></div></div>
          <button class="ca-btn" id="ca-play" hidden>▶ Jouer</button>
        </div></div>
        <div class="ca-ov" id="ca-end" hidden><div class="ca-card">
          <p class="ca-t" id="ca-end-t"></p>
          <p class="ca-p" id="ca-end-p"></p>
          <div class="ca-card" id="ca-rws" hidden></div>
          <div id="ca-code-box" hidden>
            <div class="ca-code" id="ca-code"></div>
            <p class="ca-p" style="margin-top:3cqw">Code à usage unique, réservé à votre compte Capsule.</p>
            <a class="ca-btn" id="ca-use" style="margin-top:3cqw" target="_top">Récupérer ma formation</a>
          </div>
          <p class="ca-p" id="ca-err" style="color:var(--m)"></p>
          <button class="ca-btn alt" id="ca-again">↻ Rejouer</button>
        </div></div>
        <div class="ca-ov" id="ca-pause" hidden><div class="ca-card">
          <p class="ca-t">PAUSE</p>
          <button class="ca-btn" id="ca-resume">▶ Reprendre</button>
        </div></div>
      </div>
    </div>
    <div class="ca-pad" aria-label="Manette tactile">
      <button class="ca-dir" data-dir="-1" aria-label="Gauche">◀</button>
      <button class="ca-dir" data-dir="1" aria-label="Droite">▶</button>
      <button class="ca-fire" id="ca-fire" aria-label="Tirer">TIR</button>
    </div>
    <p class="ca-keys">← → BOUGER · ESPACE TIRER · P PAUSE</p>
  </div>`;

  const $ = (id) => document.getElementById(id);
  const ca = root.querySelector('.ca');
  if (matchMedia('(pointer: coarse)').matches) ca.classList.add('touch');
  const post = (path, body) => fetch(`${API}/api/web/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, ...body }),
  }).then((r) => r.json());
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const short = (t) => t.replace(/^Replay —\s*/, '');

  let me = null;
  let gameId = null;

  function loadScript(src) {
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = ko;
      document.body.appendChild(s);
    });
  }

  function show(id) {
    for (const o of ['ca-start', 'ca-end', 'ca-pause']) $(o).hidden = o !== id;
  }

  function showCode(rec) {
    $('ca-code-box').hidden = false;
    $('ca-code').textContent = rec.code;
    $('ca-use').href = rec.url;
  }

  async function boot() {
    try {
      me = await post('hello', {});
      if (me.error) throw new Error(me.error);
      await loadScript(`${API}/js/sprites.js`);
      await loadScript(`${API}/js/audio.js`);
      await loadScript(`${API}/js/game.js`);
    } catch (err) {
      $('ca-hello').textContent = 'BIENTÔT !';
      $('ca-sub').textContent = err.message && !/fetch|load/i.test(err.message)
        ? err.message
        : 'Le jeu ouvre pendant les Journées Orthodontie. Revenez vite, ou jouez sur le stand Capsule !';
      return;
    }
    $('ca-hello').textContent = `BONJOUR ${me.name.toUpperCase()} !`;
    if (me.previous) {
      $('ca-sub').innerHTML = `Vous avez déjà gagné <b>${esc(short(me.previous.rewardTitle))}</b>. Votre code :`;
      $('ca-prev').hidden = false;
      $('ca-prev-code').textContent = me.previous.code;
    } else {
      $('ca-sub').innerHTML = `Battez la <b>Méga-Carie</b> et choisissez votre replay offert. Encore <b>${me.prizesLeft}</b> replays à gagner.`;
    }
    $('ca-play').hidden = false;
  }

  async function play() {
    Sfx.unlock();
    show(null);
    document.activeElement?.blur?.();
    try {
      const r = await post('start', {});
      gameId = r.gameId;
    } catch { gameId = null; }
    Game.start({ name: me.name, onEnd: end });
  }

  async function end({ won, score, wave }) {
    show('ca-end');
    $('ca-rws').hidden = true;
    $('ca-code-box').hidden = true;
    $('ca-err').textContent = '';
    $('ca-end-t').textContent = won ? '★ VICTOIRE ★' : 'GAME OVER';
    $('ca-end-p').textContent = won ? 'Validation de votre victoire…' : `${score} points. La Méga-Carie a gagné cette manche… retentez votre chance !`;
    if (!gameId) return;
    let r;
    try { r = await post('end', { gameId, won, score, wave }); } catch { r = { error: true }; }
    if (!won) return;
    if (r.eligible) {
      $('ca-end-p').textContent = `Bravo ! ${score} points. Choisissez votre replay offert :`;
      $('ca-rws').innerHTML = me.rewards.map((rw) => `<button class="ca-rw" data-id="${rw.id}"><span class="w">${esc(rw.speaker.toUpperCase())}</span><span class="t">${esc(short(rw.title))}</span></button>`).join('');
      $('ca-rws').hidden = false;
      $('ca-rws').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => claim(b.dataset.id)));
    } else if (r.reason === 'already') {
      $('ca-end-p').textContent = 'Encore gagné ! Un seul replay par compte, voici votre code :';
      if (r.previous) showCode(r.previous);
    } else if (r.reason === 'soldout') {
      $('ca-end-p').textContent = 'Bravo ! Tous les replays ont été distribués. Merci d’avoir joué !';
    } else {
      $('ca-end-p').textContent = 'Bravo ! Votre victoire n’a pas pu être validée : rejouez une partie complète.';
    }
  }

  async function claim(rewardId) {
    $('ca-rws').querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const r = await post('claim', { rewardId }).catch(() => ({ error: 'Connexion perdue, réessayez.' }));
    if (r.error) {
      $('ca-err').textContent = r.error;
      $('ca-rws').querySelectorAll('button').forEach((b) => { b.disabled = false; });
      return;
    }
    Sfx.win();
    $('ca-rws').hidden = true;
    $('ca-end-p').textContent = `Votre replay : ${short(r.rewardTitle)}`;
    showCode(r);
    me.previous = r;
  }

  $('ca-play').addEventListener('click', play);
  $('ca-again').addEventListener('click', play);

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

  // Manette tactile
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

  boot();
})();
