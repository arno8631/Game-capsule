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
