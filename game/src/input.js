/* Twin Lanterns — input. Mouse clicks on either panel, and a keyboard
   crosshair (arrows/WASD to move, Space/Enter to check, Tab to switch panel).
   H spends a hint, P pauses, M mutes, R restarts the round. */
window.TL = window.TL || {};

/* Convert a mouse event on a canvas to scene coordinates (640x400 space). */
TL.eventToScene = function (canvas, ev) {
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) / rect.width * TL.PANEL_W;
  const y = (ev.clientY - rect.top) / rect.height * TL.PANEL_H;
  return { x: x, y: y };
};

/* Find the difference under a scene point, or -1. A click counts when it
   lands inside the difference's circle (generous radius for small targets). */
TL.pickDifference = function (scene, found, x, y) {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < scene.diffs.length; i++) {
    if (found.indexOf(i) !== -1) continue;
    const d = scene.diffs[i];
    const dx = x - d.x, dy = y - d.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const reach = Math.max(d.r + 8, 22);
    if (dist <= reach && dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
};

TL.Input = function (game) {
  this.game = game;
  this.cursor = { x: TL.PANEL_W / 2, y: TL.PANEL_H / 2, panel: 'a', visible: false };
  this.lastMiss = null; // {x, y, panel, at} for the red X flash
};

TL.Input.prototype.attach = function () {
  const self = this;
  const game = this.game;
  ['a', 'b'].forEach(function (variant) {
    const canvas = document.getElementById('panel-' + variant);
    canvas.addEventListener('click', function (ev) {
      if (game.state !== 'playing' || game.paused) return;
      const p = TL.eventToScene(canvas, ev);
      self.cursor = { x: p.x, y: p.y, panel: variant, visible: true };
      game.checkAt(p.x, p.y, variant);
    });
    canvas.addEventListener('mousemove', function (ev) {
      const p = TL.eventToScene(canvas, ev);
      self.cursor = { x: p.x, y: p.y, panel: variant, visible: true };
    });
    canvas.addEventListener('mouseleave', function () {
      self.cursor.visible = false;
    });
  });

  document.addEventListener('keydown', function (ev) {
    if (game.state === 'menu' && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();
      game.startRound(0);
      return;
    }
    if (game.state !== 'playing') return;
    const step = ev.shiftKey ? 24 : 10;
    let used = true;
    switch (ev.key) {
      case 'ArrowLeft': case 'a': case 'A':
        self.cursor.x = Math.max(0, self.cursor.x - step); break;
      case 'ArrowRight': case 'd': case 'D':
        self.cursor.x = Math.min(TL.PANEL_W, self.cursor.x + step); break;
      case 'ArrowUp': case 'w': case 'W':
        self.cursor.y = Math.max(0, self.cursor.y - step); break;
      case 'ArrowDown': case 's': case 'S':
        self.cursor.y = Math.min(TL.PANEL_H, self.cursor.y + step); break;
      case 'Tab':
        ev.preventDefault();
        self.cursor.panel = self.cursor.panel === 'a' ? 'b' : 'a'; break;
      case ' ': case 'Enter':
        ev.preventDefault();
        if (!game.paused) game.checkAt(self.cursor.x, self.cursor.y, self.cursor.panel);
        break;
      case 'h': case 'H':
        game.useHint(); break;
      case 'p': case 'P':
        game.togglePause(); break;
      case 'm': case 'M':
        game.toggleMute(); break;
      case 'r': case 'R':
        game.startRound(game.roundIndex); break;
      default:
        used = false;
    }
    if (used) {
      self.cursor.visible = true;
      const active = document.getElementById('panel-' + self.cursor.panel);
      if (active) active.classList.add('kb-focus');
      const other = document.getElementById('panel-' + (self.cursor.panel === 'a' ? 'b' : 'a'));
      if (other) other.classList.remove('kb-focus');
    }
  });
};
