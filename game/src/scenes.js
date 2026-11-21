/* Twin Lanterns — scene art.
   Every scene is drawn fresh in code (no image files): one draw function per
   scene takes a variant ('a' or 'b') and the clock, so the two panels are the
   same picture except for the deliberate differences. A seeded random keeps
   the base layout identical on both panels; only time-based motion (glow,
   fireflies, smoke, swimming koi) moves with t. */
window.TL = window.TL || {};

/* Deterministic random: same seed, same stars every frame and every panel. */
TL.mulberry = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

TL.fillCircle = function (c, x, y, r, color) {
  c.fillStyle = color;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
};

TL.ellipse = function (c, x, y, rx, ry, color) {
  c.fillStyle = color;
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
};

TL.rr = function (c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

/* A glowing paper lantern, gently swaying. */
TL.lantern = function (c, x, y, s, color, t, phase) {
  const sway = Math.sin(t * 0.9 + phase) * 2;
  const gx = x + sway;
  c.save();
  c.strokeStyle = '#2a1a10'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(x, y - 26 * s); c.lineTo(gx, y - 12 * s); c.stroke();
  const glow = c.createRadialGradient(gx, y, 2, gx, y, 34 * s);
  glow.addColorStop(0, 'rgba(255, 200, 90, 0.55)');
  glow.addColorStop(1, 'rgba(255, 200, 90, 0)');
  c.fillStyle = glow;
  c.beginPath(); c.arc(gx, y, 34 * s, 0, Math.PI * 2); c.fill();
  c.fillStyle = color;
  c.beginPath(); c.ellipse(gx, y, 13 * s, 16 * s, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(60, 20, 10, 0.55)'; c.lineWidth = 1.2;
  for (let i = -2; i <= 2; i++) {
    c.beginPath(); c.ellipse(gx, y, (13 - Math.abs(i) * 3) * s, 16 * s, 0, 0, Math.PI * 2); c.stroke();
  }
  c.fillStyle = '#3a2410';
  c.fillRect(gx - 5 * s, y - 19 * s, 10 * s, 4 * s);
  c.fillRect(gx - 4 * s, y + 15 * s, 8 * s, 4 * s);
  c.fillStyle = '#ffe9a8';
  c.font = 'bold ' + Math.round(11 * s) + 'px sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('福', gx, y + 1);
  c.restore();
};

/* A sitting cat, drawn as a silhouette with a curled tail. */
TL.cat = function (c, x, y, s, color) {
  c.save();
  c.fillStyle = color;
  c.beginPath(); c.ellipse(x, y - 4 * s, 13 * s, 11 * s, 0, 0, Math.PI * 2); c.fill(); // body
  c.beginPath(); c.arc(x + 3 * s, y - 17 * s, 8 * s, 0, Math.PI * 2); c.fill(); // head
  c.beginPath(); // ears
  c.moveTo(x - 3 * s, y - 22 * s); c.lineTo(x - 1 * s, y - 29 * s); c.lineTo(x + 2 * s, y - 23 * s); c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(x + 5 * s, y - 23 * s); c.lineTo(x + 8 * s, y - 29 * s); c.lineTo(x + 11 * s, y - 22 * s); c.closePath(); c.fill();
  c.strokeStyle = color; c.lineWidth = 3.4 * s; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x + 11 * s, y + 2 * s); c.quadraticCurveTo(x + 22 * s, y - 2 * s, x + 19 * s, y - 13 * s); c.stroke(); // tail
  c.fillStyle = '#ffd34d';
  TL.fillCircle(c, x + 5 * s, y - 18 * s, 1.4 * s, '#ffd34d'); // eye glint
  c.restore();
};

/* A koi fish, angled as it swims. */
TL.koi = function (c, x, y, s, angle, body, patch) {
  c.save();
  c.translate(x, y); c.rotate(angle);
  c.fillStyle = body;
  c.beginPath(); c.ellipse(0, 0, 16 * s, 6.5 * s, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(-13 * s, 0); c.lineTo(-24 * s, -8 * s); c.lineTo(-24 * s, 8 * s); c.closePath(); c.fill(); // tail
  c.fillStyle = patch;
  c.beginPath(); c.ellipse(2 * s, -2 * s, 7 * s, 4 * s, 0.3, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-6 * s, 2 * s, 5 * s, 3 * s, -0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1c2733';
  TL.fillCircle(c, 10 * s, -2 * s, 1.3 * s, '#1c2733'); // eye
  c.restore();
};

/* ------------------------------------------------------------------ */
/* Scene 1 — Lantern Market. 5 differences, 180 seconds.               */
TL.drawLanternMarket = function (c, variant, t) {
  const W = 640, H = 400;
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#171238'); sky.addColorStop(0.55, '#3a1e5e'); sky.addColorStop(1, '#8a4426');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);

  const stars = TL.mulberry(101);
  for (let i = 0; i < 46; i++) {
    const sx = stars() * W, sy = stars() * 130;
    c.globalAlpha = 0.35 + stars() * 0.55;
    TL.fillCircle(c, sx, sy, 0.8 + stars() * 1.1, '#fff6d8');
  }
  c.globalAlpha = 1;

  // Moon: full in A, crescent in B.
  if (variant === 'a') {
    TL.fillCircle(c, 540, 58, 26, '#ffedb8');
    TL.fillCircle(c, 532, 52, 5, '#e8c97e'); TL.fillCircle(c, 549, 66, 4, '#e8c97e');
    TL.fillCircle(c, 545, 46, 3, '#e8c97e');
  } else {
    TL.fillCircle(c, 540, 58, 26, '#ffedb8');
    TL.fillCircle(c, 551, 52, 23, '#2c1c50');
  }

  // Distant rooftops.
  c.fillStyle = '#241a44';
  c.beginPath();
  c.moveTo(0, 180);
  c.lineTo(70, 138); c.lineTo(140, 180); c.lineTo(210, 142); c.lineTo(290, 180);
  c.lineTo(360, 136); c.lineTo(430, 180); c.lineTo(510, 140); c.lineTo(580, 180);
  c.lineTo(640, 150); c.lineTo(640, 400); c.lineTo(0, 400); c.closePath(); c.fill();

  // Festival string with paper lanterns.
  c.strokeStyle = '#120c22'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, 34); c.quadraticCurveTo(320, 78, 640, 30); c.stroke();
  const cols = ['#e8452c', '#f2b544', '#ef7d2e', '#e8452c', '#f2b544', '#ef7d2e', '#e8452c'];
  const lxs = [70, 150, 230, 310, 390, 470, 550];
  for (let i = 0; i < lxs.length; i++) {
    const ly = 44 + Math.sin((lxs[i] / 640) * Math.PI) * 34;
    const col = (variant === 'b' && i === 3) ? '#2fa8a0' : cols[i];
    TL.lantern(c, lxs[i], ly + 14, 1, col, t, i * 1.3);
  }

  // Bunting flags.
  const bunt = ['#e8452c', '#f2b544', '#7ddc8a', '#5aa9e6'];
  c.strokeStyle = '#120c22'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(0, 118); c.quadraticCurveTo(320, 140, 640, 112); c.stroke();
  for (let i = 0; i < 16; i++) {
    const bx = 20 + i * 40, by = 122 + Math.sin((bx / 640) * Math.PI) * 10;
    c.fillStyle = bunt[i % 4];
    c.beginPath(); c.moveTo(bx - 8, by); c.lineTo(bx + 8, by); c.lineTo(bx, by + 14); c.closePath(); c.fill();
  }

  // Cobblestone street.
  c.fillStyle = '#4a3550'; c.fillRect(0, 300, W, 100);
  const stones = TL.mulberry(77);
  for (let i = 0; i < 90; i++) {
    const sx = stones() * W, sy = 306 + stones() * 88;
    c.fillStyle = stones() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
    c.beginPath(); c.ellipse(sx, sy, 14 + stones() * 10, 5 + stones() * 3, 0, 0, Math.PI * 2); c.fill();
  }

  // --- Left stall: fruit. ---
  c.fillStyle = '#5b2d1e';
  c.fillRect(58, 196, 8, 108); c.fillRect(234, 196, 8, 108);
  for (let i = 0; i < 7; i++) { // striped awning
    c.fillStyle = i % 2 ? '#f5ead6' : '#c23b2e';
    c.beginPath(); c.moveTo(50 + i * 28, 168); c.lineTo(78 + i * 28, 168); c.lineTo(72 + i * 28, 198); c.lineTo(44 + i * 28, 198); c.closePath(); c.fill();
  }
  c.fillStyle = '#7a4a28'; c.fillRect(52, 252, 190, 52); // counter
  c.fillStyle = '#8a5a32'; c.fillRect(48, 246, 198, 10);
  const fruit = TL.mulberry(55);
  for (let i = 0; i < 5; i++) TL.fillCircle(c, 78 + i * 16, 240, 8, '#ef7d2e'); // oranges row
  for (let i = 0; i < 4; i++) TL.fillCircle(c, 168 + i * 15, 240, 7, '#d9382b'); // apples row
  // The one fruit that changes: orange in A, green apple in B.
  TL.fillCircle(c, 180, 252, 9, variant === 'a' ? '#ef7d2e' : '#7dc24a');
  c.fillStyle = '#7a4a28'; c.font = 'bold 13px sans-serif'; c.textAlign = 'center';
  c.fillText('BUAH SEGAR', 147, 292);

  // --- Right stall: noodles. ---
  c.fillStyle = '#1e3a44';
  c.fillRect(408, 196, 8, 108); c.fillRect(584, 196, 8, 108);
  for (let i = 0; i < 7; i++) {
    c.fillStyle = i % 2 ? '#f5ead6' : '#2fa8a0';
    c.beginPath(); c.moveTo(400 + i * 28, 168); c.lineTo(428 + i * 28, 168); c.lineTo(422 + i * 28, 198); c.lineTo(394 + i * 28, 198); c.closePath(); c.fill();
  }
  c.fillStyle = '#274b34'; c.fillRect(402, 252, 190, 52);
  c.fillStyle = '#35684a'; c.fillRect(398, 246, 198, 10);
  for (let i = 0; i < 3; i++) { // steaming bowls
    const bx = 440 + i * 55;
    TL.ellipse(c, bx, 240, 20, 8, '#f5ead6');
    TL.ellipse(c, bx, 238, 14, 5, '#e8b64c');
    c.strokeStyle = 'rgba(245,234,214,0.75)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(bx - 6, 232); c.quadraticCurveTo(bx - 10 + Math.sin(t * 2 + i) * 3, 220, bx - 4, 210); c.stroke();
    c.beginPath(); c.moveTo(bx + 6, 232); c.quadraticCurveTo(bx + 10 + Math.cos(t * 2 + i) * 3, 220, bx + 4, 210); c.stroke();
  }
  // Hanging sign: NOODLE in A, NOODLES in B.
  c.fillStyle = '#f5ead6'; TL.rr(c, 424, 200, 92, 26, 5); c.fill();
  c.fillStyle = '#8a2f24'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(variant === 'a' ? 'NOODLE' : 'NOODLES', 470, 214);
  c.textBaseline = 'alphabetic';

  // Cat on a crate (A only) — a crate stands there either way.
  c.fillStyle = '#6e4a26'; c.fillRect(96, 330, 46, 34);
  c.strokeStyle = '#4e3016'; c.lineWidth = 2; c.strokeRect(96, 330, 46, 34);
  c.beginPath(); c.moveTo(96, 347); c.lineTo(142, 347); c.stroke();
  if (variant === 'a') TL.cat(c, 119, 330, 1, '#2b2033');

  // Scattered petals on the street.
  const petals = TL.mulberry(31);
  for (let i = 0; i < 12; i++) {
    TL.ellipse(c, petals() * W, 330 + petals() * 60, 4, 2.5, 'rgba(242, 120, 140, 0.7)');
  }
};

/* ------------------------------------------------------------------ */
/* Scene 2 — Koi Pond Garden. 7 differences, 150 seconds.              */
TL.drawKoiGarden = function (c, variant, t) {
  const W = 640, H = 400;
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0e2f3d'); sky.addColorStop(0.55, '#2b5a54'); sky.addColorStop(1, '#7a7a52');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  TL.fillCircle(c, 430, 58, 24, '#ffe9b0');
  TL.fillCircle(c, 422, 52, 4, '#e8c97e'); TL.fillCircle(c, 438, 64, 3, '#e8c97e');
  c.fillStyle = 'rgba(245,234,214,0.16)';
  TL.ellipse(c, 150, 70, 60, 12, 'rgba(245,234,214,0.16)');
  TL.ellipse(c, 300, 44, 80, 10, 'rgba(245,234,214,0.12)');
  TL.ellipse(c, 520, 110, 56, 9, 'rgba(245,234,214,0.10)');

  // Distant hill and bamboo.
  c.fillStyle = '#1d4038';
  c.beginPath(); c.moveTo(0, 250); c.quadraticCurveTo(200, 190, 400, 240); c.quadraticCurveTo(540, 270, 640, 220); c.lineTo(640, 400); c.lineTo(0, 400); c.closePath(); c.fill();
  const bamboo = TL.mulberry(91);
  for (let i = 0; i < 7; i++) {
    const bx = 20 + bamboo() * 90;
    c.strokeStyle = '#2e6b4f'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(bx, 260); c.quadraticCurveTo(bx + 8, 190, bx - 4, 130 + bamboo() * 40); c.stroke();
  }

  // Willow, left. In B one branch reaches further right.
  c.strokeStyle = '#3d5a2e'; c.lineWidth = 7; c.lineCap = 'round';
  c.beginPath(); c.moveTo(96, 250); c.quadraticCurveTo(84, 150, 108, 60); c.stroke();
  const willow = TL.mulberry(41);
  c.lineWidth = 2.4;
  for (let i = 0; i < 9; i++) {
    const wx = 60 + willow() * 110, drop = 90 + willow() * 110;
    c.beginPath(); c.moveTo(100 + (willow() - 0.5) * 30, 80);
    c.quadraticCurveTo(wx, 130, wx + (willow() - 0.5) * 26, 80 + drop); c.stroke();
    c.fillStyle = '#5a8a3c';
    c.beginPath(); c.ellipse(wx, 80 + drop, 5, 9, 0.2, 0, Math.PI * 2); c.fill();
  }
  if (variant === 'b') {
    c.strokeStyle = '#3d5a2e'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(120, 66); c.quadraticCurveTo(230, 60, 308, 76); c.stroke();
    c.fillStyle = '#5a8a3c';
    c.beginPath(); c.ellipse(310, 80, 5, 9, 0.2, 0, Math.PI * 2); c.fill();
  }

  // Pagoda, right, with one window that is lit in A and dark in B.
  const px = 500, py = 96;
  c.fillStyle = '#7a2e22';
  TL.rr(c, px - 46, py + 108, 92, 56, 4); c.fill();
  for (let tier = 0; tier < 3; tier++) {
    const ty = py + 84 - tier * 36, tw = 96 - tier * 14;
    c.fillStyle = '#8a3a28';
    c.beginPath();
    c.moveTo(px - tw / 2, ty); c.lineTo(px + tw / 2, ty);
    c.lineTo(px + tw / 2 + 12, ty + 12); c.lineTo(px - tw / 2 - 12, ty + 12);
    c.closePath(); c.fill();
    c.fillStyle = '#5e2418';
    c.fillRect(px - tw / 2 + 8, ty + 12, tw - 16, 24);
  }
  c.fillStyle = '#3a1a12';
  c.beginPath(); c.moveTo(px - 14, py - 26); c.lineTo(px + 14, py - 26); c.lineTo(px, py - 46); c.closePath(); c.fill();
  TL.fillCircle(c, px, py - 48, 4, '#f2b544');
  // Gold trim under each eave and a small arched door, so the pagoda reads
  // as a building and not a stack of flat blocks.
  c.strokeStyle = '#f2b544'; c.lineWidth = 1.6;
  for (let tier = 0; tier < 3; tier++) {
    const ty = py + 84 - tier * 36, tw = 96 - tier * 14;
    c.beginPath(); c.moveTo(px - tw / 2 - 10, ty + 12); c.lineTo(px + tw / 2 + 10, ty + 12); c.stroke();
  }
  c.fillStyle = '#4a1e14';
  c.beginPath(); c.arc(px, py + 150, 10, Math.PI, 0); c.fill();
  c.fillRect(px - 10, py + 150, 20, 14);
  c.strokeStyle = '#f2b544'; c.lineWidth = 1.4;
  c.beginPath(); c.arc(px, py + 150, 10, Math.PI, 0); c.stroke();
  c.fillStyle = variant === 'a' ? '#ffd34d' : '#2a1a20';
  TL.rr(c, px - 24, py + 118, 16, 22, 3); c.fill();
  c.fillStyle = variant === 'a' ? '#2a1a20' : '#5a4a52';
  TL.rr(c, px + 10, py + 118, 16, 22, 3); c.fill();
  if (variant === 'a') {
    const g = c.createRadialGradient(px - 16, py + 129, 2, px - 16, py + 129, 26);
    g.addColorStop(0, 'rgba(255,211,77,0.5)'); g.addColorStop(1, 'rgba(255,211,77,0)');
    c.fillStyle = g; c.beginPath(); c.arc(px - 16, py + 129, 26, 0, Math.PI * 2); c.fill();
  }

  // Pond.
  const water = c.createLinearGradient(0, 250, 0, 400);
  water.addColorStop(0, '#2e7d8a'); water.addColorStop(1, '#14424e');
  c.fillStyle = water;
  c.beginPath(); c.ellipse(320, 330, 330, 74, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(245,234,214,0.25)'; c.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const ry = 292 + i * 18, rx = 90 + i * 40;
    c.beginPath(); c.ellipse(320, ry, rx + Math.sin(t + i) * 4, 6, 0, 0.3, Math.PI - 0.3); c.stroke();
  }
  // Lily pads and lotus flowers.
  TL.ellipse(c, 210, 350, 26, 9, '#3f7d44');
  TL.ellipse(c, 430, 356, 22, 8, '#3f7d44');
  TL.ellipse(c, 96, 336, 20, 7, '#3f7d44');
  const lotus = function (x, y, petal) {
    c.fillStyle = petal;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      c.beginPath(); c.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 7, 7, 4.5, a, 0, Math.PI * 2); c.fill();
    }
    TL.fillCircle(c, x, y, 4, '#ffd34d');
  };
  lotus(150, 320, variant === 'a' ? '#ef7d9e' : '#f5ead6');
  lotus(300, 344, '#ef7d9e');
  // Stone lantern: flame inside in B only.
  c.fillStyle = '#8a8578';
  c.fillRect(78, 196, 26, 10); c.fillRect(84, 206, 14, 16); c.fillRect(76, 222, 30, 8);
  c.fillRect(84, 230, 14, 22); c.fillRect(76, 252, 30, 8);
  if (variant === 'b') {
    TL.fillCircle(c, 91, 196, 9, '#ffb347');
    const g = c.createRadialGradient(91, 196, 2, 91, 196, 30);
    g.addColorStop(0, 'rgba(255,179,71,0.55)'); g.addColorStop(1, 'rgba(255,179,71,0)');
    c.fillStyle = g; c.beginPath(); c.arc(91, 196, 30, 0, Math.PI * 2); c.fill();
  } else {
    TL.fillCircle(c, 91, 196, 5, '#3a3230');
  }
  // Arched bridge.
  c.strokeStyle = '#7a3b22'; c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(238, 296); c.quadraticCurveTo(320, 232, 402, 296); c.stroke();
  for (let i = 0; i <= 8; i++) { // planks
    const u = i / 8, bx = 238 + u * 164;
    const by = 296 - Math.sin(u * Math.PI) * 34;
    c.fillStyle = (variant === 'b' && i === 4) ? '#c23b2e' : '#a86a3a';
    c.fillRect(bx - 9, by - 4, 18, 8);
  }
  c.strokeStyle = '#5e2c18'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(238, 288); c.quadraticCurveTo(320, 224, 402, 288); c.stroke();
  for (let i = 0; i <= 4; i++) {
    const u = i / 4, bx = 238 + u * 164, by = 288 - Math.sin(u * Math.PI) * 34;
    c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by - 16); c.stroke();
  }
  // Koi: three always, a fourth in B.
  TL.koi(c, 250 + Math.sin(t * 0.5) * 14, 318, 1, 0.25, '#ef7d2e', '#f5ead6');
  TL.koi(c, 380 - Math.sin(t * 0.4 + 2) * 12, 348, 0.9, Math.PI - 0.2, '#f5ead6', '#e8452c');
  TL.koi(c, 320 + Math.cos(t * 0.6) * 10, 366, 0.8, -0.15, '#f2b544', '#2b2b2b');
  if (variant === 'b') TL.koi(c, 430, 310, 0.9, 0.5, '#ef7d2e', '#f5ead6');
  // Butterfly (B only) fluttering near the pagoda.
  if (variant === 'b') {
    const bx = 450 + Math.sin(t * 1.6) * 6, by = 120 + Math.cos(t * 1.3) * 5, flap = Math.sin(t * 9) * 0.5;
    c.fillStyle = '#c98ae6';
    c.beginPath(); c.ellipse(bx - 5, by, 6, 4 + flap * 3, -0.4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(bx + 5, by, 6, 4 + flap * 3, 0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2b2b2b'; c.fillRect(bx - 1, by - 4, 2, 9);
  }
  // Fireflies drifting.
  const flies = TL.mulberry(202);
  for (let i = 0; i < 9; i++) {
    const fx = 60 + flies() * 520, fy = 60 + flies() * 160;
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7);
    c.globalAlpha = 0.25 + tw * 0.6;
    TL.fillCircle(c, fx + Math.sin(t + i) * 5, fy + Math.cos(t * 0.8 + i) * 4, 2.4, '#eaffb0');
  }
  c.globalAlpha = 1;
};

