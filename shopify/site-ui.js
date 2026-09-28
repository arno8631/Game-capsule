// Ortho Invaders — version 100 % site capsule-med.com (sans serveur).
// Inscription / connexion : formulaires natifs Shopify de la page. Victoire : formulaire de contact
// natif → l'équipe Capsule reçoit un email et crée le code 100 % lié au compte du gagnant.
(function () {
  const root = document.getElementById('capsule-arcade');
  if (!root) return;
  const customerId = root.dataset.customerId
    || window.ShopifyAnalytics?.meta?.page?.customerId
    || window.__st?.cid;
  if (!customerId) return;

  const PAGE = location.pathname;
  const REWARDS = [
    { id: 'biomecanique', speaker: 'Dr Skander Ellouze', title: 'Replay Biomécanique : maîtriser les clés de l’excellence en orthodontie' },
    { id: 'contentions', speaker: 'Dr Philippides', title: 'Replay Adieu les urgences : maîtriser le collage des contentions' },
  ];
  const WON_KEY = `orthoInvadersWon:${customerId}`;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Pacifico&family=Press+Start+2P&family=VT323&display=swap';
  document.head.appendChild(font);

  const css = `
  .ca{--c:#2de2e6;--m:#ff2a6d;--y:#ffd319;--v:#9d4edd;--ink:#f5f3ff;--dim:#b9a8e8;--bg:#12062e;
    font-family:'VT323',ui-monospace,monospace;color:var(--ink);display:grid;gap:12px;justify-items:center}
  .ca *{box-sizing:border-box}
  .ca [hidden]{display:none!important}
  .ca-stage{width:100%;height:min(82vh,780px);display:grid;place-items:center}
  .ca-screen{position:relative;line-height:0;border-radius:12px;overflow:hidden;
    box-shadow:0 0 0 3px #05010f,0 0 0 6px var(--v),0 0 36px rgba(157,78,221,.6)}
  .ca-screen canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges;filter:saturate(1.15) contrast(1.05)}
  .ca-crt{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;
    background:repeating-linear-gradient(180deg,rgba(0,0,0,.28) 0 calc(var(--px,4px)*.32),transparent calc(var(--px,4px)*.32) var(--px,4px)),
    radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(0,0,0,.55) 100%)}
  .ca-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:6%;
    background:rgba(8,2,28,.88);line-height:normal;container-type:inline-size;overflow:auto;z-index:2}
  .ca-card{width:100%;display:grid;gap:3.6cqw;text-align:center}
  .ca-t{font-family:'Press Start 2P',monospace;font-size:6.2cqw;line-height:1.4;color:var(--y);text-shadow:.12em .12em 0 var(--m);margin:0}
  .ca-p{font-size:5.2cqw;line-height:1.1;color:var(--dim);margin:0}
  .ca-p b{color:var(--y);font-weight:normal}
  #capsule-arcade .ca-btn{font-family:'Press Start 2P',monospace;font-size:4cqw;line-height:1.3;text-transform:uppercase;border:0;cursor:pointer;
    padding:4cqw;background:var(--y);color:#12062e;box-shadow:0 5px 0 #b8860b;text-decoration:none;display:block;width:100%}
  #capsule-arcade .ca-btn.alt{background:var(--c);box-shadow:0 5px 0 #178a8d}
  #capsule-arcade .ca-btn.ghost{background:transparent;color:var(--dim);box-shadow:none;border:2px solid var(--dim);font-size:3cqw;padding:3cqw}
  .ca-btn:focus-visible,.ca-rw:focus-visible{outline:3px solid var(--c);outline-offset:3px}
  .ca-rw{font:inherit;color:var(--ink);background:var(--bg);border:3px solid var(--m);padding:3cqw;cursor:pointer;text-align:left;display:grid;gap:1.4cqw}
  .ca-rw .w{font-family:'Press Start 2P',monospace;font-size:3cqw;color:var(--y);line-height:1.5}
  .ca-rw .t{font-size:5.2cqw;line-height:1}
  .ca-rw.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
  .ca-f{display:grid;gap:2.4cqw;text-align:left}
  .ca-f label{font-family:'Press Start 2P',monospace;font-size:2.8cqw;color:var(--dim);display:grid;gap:1.6cqw}
  .ca-f input{font:inherit;font-size:5.6cqw;padding:2cqw 3cqw;color:var(--ink);background:#0b0322;border:2px solid var(--v);border-radius:0;width:100%}
  .ca-f input:focus{outline:none;border-color:var(--c)}
  .ca-pad{display:none;width:min(100%,560px);grid-template-columns:1fr 1fr 1.25fr;gap:12px;height:clamp(110px,16vh,170px);touch-action:none;user-select:none;-webkit-user-select:none}
  .ca.touch .ca-pad{display:grid}
  .ca.touch .ca-keys{display:none}
  .ca-pad button{touch-action:none;border:0;color:#fff;font-family:'Press Start 2P',monospace;-webkit-tap-highlight-color:transparent}
  .ca-dir{background:#1f0b4a;border:4px solid var(--c)!important;font-size:26px;box-shadow:0 5px 0 #178a8d}
  .ca-dir.down{background:#2a1566;transform:translateY(3px)}
  .ca-fire{border-radius:50%;aspect-ratio:1;justify-self:center;height:100%;font-size:14px;
    background:radial-gradient(circle at 35% 30%,#ff7ba3,var(--m) 55%,#8f0f3a);box-shadow:0 6px 0 #6d0a2c,0 0 24px var(--m)}
  .ca-fire.down{transform:translateY(4px)}
  .ca-keys{font-family:'Press Start 2P',monospace;font-size:10px;color:#8f82b8;margin:0;text-align:center;line-height:1.8}
  .ca-bar{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .ca-bar a,.ca-bar button{font-family:'Press Start 2P',monospace;font-size:10px;color:#8f82b8;background:none;border:0;cursor:pointer;text-decoration:underline;padding:4px}
  .ca-head{display:none}
  /* ── Plein écran : le jeu recouvre toute la page (menu, pied de page, colonne du thème) ── */
  #capsule-arcade.ca-full{position:fixed;inset:0;z-index:2147483000;overflow:hidden;
    background:radial-gradient(ellipse at 50% 0%,rgba(157,78,221,.35),transparent 60%),linear-gradient(180deg,#0b0322,#05010f 70%)}
  .ca-full .ca{height:100%;grid-template-rows:auto minmax(0,1fr) auto auto auto;gap:1.2vh;padding:0 16px max(1.2vh,env(safe-area-inset-bottom))}
  .ca-full .ca-stage{height:100%;min-height:0}
  .ca-full .ca-head{display:grid;justify-items:center;gap:.4vh;width:100vw;margin:0 -16px;padding:max(1.4vh,env(safe-area-inset-top)) 16px 1vh;
    background:linear-gradient(180deg,#1a0544,#0b0322);border-bottom:3px solid var(--m);box-shadow:0 0 30px rgba(255,42,109,.5)}
  .ca-head .b{font-family:'Press Start 2P',monospace;font-size:clamp(8px,1.3vh,14px);letter-spacing:.6em;padding:.45em .5em .45em 1.1em;
    color:var(--c);border:2px solid var(--c);box-shadow:0 0 10px var(--c)}
  .ca-head .t{font-family:'Press Start 2P',monospace;font-size:clamp(18px,min(4vh,6vw),56px);line-height:1;white-space:nowrap;
    background:linear-gradient(180deg,#fff 0 42%,#bff7ff 50%,var(--c) 62%,#3a86ff);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(.08em .08em 0 var(--m)) drop-shadow(0 0 .3em rgba(255,42,109,.7))}
  .ca-head .s{font-family:'Pacifico',cursive;font-size:clamp(14px,min(2.3vh,4.4vw),32px);line-height:1.1;color:#ffd1f4;text-shadow:0 0 4px #f706cf,0 0 12px #f706cf}
  .ca-enter{display:none}
  #capsule-arcade:not(.ca-full) .ca-enter{display:block}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  root.innerHTML = `
  <div class="ca">
    <header class="ca-head"><span class="b">CAPSULE</span><span class="t">ORTHO INVADERS</span><span class="s">Défendez l'arcade dentaire !</span></header>
    <div class="ca-stage" data-fit>
      <div class="ca-screen">
        <canvas id="game" width="216" height="336" aria-label="Ortho Invaders"></canvas>
        <div class="ca-crt" aria-hidden="true"></div>
        <div class="ca-ov" id="ca-start"><div class="ca-card">
          <p class="ca-t">INSERT<br>COIN</p>
          <p class="ca-p" id="ca-sub">Battez la <b>Méga-Carie</b> et gagnez un replay de formation offert (valeur 249 €).</p>
          <button class="ca-btn" id="ca-play">▶ Jouer</button>
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
          <button class="ca-btn alt" id="ca-again">↻ Rejouer</button>
        </div></div>
        <div class="ca-ov" id="ca-sent" hidden><div class="ca-card">
          <p class="ca-t">★ BRAVO ★</p>
          <p class="ca-p">Votre victoire est enregistrée. L'équipe Capsule crée votre code personnel (100 %, usage unique, lié à votre compte) et vous l'envoie par email. Sur le stand : présentez cet écran.</p>
          <button class="ca-btn alt" id="ca-again2">↻ Rejouer pour le score</button>
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
    <div class="ca-bar">
      <button type="button" class="ca-enter" id="ca-enter">⛶ JOUER EN PLEIN ÉCRAN</button>
      <button type="button" id="ca-exit">✕ LOTS &amp; RÈGLES</button>
      <a href="/account/logout?return_url=${encodeURIComponent(PAGE + '#jouer')}">▶ JOUEUR SUIVANT (SE DÉCONNECTER)</a>
    </div>
  </div>`;

  // Plein écran : le jeu recouvre toute la page
  function full(on) {
    root.classList.toggle('ca-full', on);
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
    document.getElementById('ca-exit').hidden = !on;
    if (!on) root.scrollIntoView({ block: 'start' });
    window.Game?.fit?.();
  }
  full(true);

  // Le moteur de jeu cherche <canvas id="game"> : il démarre une fois la borne posée dans la page.
  window.__orthoInvadersGame();

  const $ = (id) => document.getElementById(id);
  if (matchMedia('(pointer: coarse)').matches) root.querySelector('.ca').classList.add('touch');
  const overlays = ['ca-start', 'ca-end', 'ca-sent', 'ca-pause'];
  const show = (id) => overlays.forEach((o) => { $(o).hidden = o !== id; });

  let startedAt = 0;
  let last = null;
  let reward = null;

  if (new URLSearchParams(location.search).get('contact_posted') === 'true' && store.get(WON_KEY)) show('ca-sent');

  function play() {
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
    $('ca-again').hidden = false;
    if (!won) {
      $('ca-end-p').textContent = `${score} points. La Méga-Carie a gagné cette manche… retentez votre chance !`;
      return;
    }
    if (store.get(WON_KEY)) {
      $('ca-end-p').textContent = `Encore gagné, ${score} points ! Un seul replay par compte : votre gain est déjà enregistré.`;
      return;
    }
    $('ca-end-p').textContent = `Bravo ! ${score} points. Choisissez votre replay offert :`;
    $('ca-rws').innerHTML = REWARDS.map((r) => `<button type="button" class="ca-rw" data-id="${r.id}"><span class="w">${r.speaker.toUpperCase()}</span><span class="t">${r.title}</span></button>`).join('');
    $('ca-rws').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      reward = REWARDS.find((r) => r.id === b.dataset.id);
      $('ca-rws').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      $('ca-send').disabled = false;
    }));
    reward = null;
    $('ca-send').disabled = true;
    $('ca-win').hidden = false;
    $('ca-again').hidden = true;
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
  });

  $('ca-enter').addEventListener('click', () => full(true));
  $('ca-exit').addEventListener('click', () => { pause(); full(false); });
  $('ca-play').addEventListener('click', play);
  $('ca-again').addEventListener('click', play);
  $('ca-again2').addEventListener('click', play);

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
