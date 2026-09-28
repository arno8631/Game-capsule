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
  // Comptes de test Capsule (identifiants clients Shopify) : parties illimitées, pas de déconnexion auto
  const TESTERS = ['23773949821273'];
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
