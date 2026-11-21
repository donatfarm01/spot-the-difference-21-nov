/* Twin Lanterns — sound. Every sound is synthesized with WebAudio; the game
   ships no audio files and makes no network request. */
window.TL = window.TL || {};

TL.Sound = (function () {
  let ctx = null;
  let muted = false;
  let master = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, ac.currentTime + start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + start + dur);
    g.gain.setValueAtTime(0, ac.currentTime + start);
    g.gain.linearRampToValueAtTime(vol || 0.5, ac.currentTime + start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
    o.connect(g); g.connect(master);
    o.start(ac.currentTime + start);
    o.stop(ac.currentTime + start + dur + 0.05);
  }

  return {
    unlock: function () { ensure(); },
    setMuted: function (m) { muted = !!m; },
    isMuted: function () { return muted; },
    /* A bright two-note chime when a difference is found. */
    find: function (combo) {
      const lift = Math.min(combo || 0, 6) * 22;
      tone(660 + lift, 0, 0.16, 'sine', 0.55);
      tone(990 + lift, 0.09, 0.28, 'sine', 0.5);
      tone(1320 + lift, 0.18, 0.3, 'triangle', 0.22);
    },
    /* A dull low buzz for a wrong click. */
    wrong: function () {
      tone(150, 0, 0.18, 'sawtooth', 0.28, 90);
      tone(110, 0.02, 0.2, 'square', 0.14, 70);
    },
    /* A soft shimmer when a hint is spent. */
    hint: function () {
      tone(880, 0, 0.2, 'sine', 0.3);
      tone(1174, 0.1, 0.24, 'sine', 0.28);
      tone(1568, 0.2, 0.3, 'sine', 0.22);
    },
    /* A short tick when the clock is nearly out. */
    tick: function () { tone(980, 0, 0.06, 'square', 0.12); },
    /* A rising arpeggio for clearing a round. */
    roundClear: function () {
      [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * 0.11, 0.3, 'triangle', 0.4); });
    },
    /* A warm fanfare for finishing all three rounds. */
    victory: function () {
      [523, 659, 784, 1046, 784, 1046, 1318].forEach(function (f, i) {
        tone(f, i * 0.13, 0.34, 'triangle', 0.4);
      });
    },
    /* A falling phrase for running out of time. */
    timeUp: function () {
      [392, 330, 262, 196].forEach(function (f, i) { tone(f, i * 0.16, 0.32, 'sine', 0.4); });
    },
  };
})();
