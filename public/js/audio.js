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
