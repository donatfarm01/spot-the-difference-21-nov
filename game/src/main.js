/* Twin Lanterns — game controller. Owns the state machine (menu, playing,
   round-clear, game-over, victory), the frame loop and the HUD. */
window.TL = window.TL || {};

TL.Game = function () {
  this.state = 'menu'; // menu | playing | roundClear | gameOver | victory
  this.roundIndex = 0;
  this.scene = TL.SCENES[0];
  this.score = new TL.Score(this.scene);
  this.totalPoints = 0;
  this.paused = false;
  this.lastTime = 0;
  this.hintMark = null; // {index, until} while a hint pulse shows
  this.missMarks = [];   // {x, y, panel, at} red X flashes
  this.input = new TL.Input(this);
  this.sound = TL.Sound;
  this.muted = false;
};

TL.Game.prototype.el = function (id) { return document.getElementById(id); };

TL.Game.prototype.boot = function () {
  const self = this;
  this.canvasA = this.el('panel-a');
  this.canvasB = this.el('panel-b');
  this.canvasA.width = TL.PANEL_W; this.canvasA.height = TL.PANEL_H;
  this.canvasB.width = TL.PANEL_W; this.canvasB.height = TL.PANEL_H;
  this.ctxA = this.canvasA.getContext('2d');
  this.ctxB = this.canvasB.getContext('2d');
  this.input.attach();

  this.el('btn-start').addEventListener('click', function () { self.sound.unlock(); self.startRound(0); });
  this.el('btn-hint').addEventListener('click', function () { self.useHint(); });
  this.el('btn-pause').addEventListener('click', function () { self.togglePause(); });
  this.el('btn-mute').addEventListener('click', function () { self.toggleMute(); });
  this.el('btn-next').addEventListener('click', function () { self.nextRound(); });
  this.el('btn-retry').addEventListener('click', function () { self.startRound(self.roundIndex); });
  this.el('btn-again').addEventListener('click', function () { self.startRound(0); });
  this.el('btn-menu').addEventListener('click', function () { self.showMenu(); });

  this.showMenu();
  requestAnimationFrame(function (now) { self.frame(now); });
};

TL.Game.prototype.showMenu = function () {
  this.state = 'menu';
  this.roundIndex = 0;
  this.totalPoints = 0;
  this.scene = TL.SCENES[0];
  this.score = new TL.Score(this.scene);
  this.el('overlay-menu').hidden = false;
  this.el('overlay-clear').hidden = true;
  this.el('overlay-over').hidden = true;
  this.el('overlay-win').hidden = true;
  this.setMessage('Find every difference between the two pictures. Good hunting!');
  this.updateHud();
};

TL.Game.prototype.startRound = function (index) {
  this.roundIndex = index;
  this.scene = TL.SCENES[index];
  this.score = new TL.Score(this.scene);
  this.state = 'playing';
  this.paused = false;
  this.hintMark = null;
  this.missMarks = [];
  this.input.cursor = { x: TL.PANEL_W / 2, y: TL.PANEL_H / 2, panel: 'a', visible: false };
  this.el('overlay-menu').hidden = true;
  this.el('overlay-clear').hidden = true;
  this.el('overlay-over').hidden = true;
  this.el('overlay-win').hidden = true;
  this.el('btn-pause').textContent = '⏸ Pause (P)';
  this.setMessage('Round ' + (index + 1) + ': ' + this.scene.name + ' — ' + this.scene.blurb);
  this.sound.unlock();
  this.updateHud();
};

TL.Game.prototype.nextRound = function () {
  if (this.roundIndex + 1 >= TL.SCENES.length) { this.showVictory(); return; }
  this.startRound(this.roundIndex + 1);
};

TL.Game.prototype.showVictory = function () {
  this.state = 'victory';
  this.el('win-total').textContent = this.totalPoints;
  this.el('overlay-win').hidden = false;
  this.sound.victory();
};

TL.Game.prototype.gameOver = function () {
  this.state = 'gameOver';
  this.el('over-found').textContent = this.score.found.length + ' / ' + this.scene.diffs.length;
  this.el('over-round').textContent = this.scene.name;
  this.el('overlay-over').hidden = false;
  this.sound.timeUp();
};

TL.Game.prototype.checkAt = function (x, y, panel) {
  if (this.state !== 'playing' || this.paused) return;
  const index = TL.pickDifference(this.scene, this.score.found, x, y);
  if (index >= 0) {
    const gained = this.score.registerFind(index);
    this.totalPoints += gained;
    this.sound.find(this.score.combo);
    const d = this.scene.diffs[index];
    this.setMessage('✓ ' + d.label + '!  +' + gained + ' points' +
      (this.score.combo > 1 ? '  (combo x' + this.score.combo + ')' : ''), 'good');
    if (this.score.isComplete()) {
      const bonus = this.score.timeBonus();
      this.totalPoints += bonus;
      this.state = 'roundClear';
      this.el('clear-round').textContent = this.scene.name;
      this.el('clear-found').textContent = this.scene.diffs.length + ' / ' + this.scene.diffs.length;
      this.el('clear-bonus').textContent = bonus;
      this.el('clear-total').textContent = this.totalPoints;
      this.el('btn-next').textContent = (this.roundIndex + 1 >= TL.SCENES.length)
        ? 'See your lanterns 🏮' : 'Next round →';
      this.el('overlay-clear').hidden = false;
      this.sound.roundClear();
    }
  } else {
    this.score.registerMiss();
    this.sound.wrong();
    this.missMarks.push({ x: x, y: y, panel: panel, at: performance.now() / 1000 });
    this.setMessage('✗ Nothing there — minus 10 points and 3 seconds.', 'bad');
    const boards = this.el('boards');
    boards.classList.remove('shake');
    void boards.offsetWidth;
    boards.classList.add('shake');
  }
  this.updateHud();
};

