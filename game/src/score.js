/* Twin Lanterns — scoring rules. One place owns points, combo, hints and the
   clock, so the game loop never computes them inline. */
window.TL = window.TL || {};

TL.Score = function (scene) {
  this.scene = scene;
  this.found = [];            // indexes of differences already found
  this.points = 0;
  this.combo = 0;             // consecutive finds without a miss
  this.bestCombo = 0;
  this.hintsLeft = 3;
  this.timeLeft = scene.time; // seconds
  this.misses = 0;
  this.hintsUsed = 0;
  this.startedAt = 0;
  this.lastTickSecond = -1;
};

TL.Score.prototype.remaining = function () {
  return this.scene.diffs.length - this.found.length;
};

TL.Score.prototype.isComplete = function () {
  return this.found.length >= this.scene.diffs.length;
};

/* A found difference: base 100, plus a combo bonus that grows with the streak. */
TL.Score.prototype.registerFind = function (index) {
  this.found.push(index);
  this.combo += 1;
  if (this.combo > this.bestCombo) this.bestCombo = this.combo;
  const gained = 100 + (this.combo - 1) * 25;
  this.points += gained;
  return gained;
};

/* A wrong click breaks the streak, costs 10 points and 3 seconds. */
TL.Score.prototype.registerMiss = function () {
  this.combo = 0;
  this.misses += 1;
  this.points = Math.max(0, this.points - 10);
  this.timeLeft = Math.max(0, this.timeLeft - 3);
};

/* A hint costs 25 points and one of the three hints of the round. It returns
   the index of a difference still hidden, or -1 when none is left. */
TL.Score.prototype.spendHint = function () {
  if (this.hintsLeft <= 0) return -1;
  const hidden = [];
  for (let i = 0; i < this.scene.diffs.length; i++) {
    if (this.found.indexOf(i) === -1) hidden.push(i);
  }
  if (hidden.length === 0) return -1;
  this.hintsLeft -= 1;
  this.hintsUsed += 1;
  this.points = Math.max(0, this.points - 25);
  return hidden[Math.floor(Math.random() * hidden.length)];
};

/* Time bonus when a round is cleared: 5 points per second left. */
TL.Score.prototype.timeBonus = function () {
  return Math.ceil(this.timeLeft) * 5;
};

/* Advance the clock by dt seconds. Returns 'tick' when a whole second passed
   while 10 or fewer remain, 'up' when the clock hit zero, else ''. */
TL.Score.prototype.advance = function (dt) {
  if (this.isComplete()) return '';
  this.timeLeft -= dt;
  if (this.timeLeft <= 0) {
    this.timeLeft = 0;
    return 'up';
  }
  const whole = Math.ceil(this.timeLeft);
  if (whole <= 10 && whole !== this.lastTickSecond) {
    this.lastTickSecond = whole;
    return 'tick';
  }
  return '';
};

TL.Score.prototype.formatTime = function () {
  const s = Math.max(0, Math.ceil(this.timeLeft));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
};
