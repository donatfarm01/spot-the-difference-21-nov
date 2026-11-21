/* Twin Lanterns — rendering. Draws both panels from one scene, the golden
   markers on found differences, the hint pulse and the keyboard crosshair.
   Panels are 640x400 in scene space; the canvas scales to its CSS size. */
window.TL = window.TL || {};

TL.PANEL_W = 640;
TL.PANEL_H = 400;

/* Draw one panel: the scene variant plus its found markers. */
TL.drawPanel = function (ctx, scene, variant, t, found, hintMark, cursor) {
  scene.draw(ctx, variant, t);
  for (let i = 0; i < found.length; i++) {
    TL.drawMarker(ctx, scene.diffs[found[i]], t);
  }
  if (hintMark && hintMark.index >= 0) {
    const d = scene.diffs[hintMark.index];
    const pulse = 0.5 + 0.5 * Math.sin(t * 6);
    ctx.save();
    ctx.globalAlpha = 0.35 + pulse * 0.45;
    ctx.strokeStyle = '#7ddcff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r + 6 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (cursor && cursor.visible) {
    TL.drawCursor(ctx, cursor);
  }
};

/* A golden ring with a check — the satisfying mark on every find. */
TL.drawMarker = function (ctx, d, t) {
  const wobble = Math.sin(t * 2 + d.x) * 1.5;
  ctx.save();
  const glow = ctx.createRadialGradient(d.x, d.y, 2, d.x, d.y, d.r + 14);
  glow.addColorStop(0, 'rgba(255, 211, 77, 0.5)');
  glow.addColorStop(1, 'rgba(255, 211, 77, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(d.x, d.y, d.r + 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(d.x, d.y, d.r + wobble, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#fff3c4';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(d.x, d.y, d.r + wobble - 4, 0, Math.PI * 2); ctx.stroke();
  // Check mark across the ring.
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const r = d.r * 0.55;
  ctx.beginPath();
  ctx.moveTo(d.x - r, d.y + 1);
  ctx.lineTo(d.x - r * 0.25, d.y + r * 0.7);
  ctx.lineTo(d.x + r, d.y - r * 0.7);
  ctx.stroke();
  ctx.restore();
};

/* The keyboard crosshair: a small gold cross with a circle. */
TL.drawCursor = function (ctx, cursor) {
  ctx.save();
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 12, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cursor.x - 18, cursor.y); ctx.lineTo(cursor.x - 6, cursor.y);
  ctx.moveTo(cursor.x + 6, cursor.y); ctx.lineTo(cursor.x + 18, cursor.y);
  ctx.moveTo(cursor.x, cursor.y - 18); ctx.lineTo(cursor.x, cursor.y - 6);
  ctx.moveTo(cursor.x, cursor.y + 6); ctx.lineTo(cursor.x, cursor.y + 18);
  ctx.stroke();
  TL.fillCircle(ctx, cursor.x, cursor.y, 2, '#ffd34d');
  ctx.restore();
};

/* A wrong click leaves a brief red X where the player clicked. */
TL.drawMissMark = function (ctx, x, y, age) {
  const a = Math.max(0, 1 - age / 0.7);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = '#ff5d5d';
  ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
};