TL.Game.prototype.useHint = function () {
  if (this.state !== 'playing' || this.paused) return;
  const index = this.score.spendHint();
  if (index < 0) {
    this.setMessage(this.score.hintsLeft <= 0
      ? 'No hints left this round — trust your eyes!'
      : 'Nothing left to hint at.', 'bad');
    return;
  }
  this.sound.hint();
  this.hintMark = { index: index, until: performance.now() / 1000 + 3 };
  this.setMessage('💡 Hint: look near the glowing ring. (−25 points, ' +
    this.score.hintsLeft + ' hint' + (this.score.hintsLeft === 1 ? '' : 's') + ' left)');
  this.updateHud();
};

TL.Game.prototype.togglePause = function () {
  if (this.state !== 'playing') return;
  this.paused = !this.paused;
  this.el('btn-pause').textContent = this.paused ? '▶ Resume (P)' : '⏸ Pause (P)';
  this.setMessage(this.paused ? 'Paused — take a breath, the lanterns wait.'
    : 'Back to the hunt!');
};

TL.Game.prototype.toggleMute = function () {
  this.muted = !this.muted;
  this.sound.setMuted(this.muted);
  this.el('btn-mute').textContent = this.muted ? '🔇 Unmute (M)' : '🔊 Sound (M)';
};

TL.Game.prototype.setMessage = function (text, kind) {
  const m = this.el('message');
  m.textContent = text;
  m.className = kind || '';
  m.id = 'message';
};

TL.Game.prototype.updateHud = function () {
  this.el('hud-round').textContent = (this.roundIndex + 1) + ' / ' + TL.SCENES.length;
  this.el('hud-scene').textContent = this.scene.name;
  this.el('hud-found').textContent = this.score.found.length + ' / ' + this.scene.diffs.length;
  this.el('hud-time').textContent = this.score.formatTime();
  this.el('hud-score').textContent = this.totalPoints;
  this.el('hud-hints').textContent = this.score.hintsLeft;
  const timer = this.el('chip-time');
  if (this.score.timeLeft <= 10 && this.state === 'playing') timer.classList.add('timer-low');
  else timer.classList.remove('timer-low');
  const dots = this.el('found-dots');
  dots.innerHTML = '';
  for (let i = 0; i < this.scene.diffs.length; i++) {
    const dot = document.createElement('i');
    if (this.score.found.indexOf(i) !== -1) dot.className = 'on';
    dots.appendChild(dot);
  }
  this.el('btn-hint').disabled = this.state !== 'playing' || this.score.hintsLeft <= 0;
  this.el('btn-pause').disabled = this.state !== 'playing';
};

TL.Game.prototype.frame = function (now) {
  const self = this;
  const t = now / 1000;
  const dt = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.1) : 0;
  this.lastTime = now;

  if (this.state === 'playing' && !this.paused) {
    const ev = this.score.advance(dt);
    if (ev === 'tick') this.sound.tick();
    if (ev === 'up') {
      this.updateHud();
      this.gameOver();
    }
  }
  if (this.hintMark && t > this.hintMark.until) this.hintMark = null;
  this.missMarks = this.missMarks.filter(function (m) { return t - m.at < 0.7; });

  const cursorA = (this.input.cursor.panel === 'a') ? this.input.cursor : null;
  const cursorB = (this.input.cursor.panel === 'b') ? this.input.cursor : null;
  TL.drawPanel(this.ctxA, this.scene, 'a', t, this.score.found, this.hintMark, cursorA);
  TL.drawPanel(this.ctxB, this.scene, 'b', t, this.score.found, this.hintMark, cursorB);
  for (let i = 0; i < this.missMarks.length; i++) {
    const m = this.missMarks[i];
    const ctx = m.panel === 'a' ? this.ctxA : this.ctxB;
    TL.drawMissMark(ctx, m.x, m.y, t - m.at);
  }
  if (this.state === 'playing' && !this.paused) this.updateHudTimeOnly();
  requestAnimationFrame(function (n) { self.frame(n); });
};

TL.Game.prototype.updateHudTimeOnly = function () {
  this.el('hud-time').textContent = this.score.formatTime();
  const timer = this.el('chip-time');
  if (this.score.timeLeft <= 10) timer.classList.add('timer-low');
  else timer.classList.remove('timer-low');
};

document.addEventListener('DOMContentLoaded', function () {
  const game = new TL.Game();
  game.boot();
  // Exposed for play-testing and screenshots: the live game and its scenes.
  window.TwinLanterns = { game: game, scenes: TL.SCENES };
});