/* ------------------------------------------------------------------ */
/* Scene 3 — Starlight Rooftops. 10 differences, 120 seconds.          */
TL.drawRooftops = function (c, variant, t) {
  const W = 640, H = 400;
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0d2e'); sky.addColorStop(0.6, '#1c2350'); sky.addColorStop(1, '#3c2a5e');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  const stars = TL.mulberry(303);
  for (let i = 0; i < 90; i++) {
    const sx = stars() * W, sy = stars() * 210;
    c.globalAlpha = 0.3 + stars() * 0.6;
    TL.fillCircle(c, sx, sy, 0.7 + stars() * 1.2, '#fff6d8');
  }
  c.globalAlpha = 1;
  // One bright star shines in A only.
  if (variant === 'a') {
    TL.fillCircle(c, 560, 48, 3, '#ffffff');
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(548, 48); c.lineTo(572, 48); c.moveTo(560, 36); c.lineTo(560, 60); c.stroke();
  }
  // Crescent moon.
  TL.fillCircle(c, 80, 60, 22, '#ffedb8');
  TL.fillCircle(c, 90, 54, 19, '#1a1c46');

  // Paper plane (A only).
  if (variant === 'a') {
    const px = 95 + Math.sin(t * 0.7) * 4, py = 130 + Math.cos(t * 0.5) * 3;
    c.fillStyle = '#f5ead6';
    c.beginPath(); c.moveTo(px - 14, py); c.lineTo(px + 14, py - 6); c.lineTo(px + 6, py + 4); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(245,234,214,0.5)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(px - 26, py + 12); c.quadraticCurveTo(px - 18, py + 6, px - 14, py); c.stroke();
  }

  // Houses: walls, pitched roofs, windows, chimneys.
  const houses = [
    { x: 24, w: 140, roof: '#8a3b2e', wall: '#4a3550' },
    { x: 176, w: 140, roof: '#2f6b7a', wall: '#3d4458' },
    { x: 328, w: 140, roof: '#7a5a2e', wall: '#4e3d55' },
    { x: 480, w: 140, roof: '#5a3a6e', wall: '#3a3a4e' },
  ];
  for (let h = 0; h < houses.length; h++) {
    const hs = houses[h], top = 210, base = 392;
    c.fillStyle = hs.wall; c.fillRect(hs.x, top, hs.w, base - top);
    c.fillStyle = hs.roof;
    c.beginPath();
    c.moveTo(hs.x - 10, top); c.lineTo(hs.x + hs.w / 2, top - 62); c.lineTo(hs.x + hs.w + 10, top);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const ry = top - i * 15;
      c.beginPath(); c.moveTo(hs.x + 8, ry); c.lineTo(hs.x + hs.w - 8, ry); c.stroke();
    }
    // Windows: two per house; one is the lit/dark difference.
    for (let w = 0; w < 2; w++) {
      const wx = hs.x + 22 + w * 62, wy = top + 34;
      const isDiff = (h === 1 && w === 0);
      const lit = isDiff ? (variant === 'a') : ((h + w) % 2 === 0);
      c.fillStyle = lit ? '#ffd34d' : '#241a30';
      TL.rr(c, wx, wy, 30, 34, 3); c.fill();
      if (lit) {
        const g = c.createRadialGradient(wx + 15, wy + 17, 2, wx + 15, wy + 17, 30);
        g.addColorStop(0, 'rgba(255,211,77,0.35)'); g.addColorStop(1, 'rgba(255,211,77,0)');
        c.fillStyle = g; c.beginPath(); c.arc(wx + 15, wy + 17, 30, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = '#1c1426'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(wx + 15, wy); c.lineTo(wx + 15, wy + 34); c.stroke();
    }
    // A small door at the foot of each house, so the row reads as homes.
    c.fillStyle = '#241a30';
    TL.rr(c, hs.x + hs.w / 2 - 13, base - 46, 26, 46, 4); c.fill();
    c.strokeStyle = '#f2b544'; c.lineWidth = 1.4;
    TL.rr(c, hs.x + hs.w / 2 - 13, base - 46, 26, 46, 4); c.stroke();
    TL.fillCircle(c, hs.x + hs.w / 2 + 8, base - 24, 2, '#f2b544');
  }
  // Chimney + smoke on house 1 (smoke in A only).
  c.fillStyle = '#3a2a3e'; c.fillRect(128, 128, 22, 40);
  c.fillStyle = '#2a1e2e'; c.fillRect(124, 124, 30, 8);
  if (variant === 'a') {
    c.fillStyle = 'rgba(220,220,235,0.5)';
    for (let i = 0; i < 3; i++) {
      const sy = 118 - i * 16 - (t * 6 % 16);
      const sx = 139 + Math.sin(t + i * 2) * 6 + i * 5;
      TL.fillCircle(c, sx, sy, 9 + i * 3, 'rgba(220,220,235,0.35)');
    }
  }
  // Antenna on house 2 (A only).
  if (variant === 'a') {
    c.strokeStyle = '#c9c9d8'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(205, 150); c.lineTo(205, 68); c.stroke();
    c.beginPath(); c.moveTo(193, 80); c.lineTo(217, 80); c.stroke();
    c.beginPath(); c.moveTo(197, 92); c.lineTo(213, 92); c.stroke();
    TL.fillCircle(c, 205, 66, 3, '#ff5d5d');
  }
  // Roof tile that changes colour, on house 3.
  c.fillStyle = variant === 'a' ? '#c23b2e' : '#2fa8a0';
  c.beginPath(); c.moveTo(408, 226); c.lineTo(432, 226); c.lineTo(428, 238); c.lineTo(412, 238); c.closePath(); c.fill();
  // Cat on house 3's roof (A only).
  if (variant === 'a') TL.cat(c, 480, 178, 0.9, '#171022');
  // Clothesline between houses 2 and 3, with one shirt that changes colour.
  c.strokeStyle = '#c9c9d8'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(318, 138); c.quadraticCurveTo(360, 152, 402, 136); c.stroke();
  const shirt = function (x, y, color) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x - 11, y); c.lineTo(x - 4, y); c.lineTo(x - 4, y + 5); c.lineTo(x + 4, y + 5); c.lineTo(x + 4, y);
    c.lineTo(x + 11, y); c.lineTo(x + 9, y + 24); c.lineTo(x - 9, y + 24); c.closePath(); c.fill();
  };
  shirt(332, 142, '#7ddc8a');
  shirt(350, 148, variant === 'a' ? '#e8452c' : '#5aa9e6');
  shirt(372, 142, '#f2b544');
  // Water tower, right: lamp on in A, off in B.
  c.strokeStyle = '#5a4a6e'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(566, 392); c.lineTo(576, 300); c.moveTo(604, 392); c.lineTo(594, 300); c.stroke();
  c.fillStyle = '#6e5a8a'; TL.rr(c, 562, 258, 46, 44, 8); c.fill();
  c.fillStyle = '#4e3f66';
  c.beginPath(); c.moveTo(562, 258); c.lineTo(608, 258); c.lineTo(596, 240); c.lineTo(574, 240); c.closePath(); c.fill();
  if (variant === 'a') {
    TL.fillCircle(c, 585, 180, 5, '#ffd34d');
    const g = c.createRadialGradient(585, 180, 2, 585, 180, 26);
    g.addColorStop(0, 'rgba(255,211,77,0.55)'); g.addColorStop(1, 'rgba(255,211,77,0)');
    c.fillStyle = g; c.beginPath(); c.arc(585, 180, 26, 0, Math.PI * 2); c.fill();
  } else {
    TL.fillCircle(c, 585, 180, 5, '#2a2438');
  }
  // Flower pot on house 2's windowsill (A only).
  if (variant === 'a') {
    c.fillStyle = '#c23b2e';
    c.beginPath(); c.moveTo(298, 282); c.lineTo(314, 282); c.lineTo(311, 296); c.lineTo(301, 296); c.closePath(); c.fill();
    c.fillStyle = '#7ddc8a';
    TL.fillCircle(c, 302, 280, 3, '#7ddc8a'); TL.fillCircle(c, 310, 278, 3, '#7ddc8a'); TL.fillCircle(c, 306, 276, 3, '#7ddc8a');
  }
  // Street at the bottom with a sleepy dog silhouette.
  c.fillStyle = '#171022'; c.fillRect(0, 392, W, 8);
  c.fillStyle = '#241a33';
  c.beginPath(); c.ellipse(80, 388, 22, 8, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(100, 382, 7, 0, Math.PI * 2); c.fill();
};

