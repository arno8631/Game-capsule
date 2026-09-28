// Borne grand écran : affiche le jeu, le QR code, la file d'attente et relaie la manette.
(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);

  let savedRoom = null;
  try { savedRoom = localStorage.getItem('arcadeRoom'); } catch {}

  const socket = io({
    auth: { role: 'screen', key: params.get('key') || '', room: params.get('room') || savedRoom || '' },
  });

  const show = (id, on) => $(id).classList.toggle('on', on);
  let current = null;       // { gameId, name }
  let readyTimer = null;
  let winnerTimer = null;

  fetch('/api/config').then((r) => r.json()).then(({ rewards }) => {
    $('prizes').innerHTML = rewards.map((r) => `
      <div class="prize">
        <img src="${r.image}" alt="">
        <div class="who">${r.speaker}</div>
        <div class="what">${r.title.replace(/^Replay —\s*/, '')}</div>
      </div>`).join('');
  });

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  socket.on('room', ({ code, qr }) => {
    try { localStorage.setItem('arcadeRoom', code); } catch {}
    $('qr').src = qr;
    $('code').textContent = code;
  });

  socket.on('queue', ({ queue, current: cur, leaderboard, prizesLeft }) => {
    $('left').textContent = prizesLeft;
    $('queue').innerHTML = queue.length
      ? queue.map((n, i) => `${i + 1}. ${esc(n)}`).join('<br>')
      : 'Personne… à vous de jouer !';
    $('queue').classList.toggle('empty', !queue.length);
    $('board').innerHTML = leaderboard.length
      ? leaderboard.map((s) => `<li><span>${esc(s.name)} ${s.won ? '<span class="cup">★</span>' : ''}</span><span>${s.score}</span></li>`).join('')
      : '<li class="empty">Aucun score… pour l’instant</li>';
    const ticker = $('ticker');
    ticker.innerHTML = queue.length ? `PROCHAIN : <b>${esc(queue[0])}</b>${queue.length > 1 ? `<br>+${queue.length - 1} en attente` : ''}` : '';
    ticker.classList.toggle('on', Boolean(queue.length) && Game.mode !== 'attract');
  });

  socket.on('game:ready', ({ gameId, name }) => {
    current = { gameId, name };
    Game.stop();
    $('readyName').textContent = name;
    show('attract', false);
    show('ready', true);
    let left = 30;
    clearInterval(readyTimer);
    $('readyCount').textContent = `${left}s`;
    readyTimer = setInterval(() => {
      left -= 1;
      $('readyCount').textContent = `${Math.max(0, left)}s`;
    }, 1000);
    Sfx.coin();
  });

  socket.on('game:start', ({ gameId, name }) => {
    if (!current || current.gameId !== gameId) return;
    clearInterval(readyTimer);
    show('ready', false);
    document.body.classList.add('playing');
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

  socket.on('game:cancel', () => {
    current = null;
    clearInterval(readyTimer);
    show('ready', false);
    backToAttract();
  });

  socket.on('input', (state) => Game.setRemote(state));

  socket.on('winner', ({ name, reward, speaker }) => {
    $('winnerName').textContent = name;
    $('winnerWhat').textContent = `remporte « ${reward.replace(/^Replay —\s*/, '')} » · ${speaker}`;
    show('winner', true);
    Sfx.win();
    clearTimeout(winnerTimer);
    winnerTimer = setTimeout(() => show('winner', false), 7000);
  });

  socket.on('fatal', (msg) => {
    $('fatal').textContent = msg;
    $('fatal').style.display = 'block';
  });

  function backToAttract() {
    if (current) return; // un nouveau joueur est déjà prêt
    Game.stop();
    document.body.classList.remove('playing');
    show('attract', true);
    $('ticker').classList.remove('on');
  }

  // Mode libre (animateurs) : Entrée depuis l'accueil, sans lot à la clé.
  addEventListener('keydown', (e) => {
    if (e.code === 'Enter' && !current && Game.mode === 'attract') {
      show('attract', false);
      document.body.classList.add('playing');
      Game.start({ name: null, onEnd: () => setTimeout(backToAttract, 4000) });
    }
    if (e.code === 'KeyM') Sfx.toggle();
    if (e.code === 'KeyF') document.documentElement.requestFullscreen?.();
  });

  addEventListener('pointerdown', () => {
    Sfx.unlock();
    $('sound')?.remove();
    document.body.classList.add('show-cursor');
    setTimeout(() => document.body.classList.remove('show-cursor'), 3000);
  }, { once: false });
})();
