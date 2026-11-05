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
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Réglages partagés par la borne (site-ui.js) et la manette.
  window.__orthoConfig = {
    // Fonction de tag (Supabase capsule) : appelée sans clé, elle fait ses propres contrôles.
    TAG_URL: 'https://qyibpvgbxxdilaewiyys.supabase.co/functions/v1/ortho-jeu-tag',
    // Comptes créés depuis la borne du stand : tag dédié en plus des tags jeuJO.
    BORNE_TAG: 'BorneJo2026',
    // Comptes de test Capsule (identifiants clients Shopify) : parties illimitées, pas de déconnexion auto.
    TESTERS: ['23773949821273', '23276575129945', '23130642612569', '23662288142681', '23394139406681'],
    // price : valeur de secours en € ; le prix réel est relu sur la fiche produit (url, jamais affichée).
    REWARDS: [
      { id: 'biomecanique', speaker: 'Dr Skander Ellouze', title: 'Replay Biomécanique : maîtriser les clés de l’excellence en orthodontie',
        url: '/products/replay-biomecanique-maitriser-les-cles-de-lexcellence-en-orthodontie', price: 900 },
      { id: 'contentions', speaker: 'Dr Philippides', title: 'Replay Adieu les urgences : maîtriser le collage des contentions',
        url: '/products/replay-adieu-les-urgences-maitriser-le-collage-des-contentions', price: 249 },
    ],
  };

  // ── Connexion / inscription Shopify en arrière-plan (borne et manette) ──
  // Le formulaire n'est jamais vidé : en cas d'erreur, seule la ligne à corriger est signalée.
  const auth = {
    async send(form) {
      let res;
      try { res = await fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin' }); }
      catch { return { ok: false, network: true, errors: [] }; }
      const path = new URL(res.url, location.href).pathname;
      if (/\/challenge/.test(path)) return { challenge: true };
      // Réussite = Shopify redirige vers l'adresse de retour ; échec = il réaffiche son formulaire.
      if (res.redirected && !/^\/account\/(login|register)/.test(path)) return { ok: true };
      const errors = [];
      try {
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        doc.querySelectorAll('.errors li, .errors, [class*="error"] li, [class*="form__message"]').forEach((el) => {
          const t = el.textContent.replace(/\s+/g, ' ').trim();
          if (t && t.length < 200 && !errors.includes(t)) errors.push(t);
        });
      } catch {}
      return { ok: false, errors };
    },
    clear(form) {
      form.querySelectorAll('.oa-bad').forEach((el) => el.classList.remove('oa-bad'));
      form.querySelectorAll('.oa-msg').forEach((el) => el.remove());
    },
    mark(form, selector, msg) {
      const input = form.querySelector(selector);
      if (!input) return null;
      input.classList.add('oa-bad');
      if (msg) {
        const m = document.createElement('span');
        m.className = 'oa-msg';
        m.setAttribute('role', 'alert');
        m.textContent = msg;
        input.insertAdjacentElement('afterend', m);
      }
      input.addEventListener('input', () => { input.classList.remove('oa-bad'); input.nextElementSibling?.classList.contains('oa-msg') && input.nextElementSibling.remove(); }, { once: true });
      return input;
    },
    // Place chaque erreur sur sa ligne ; renvoie le champ à corriger (focus).
    show(form, kind, result) {
      auth.clear(form);
      if (!document.getElementById('oa-style')) {
        const st = document.createElement('style');
        st.id = 'oa-style';
        st.textContent = `.oa-bad{border-color:#ff2a6d!important;box-shadow:0 0 0 2px #ff2a6d!important}
          .oa-msg{display:block;font-family:'VT323',ui-monospace,monospace;font-size:1.7em;line-height:1;letter-spacing:0;color:#ff7ba3;text-transform:none}`;
        document.head.appendChild(st);
      }
      const submit = form.querySelector('[type=submit]');
      if (result.network) return auth.mark(form, '[type=submit]', 'Pas de connexion Internet : réessayez dans un instant.') && submit;
      const EMAIL = '[name="customer[email]"]', PASS = '[name="customer[password]"]';
      if (kind === 'login') {
        auth.mark(form, EMAIL, '');
        return auth.mark(form, PASS, 'Email ou mot de passe incorrect : vérifiez ces deux lignes.');
      }
      const txt = result.errors.join(' ').toLowerCase();
      let first = null;
      const add = (sel, msg) => { const el = auth.mark(form, sel, msg); first ??= el; };
      if (/(e-?mail|courriel)/.test(txt) && /(déjà|already|taken|utilis|exist)/.test(txt)) add(EMAIL, 'Cette adresse a déjà un compte Capsule : touchez « J’ai déjà un compte ».');
      else if (/(e-?mail|courriel)/.test(txt)) add(EMAIL, 'Adresse email non valide.');
      if (/(mot de passe|password)/.test(txt)) add(PASS, 'Mot de passe trop court (6 caractères minimum).');
      if (/(prénom|first)/.test(txt)) add('[name="customer[first_name]"]', 'Prénom obligatoire.');
      if (/(\bnom\b|last name)/.test(txt)) add('[name="customer[last_name]"]', 'Nom obligatoire.');
      if (!first) add(EMAIL, 'Compte non créé : cette adresse a sans doute déjà un compte Capsule (touchez « J’ai déjà un compte »).');
      return first;
    },
  };
  window.__orthoAuth = auth;

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
  function screen({ onInput, onAction, onStatus, onState = () => {}, onMessage = () => {} }) {
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
      onState('CONNEXION…');
      loadPeer().then(() => {
        peer = new window.Peer(peerId(code), PEER_OPTS);
        peer.on('open', () => onState('PRÊTE'));
        peer.on('connection', (c) => {
          // Le téléphone a trouvé la borne : si la liaison directe ne s'ouvre pas, le Wi-Fi la bloque.
          setTimeout(() => { if (!c.open && !conn?.open) onState('LIAISON BLOQUÉE PAR LE WI-FI'); }, 12000);
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
            else onMessage(m);
          });
          c.on('close', () => drop(c));
          c.on('error', () => drop(c));
        });
        peer.on('disconnected', () => setTimeout(() => { if (!peer.destroyed) peer.reconnect(); }, 2000));
        peer.on('error', (e) => {
          // unavailable-id : l'ancienne session de la page n'est pas encore libérée → on réessaie.
          onState(e.type === 'unavailable-id' ? 'REDÉMARRAGE…' : e.type === 'browser-incompatible' ? 'NAVIGATEUR INCOMPATIBLE' : 'SERVICE INJOIGNABLE');
          if (['unavailable-id', 'network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible'].includes(e.type)) {
            peer.destroy();
            setTimeout(start, 4000);
          }
        });
      }).catch(() => { onState('SERVICE INJOIGNABLE'); setTimeout(start, 8000); });
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
    /* Écran TV : le parcours du joueur (compte, partie, gain) se fait sur la manette */
    .mp{position:relative}
    .mp-acc{position:absolute;z-index:5;left:0;right:0;bottom:0;top:calc(max(14px,env(safe-area-inset-top)) + 34px);overflow:auto;
      padding:8px max(16px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));
      background:linear-gradient(180deg,#0b0322,#05010f);touch-action:auto;user-select:text;-webkit-user-select:text}
    .mp-v{display:grid;gap:14px;max-width:460px;margin:0 auto}
    .mp-h{font-family:'Press Start 2P',monospace;font-size:clamp(15px,5vw,22px);line-height:1.4;text-align:center;color:var(--y);text-shadow:2px 2px 0 var(--m);margin:4px 0}
    .mp-p{font-size:clamp(20px,6vw,26px);line-height:1.05;margin:0;color:#e9e3ff;text-align:center}
    .mp-err{font-size:20px;line-height:1.05;margin:0;color:#ff7ba3}
    .mp-prize{border:2px solid var(--m);padding:10px 12px;display:grid;gap:4px;background:rgba(18,6,46,.9)}
    .mp-prize b{font-family:'Press Start 2P',monospace;font-weight:normal;font-size:10px;line-height:1.5;color:var(--y)}
    .mp-prize span{font-size:20px;line-height:1}
    .mp-prize b span{font-size:inherit;line-height:inherit}
    button.mp-prize{font:inherit;color:#f5f3ff;text-align:left;cursor:pointer}
    button.mp-prize.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
    .mp-acc label{display:grid;gap:6px;font-family:'Press Start 2P',monospace;font-size:9px;line-height:1.4;color:#b9a8e8}
    .mp-acc input,.mp-acc select{font:inherit;font-family:'VT323',monospace;font-size:20px;padding:8px 10px;color:#f5f3ff;background:#12062e;border:2px solid var(--v);border-radius:0;width:100%}
    .mp-acc label.chk{display:flex;gap:10px;align-items:flex-start;font-family:'VT323',monospace;font-size:18px;line-height:1.05}
    .mp-acc label.chk input{width:20px;height:20px;flex:none;accent-color:var(--m)}
    .mp-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .mp-acc .mp-btn{width:100%;font-size:12px;padding:16px 12px}
    .mp-acc .mp-btn.alt{background:var(--c);box-shadow:0 4px 0 #178a8d}
    .mp-acc .mp-btn.big{font-size:18px;padding:26px 12px}
    .mp-acc .mp-btn:disabled{opacity:.45}
    .mp-link{font-family:'Press Start 2P',monospace;font-size:9px;color:#b9a8e8;background:none;border:0;text-decoration:underline;padding:6px;justify-self:center}
    .mp-count{font-family:'Press Start 2P',monospace;font-size:9px;color:#8f82b8;text-align:center;margin:0}
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
      <section class="mp-acc" id="mp-acc" hidden></section>
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
    let onTv = () => {};   // messages de l'écran TV (parcours joueur, défini plus bas)
    let onLink = () => {}; // liaison ouverte / perdue
    let helloSeen = false;
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
            scheduleRetry(`Service de connexion injoignable (${e.type}). Vérifiez Internet sur le téléphone.`);
          });
          peer.on('disconnected', () => { if (!peer.destroyed) peer.reconnect(); });
        }
        const go = () => {
          try { conn?.close(); } catch {}
          const c = peer.connect(peerId(code), { reliable: true, serialization: 'json' });
          conn = c;
          const opened = setTimeout(() => { if (conn === c && !c.open) { try { c.close(); } catch {} scheduleRetry('Borne trouvée, mais le Wi-Fi bloque la liaison entre appareils. Essayez le partage de connexion du téléphone.'); } }, 12000);
          c.on('open', () => {
            clearTimeout(opened); setOnline(true, STATES.coin); wakeLock(); sendState(); vibrate(30); onLink();
            // L'écran se présente (« hello ») : on le lui redemande tant qu'il n'a pas répondu (borne iPad : pas de réponse).
            let tries = 0;
            const ask = () => { if (conn !== c || helloSeen || tries++ > 5) return; send({ t: 'hi' }); setTimeout(ask, 1500); };
            ask();
          });
          c.on('data', (m) => {
            if (!m) return;
            if (m.t === 'busy') { conn = null; setOnline(false, 'Une autre manette est déjà connectée à la borne.'); clearTimeout(retry); retry = setTimeout(connect, 5000); return; }
            if (m.t === 'st') { msg(STATES[m.s] ?? ''); if (m.s !== 'play') $('mp-hud').textContent = ''; }
            if (m.haptic) vibrate(HAPTICS[m.haptic] || 20);
            if (m.hud) $('mp-hud').textContent = `SCORE ${String(m.hud.score).padStart(6, '0')}  ${'♥'.repeat(Math.max(0, m.hud.lives))}`;
            onTv(m);
          });
          c.on('close', () => { if (conn === c) { conn = null; onLink(); scheduleRetry('Connexion perdue, reconnexion…'); } });
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

    // ── Écran TV : tout le parcours du joueur se fait ici (compte, partie, gain, déconnexion) ──
    const CFG = window.__orthoConfig;
    const PAGE = location.pathname;
    const HOME = `${PAGE}?manette`;
    const cidRaw = root.dataset.customerId || window.ShopifyAnalytics?.meta?.page?.customerId || window.__st?.cid || '';
    const cid = /^\d+$/.test(String(cidRaw)) ? String(cidRaw) : '';
    const logged = Boolean(cid);
    const tester = logged && CFG.TESTERS.includes(cid);
    const PLAYED_KEY = `orthoInvadersPlayed:${cid}`;
    const REG_TAGS = ['jeuJO', 'jeuJO-2026', 'jeuJO-inscrit', CFG.BORNE_TAG].join(', ');
    if (new URLSearchParams(location.search).has('reset')) {
      try { Object.keys(localStorage).filter((k) => k.startsWith('orthoInvaders')).forEach((k) => localStorage.removeItem(k)); } catch {}
    }
    const acc = $('mp-acc');
    const euros = (n) => `${Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;
    const prices = {};
    CFG.REWARDS.forEach((r) => {
      prices[r.id] = r.price;
      fetch(`${r.url}.js`).then((res) => (res.ok ? res.json() : null)).then((prod) => {
        if (!prod || !Number.isFinite(prod.price)) return;
        prices[r.id] = prod.price / 100;
        acc.querySelectorAll(`[data-price="${r.id}"]`).forEach((el) => { el.textContent = euros(prices[r.id]); });
      }).catch(() => {});
    });
    let tvMode = false;
    let view = null;
    let countdown = null;
    let result = null;

    const logout = () => {
      clearInterval(countdown);
      fetch('/account/logout', { credentials: 'same-origin' }).catch(() => {}).finally(() => location.replace(HOME));
    };
    function countTo(seconds, label) {
      clearInterval(countdown);
      const el = acc.querySelector('.mp-count');
      if (!el) return;
      if (tester) { el.textContent = 'Compte test : pas de déconnexion automatique'; return; }
      let left = seconds;
      const tick = () => { el.textContent = `${label} dans ${left} s`; if (left-- <= 0) logout(); };
      tick();
      countdown = setInterval(tick, 1000);
    }
    const prizeList = () => CFG.REWARDS.map((r) => `<div class="mp-prize"><b>${esc(r.speaker.toUpperCase())} · <span data-price="${r.id}">${euros(prices[r.id])}</span> OFFERT</b><span>${esc(r.title)}</span></div>`).join('');
    const nextBtns = () => `${tester ? '<button type="button" class="mp-btn alt" data-act="replay">↻ Rejouer (compte test)</button>' : ''}
      <button type="button" class="mp-btn" data-act="logout">▶ Joueur suivant</button><p class="mp-count"></p>`;

    const VIEWS = {
      guest: () => `<p class="mp-h">INSERT COIN</p>
        <p class="mp-p">Une partie gratuite par praticien. Battez la Méga-Carie et gagnez :</p>${prizeList()}
        <button type="button" class="mp-btn" data-go="register">▶ Créer mon compte et jouer</button>
        <button type="button" class="mp-btn alt" data-go="login">J'ai déjà un compte</button>`,
      register: () => `<p class="mp-h">NOUVEAU JOUEUR</p><p class="mp-err" hidden></p>
        <form class="mp-v" method="post" action="/account" accept-charset="UTF-8" id="mp-reg">
          <input type="hidden" name="form_type" value="create_customer"><input type="hidden" name="utf8" value="✓">
          <input type="hidden" name="customer[tags]" id="mp-tags" value="${REG_TAGS}">
          <input type="hidden" name="return_to" value="${esc(HOME)}">
          <div class="mp-row"><label>PRÉNOM<input name="customer[first_name]" id="mp-fn" autocomplete="given-name" required></label>
            <label>NOM<input name="customer[last_name]" id="mp-ln" autocomplete="family-name" required></label></div>
          <label>PROFESSION<select id="mp-prof" required><option value="">Choisir…</option>
            <option value="Orthodontiste">Orthodontiste</option><option value="Omnipraticien">Chirurgien-dentiste omnipraticien</option>
            <option value="Assistante">Assistant(e) dentaire</option><option value="Etudiant">Étudiant(e) / interne</option>
            <option value="Autre-profession">Autre</option></select></label>
          <label>EMAIL PROFESSIONNEL<input type="email" name="customer[email]" id="mp-em" autocomplete="email" required></label>
          <label>MOT DE PASSE (6 CARACTÈRES MIN.)<input type="password" name="customer[password]" id="mp-pw" autocomplete="new-password" minlength="6" required></label>
          <label class="chk"><input type="checkbox" name="customer[accepts_marketing]" value="true" checked>Je souhaite recevoir les nouveautés Capsule : formations, replays, cas cliniques.</label>
          <button class="mp-btn" type="submit">▶ Créer mon compte</button>
        </form>
        <button type="button" class="mp-link" data-go="login">J'ai déjà un compte</button>
        <button type="button" class="mp-link" data-go="guest">◀ Retour</button>`,
      login: () => `<p class="mp-h">CONNEXION</p><p class="mp-p">Votre compte Capsule habituel.</p><p class="mp-err" hidden></p>
        <form class="mp-v" method="post" action="/account/login" accept-charset="UTF-8" id="mp-login">
          <input type="hidden" name="form_type" value="customer_login"><input type="hidden" name="utf8" value="✓">
          <input type="hidden" name="return_url" value="${esc(HOME)}">
          <label>EMAIL<input type="email" name="customer[email]" id="mp-lem" autocomplete="email" required></label>
          <label>MOT DE PASSE<input type="password" name="customer[password]" id="mp-lpw" autocomplete="current-password" required></label>
          <button class="mp-btn alt" type="submit">▶ Me connecter</button>
        </form>
        <p class="mp-p" style="font-size:18px">Mot de passe oublié ? Demandez à l'équipe Capsule du stand.</p>
        <button type="button" class="mp-link" data-go="register">Créer un compte</button>
        <button type="button" class="mp-link" data-go="guest">◀ Retour</button>`,
      ready: () => `<p class="mp-h">✓ CONNECTÉ</p>
        <p class="mp-p">${tester ? 'Compte test : parties illimitées.' : 'Vous avez droit à une partie. Regardez le grand écran !'}</p>
        <button type="button" class="mp-btn big" data-act="play" id="mp-play">▶ JOUER</button>
        <p class="mp-p" id="mp-wait" style="font-size:18px" hidden>En attente du grand écran…</p>
        <button type="button" class="mp-link" data-act="logout">Ce n'est pas moi : changer de joueur</button>`,
      played: () => `<p class="mp-h">DÉJÀ JOUÉ</p><p class="mp-p">Vous avez déjà joué votre partie. Merci et à bientôt sur capsule-med.com !</p>${nextBtns()}`,
      lose: () => `<p class="mp-h">GAME OVER</p><p class="mp-p">${result.score} points. La Méga-Carie a gagné cette fois… Merci d'avoir joué !</p>${nextBtns()}`,
      win: () => `<p class="mp-h">★ VICTOIRE ★</p><p class="mp-p">Bravo ! ${result.score} points. Choisissez votre replay offert :</p>
        ${CFG.REWARDS.map((r) => `<button type="button" class="mp-prize" data-rw="${r.id}"><b>${esc(r.speaker.toUpperCase())} · <span data-price="${r.id}">${euros(prices[r.id])}</span></b><span>${esc(r.title)}</span></button>`).join('')}
        <form class="mp-v" method="post" action="/contact#contact_form" accept-charset="UTF-8" id="mp-win">
          <input type="hidden" name="form_type" value="contact"><input type="hidden" name="utf8" value="✓">
          <input type="hidden" name="contact[name]" value="Gagnant Ortho Invaders"><input type="hidden" name="contact[body]" id="mp-body">
          <label>VOTRE EMAIL DE COMPTE CAPSULE<input type="email" name="contact[email]" id="mp-wem" autocomplete="email" required></label>
          <button class="mp-btn" type="submit" id="mp-send" disabled>Valider mon gain</button>
        </form><p class="mp-count"></p>`,
      thanks: () => `<p class="mp-h">GAIN ENREGISTRÉ</p><p class="mp-p">L'équipe Capsule vous envoie par email votre code personnel pour « ${esc(result.reward.title)} ».</p>${nextBtns()}`,
    };
    const PS = { guest: 'guest', register: 'guest', login: 'guest', ready: 'ready' };

    function go(v) {
      view = v;
      clearInterval(countdown);
      if (!v) { acc.hidden = true; return; }
      acc.innerHTML = `<div class="mp-v">${VIEWS[v]()}</div>`;
      acc.hidden = false;
      acc.scrollTop = 0;
      send({ t: 'ps', s: PS[v] || v });
      acc.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
      acc.querySelectorAll('[data-act="logout"]').forEach((b) => b.addEventListener('click', logout));
      acc.querySelectorAll('[data-act="replay"]').forEach((b) => b.addEventListener('click', () => go('ready')));
      if (v === 'register' || v === 'login') bindAuth(v);
      if (v === 'ready') { $('mp-play').addEventListener('click', play); syncReady(); }
      if (v === 'played') countTo(10, 'Déconnexion automatique');
      if (v === 'lose') countTo(12, 'Joueur suivant');
      if (v === 'thanks') countTo(15, 'Joueur suivant');
      if (v === 'win') bindWin();
    }
    function syncReady() {
      if (view !== 'ready') return;
      const ok = Boolean(conn?.open);
      $('mp-play').disabled = !ok;
      $('mp-wait').hidden = ok;
    }

    // Connexion / inscription en arrière-plan : on ne quitte jamais la manette.
    function bindAuth(kind) {
      const form = acc.querySelector('form');
      // Téléphone partagé du stand : champs toujours vides, sans auto-remplissage du navigateur.
      form.setAttribute('autocomplete', 'off');
      form.querySelectorAll('input:not([type=hidden]):not([type=checkbox])').forEach((i) => i.setAttribute('autocomplete', i.type === 'password' ? 'new-password' : 'off'));
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (kind === 'register') { const prof = $('mp-prof').value; $('mp-tags').value = prof ? `${REG_TAGS}, ${prof}` : REG_TAGS; }
        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        const r = await auth.send(form);
        if (r.challenge) { form.submit(); return; }
        if (r.ok) { location.replace(HOME); return; }
        btn.disabled = false;
        const bad = auth.show(form, kind, r);
        bad?.scrollIntoView?.({ block: 'center' });
        bad?.focus?.();
      });
    }

    function play() {
      if (!conn?.open) { syncReady(); return; }
      if (!tester) {
        if (store.get(PLAYED_KEY)) { go('played'); return; }
        store.set(PLAYED_KEY, String(Date.now()));
      }
      send({ t: 'start' });
      go(null);
      msg('');
    }

    function bindWin() {
      let reward = null;
      countTo(180, 'Déconnexion automatique');
      acc.querySelectorAll('[data-rw]').forEach((b) => b.addEventListener('click', () => {
        reward = CFG.REWARDS.find((r) => r.id === b.dataset.rw);
        acc.querySelectorAll('[data-rw]').forEach((x) => x.classList.toggle('on', x === b));
        $('mp-send').disabled = false;
      }));
      const form = $('mp-win');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!reward) return;
        const when = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        $('mp-body').value = [
          tester ? '[COMPTE TEST — ne pas créer de code]' : 'NOUVEAU GAGNANT — ORTHO INVADERS (borne TV du stand)',
          result.seconds < 90 ? '⚠ PARTIE ANORMALEMENT COURTE (moins de 90 s) : vérifier avant de créer le code.' : 'Durée de partie normale.',
          `Replay choisi : ${reward.title} (${reward.speaker})`,
          `Email déclaré : ${$('mp-wem').value}`,
          `Compte client Shopify : ${cid}`,
          `Score : ${result.score} · Durée de la partie : ${result.seconds} s · Vague : ${result.wave}`,
          `Date : ${when}`,
          'Appareil : grand écran du stand + téléphone-manette',
          '',
          'À faire : Réductions > Créer > Montant de réduction sur les produits, 100 %, produit = replay choisi,',
          'Admissibilité = ce client uniquement, Limite = 1 utilisation. Puis envoyer le code au gagnant.',
        ].join('\n');
        $('mp-send').disabled = true;
        if (!tester) store.set(`orthoInvadersWon:${cid}`, reward.id);
        try {
          const res = await fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin' });
          if (/\/challenge/.test(res.url)) { form.submit(); return; }
        } catch {}
        result.reward = reward;
        go('thanks');
      });
    }

    // Tag Shopify jeuJO de chaque praticien connecté (hors comptes test), une fois par session.
    if (logged && !tester) {
      const k = `orthoTagged:${cid}`;
      let done = false;
      try { done = sessionStorage.getItem(k) === '1'; } catch {}
      if (!done) {
        fetch(CFG.TAG_URL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: cid }) })
          .then((r) => { if (r.ok) { try { sessionStorage.setItem(k, '1'); } catch {} } }).catch(() => {});
      }
    }

    onTv = (m) => {
      if (m.t === 'hello' && m.mode === 'tv') {
        helloSeen = true;
        if (!tvMode) {
          tvMode = true;
          if (!logged) go('guest');
          else go(!tester && store.get(PLAYED_KEY) ? 'played' : 'ready');
        } else if (view) { send({ t: 'ps', s: PS[view] || view }); syncReady(); }
        return;
      }
      if (m.t === 'end' && tvMode) {
        result = { won: Boolean(m.won), score: Number(m.score) || 0, wave: Number(m.wave) || 0, seconds: Number(m.seconds) || 0 };
        vibrate(m.won ? HAPTICS.win : HAPTICS.lose);
        go(result.won ? 'win' : 'lose');
      }
    };
    onLink = () => syncReady();

    connect();
  }

  window.__orthoPad = { screen, phone };
})();