/* ------------------------------------------------------------------ */
/* The three rounds, in order. diffs share one coordinate space (640x400)
   on both panels; a difference is found by clicking either panel. */
TL.SCENES = [
  {
    id: 'lantern-market', name: 'Lantern Market', time: 180,
    blurb: 'A lantern-lit night market. Five things differ between the panels.',
    draw: TL.drawLanternMarket,
    diffs: [
      { x: 540, y: 58, r: 26, label: 'The moon changed shape' },
      { x: 310, y: 88, r: 20, label: 'A lantern changed colour' },
      { x: 120, y: 330, r: 26, label: 'The cat vanished' },
      { x: 180, y: 252, r: 18, label: 'A fruit changed' },
      { x: 470, y: 212, r: 22, label: 'The sign gained a letter' },
    ],
  },
  {
    id: 'koi-garden', name: 'Koi Pond Garden', time: 150,
    blurb: 'A quiet garden pond under the moon. Seven things differ.',
    draw: TL.drawKoiGarden,
    diffs: [
      { x: 430, y: 310, r: 20, label: 'An extra koi appeared' },
      { x: 150, y: 320, r: 18, label: 'A lotus changed colour' },
      { x: 540, y: 130, r: 16, label: 'A pagoda window went dark' },
      { x: 90, y: 195, r: 18, label: 'The stone lantern lit up' },
      { x: 310, y: 80, r: 22, label: 'A willow branch grew' },
      { x: 450, y: 120, r: 16, label: 'A butterfly appeared' },
      { x: 320, y: 262, r: 18, label: 'A bridge plank changed colour' },
    ],
  },
  {
    id: 'starlight-rooftops', name: 'Starlight Rooftops', time: 120,
    blurb: 'Rooftops under a field of stars. Ten things differ — look close.',
    draw: TL.drawRooftops,
    diffs: [
      { x: 140, y: 85, r: 20, label: 'The chimney smoke vanished' },
      { x: 255, y: 205, r: 16, label: 'A window went dark' },
      { x: 480, y: 175, r: 20, label: 'The rooftop cat vanished' },
      { x: 560, y: 48, r: 12, label: 'A bright star vanished' },
      { x: 350, y: 148, r: 18, label: 'A shirt changed colour' },
      { x: 205, y: 68, r: 16, label: 'The antenna vanished' },
      { x: 420, y: 232, r: 14, label: 'A roof tile changed colour' },
      { x: 95, y: 130, r: 16, label: 'The paper plane vanished' },
      { x: 585, y: 180, r: 16, label: 'The water-tower light went out' },
      { x: 305, y: 285, r: 16, label: 'A flower pot vanished' },
    ],
  },
];
