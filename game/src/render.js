import { W, H, COLORS } from './config.js';

function glow(ctx, color, blur = 12) { ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.strokeStyle = color; ctx.fillStyle = color; }
function text(ctx, value, x, y, size, color = COLORS.white, align = 'left', weight = 600) { ctx.font = `${weight} ${size}px 'Courier New', monospace`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(value, x, y); }
function panel(ctx, x, y, w, h) { ctx.fillStyle = 'rgba(5,12,25,.82)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(85,246,255,.19)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1); }

export function render(ctx, game, hud) {
  const { particles: fx, player, enemies, bullets, powerups, state } = game;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#050913'; ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W * .52, H * .38, 12, W * .52, H * .38, 570); bg.addColorStop(0, '#10172a'); bg.addColorStop(.65, '#080d1b'); bg.addColorStop(1, '#040711'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const s of fx.stars) { const alpha = .32 + (Math.sin(s.tw * 2 + s.x) + 1) * .28; ctx.globalAlpha = alpha; ctx.fillStyle = s.z > 1.45 ? '#b6f9ff' : '#6c809f'; ctx.fillRect(s.x, s.y, s.z, s.z); } ctx.globalAlpha = 1;
  // faint flight lanes add depth without obscuring play
  ctx.strokeStyle = 'rgba(69,115,159,.08)'; ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(82 + i * 98, 0); ctx.lineTo(82 + i * 98, H); ctx.stroke(); }
  for (const p of fx.particles) { ctx.globalAlpha = Math.max(0, p.life / p.max); glow(ctx, p.color, 8); ctx.fillRect(p.x, p.y, p.size, p.size); } ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  for (const item of powerups) { const color = ({ shield: COLORS.cyan, rapid: COLORS.orange, life: COLORS.pink, double: COLORS.green })[item.type]; ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.phase); glow(ctx, color, 16); ctx.lineWidth = 2; ctx.strokeRect(-9, -9, 18, 18); ctx.shadowBlur = 0; text(ctx, ({ shield: 'S', rapid: 'R', life: '+', double: 'D' })[item.type], 0, 4, 12, color, 'center'); ctx.restore(); }
  for (const b of bullets) { glow(ctx, b.team === 'player' ? COLORS.cyan : COLORS.pink, 14); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); if (b.team === 'player') { ctx.globalAlpha = .4; ctx.fillRect(b.x - 1, b.y + 3, 2, 12); ctx.globalAlpha = 1; } } ctx.shadowBlur = 0;
  for (const e of enemies.enemies) drawEnemy(ctx, e);
  if (enemies.boss) drawBoss(ctx, enemies.boss);
  if (player && state !== 'title' && state !== 'win' && state !== 'gameover') drawPlayer(ctx, player, game.time);
  drawHud(ctx, game, hud);
  if (state === 'title') drawTitle(ctx);
  if (state === 'paused') drawModal(ctx, 'SYSTEM PAUSED', 'Press P to resume', COLORS.cyan);
  if (game.banner > 0 && state === 'playing' && !enemies.boss) { ctx.globalAlpha = Math.min(1, game.banner * 2); text(ctx, game.bannerLabel, W / 2, H * .37, 25, COLORS.cyan, 'center', 700); ctx.globalAlpha = 1; }
  if (state === 'boss-intro') { ctx.fillStyle = 'rgba(255,40,95,.11)'; ctx.fillRect(0, 0, W, H); drawModal(ctx, 'INCOMING // DREADNOUGHT', 'HOSTILE SIGNATURE DETECTED', COLORS.pink); }
  if (state === 'win') { drawModal(ctx, 'VOID CONQUERED', `SCORE ${game.score.toLocaleString()}   //   ${formatTime(game.elapsed)}`, COLORS.cyan, 'Press Enter or click to fly again'); }
  if (state === 'gameover') { drawModal(ctx, 'SIGNAL LOST', `SCORE ${game.score.toLocaleString()}   //   BEST ${game.best.toLocaleString()}`, COLORS.pink, 'Press Enter or click to retry'); }
}

function drawPlayer(ctx, p, time) {
  if (p.invuln > 0 && Math.floor(time * 13) % 2) return;
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle + Math.PI / 2);
  if (p.shield) { glow(ctx, COLORS.cyan, 18); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 25 + Math.sin(time * 7) * 2, 0, Math.PI * 2); ctx.stroke(); }
  glow(ctx, COLORS.cyan, 18); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(14, 15); ctx.lineTo(0, 10); ctx.lineTo(-14, 15); ctx.closePath(); ctx.fillStyle = '#0d3545'; ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#eaffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6); ctx.closePath(); ctx.stroke();
  glow(ctx, COLORS.orange, 8); ctx.beginPath(); ctx.moveTo(-5, 14); ctx.lineTo(0, 23 + Math.sin(time * 35) * 4); ctx.lineTo(5, 14); ctx.stroke(); ctx.restore(); ctx.shadowBlur = 0;
}
function drawEnemy(ctx, e) {
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.kind === 'asteroid' ? e.angle : 0);
  if (e.kind === 'ship') { glow(ctx, COLORS.pink, 13); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(18, -10); ctx.lineTo(7, -6); ctx.lineTo(0, -17); ctx.lineTo(-7, -6); ctx.lineTo(-18, -10); ctx.closePath(); ctx.fillStyle = '#35152e'; ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#ffa0d2'; ctx.beginPath(); ctx.moveTo(-7, 1); ctx.lineTo(7, 1); ctx.stroke(); }
  else { glow(ctx, '#ffa64f', 10); ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9, radius = e.r * (.78 + .17 * Math.sin(i * 7.1 + e.r)); const x = Math.cos(a) * radius, y = Math.sin(a) * radius; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fillStyle = '#352719'; ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,193,112,.45)'; ctx.beginPath(); ctx.moveTo(-e.r * .35, -e.r * .1); ctx.lineTo(e.r * .12, e.r * .26); ctx.lineTo(e.r * .39, -e.r * .35); ctx.stroke(); }
  ctx.restore(); ctx.shadowBlur = 0;
}
function drawBoss(ctx, b) {
  ctx.save(); ctx.translate(b.x, b.y); glow(ctx, COLORS.pink, 25); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-112, -22); ctx.lineTo(-70, -39); ctx.lineTo(-48, -25); ctx.lineTo(48, -25); ctx.lineTo(70, -39); ctx.lineTo(112, -22); ctx.lineTo(91, 16); ctx.lineTo(52, 31); ctx.lineTo(-52, 31); ctx.lineTo(-91, 16); ctx.closePath(); ctx.fillStyle = '#311326'; ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = '#ff7fba'; for (const x of [-66, -32, 0, 32, 66]) { ctx.beginPath(); ctx.arc(x, 2, 4, 0, 7); ctx.fill(); } ctx.restore();
  panel(ctx, 290, 30, 380, 17); ctx.fillStyle = '#301326'; ctx.fillRect(292, 32, 376, 13); glow(ctx, COLORS.pink, 8); ctx.fillRect(292, 32, 376 * b.hp / b.maxHp, 13); ctx.shadowBlur = 0; text(ctx, 'DREADNOUGHT', W / 2, 25, 11, COLORS.pink, 'center', 700);
}
function drawHud(ctx, g, node) {
  if (g.state === 'title') { if (node.innerHTML) node.innerHTML = ''; return; }
  const lives = '◆'.repeat(Math.max(0, g.player.lives));
  const markup = `<div class="hud-top"><div><span class="label">SCORE</span><b>${String(g.score).padStart(6, '0')}</b></div><div><span class="label">BEST</span><b>${String(g.best).padStart(6, '0')}</b></div><div class="wave"><span class="label">SECTOR</span><b>${String(g.enemies.wave).padStart(2, '0')}</b></div></div><div class="hud-bottom"><div><span class="label">HULL</span><b class="lives">${lives || '—'}</b></div><div><span class="label">${g.player.shield ? 'SHIELD ACTIVE' : 'DEFENSE'}</span><b class="defense">${g.player.shield ? '◉' : '—'}</b></div><div class="combo">${g.combo > 1 ? `COMBO <b>x${g.combo}</b>` : ''}</div><div class="timer">${formatTime(g.elapsed)}</div></div>`;
  if (node.innerHTML !== markup) node.innerHTML = markup;
}
function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(3,8,18,.38)'; ctx.fillRect(0, 0, W, H); text(ctx, 'NEON', W / 2, 225, 71, COLORS.cyan, 'center', 700); text(ctx, 'VOID', W / 2, 293, 71, COLORS.pink, 'center', 700); text(ctx, 'S T A R   F I G H T E R   //   2 1 8 9', W / 2, 329, 13, '#a8bdd4', 'center');
  ctx.strokeStyle = 'rgba(85,246,255,.3)'; ctx.beginPath(); ctx.moveTo(322, 352); ctx.lineTo(638, 352); ctx.stroke(); text(ctx, 'ARROW KEYS / WASD  MOVE', W / 2, 388, 14, COLORS.white, 'center'); text(ctx, 'MOUSE AIM  //  CLICK OR SPACE  FIRE', W / 2, 413, 14, COLORS.white, 'center'); text(ctx, 'AUTO-FIRE ONLINE  ·  P PAUSE  ·  M MUTE', W / 2, 438, 12, '#8da3bb', 'center');
  glow(ctx, COLORS.cyan, 14); ctx.strokeRect(W / 2 - 137, 472, 274, 43); ctx.shadowBlur = 0; text(ctx, 'CLICK OR PRESS ENTER', W / 2, 499, 14, COLORS.cyan, 'center', 700); text(ctx, 'SURVIVE THE WAVES. BREAK THE VOID.', W / 2, 558, 11, '#687d96', 'center');
}
function drawModal(ctx, title, sub, color, foot = '') { ctx.fillStyle = 'rgba(3,7,16,.72)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(5,12,25,.9)'; ctx.fillRect(180, 230, 600, 190); ctx.strokeStyle = `${color}88`; ctx.strokeRect(180.5, 230.5, 599, 189); glow(ctx, color, 16); text(ctx, title, W / 2, 291, 29, color, 'center', 700); ctx.shadowBlur = 0; text(ctx, sub, W / 2, 330, 15, COLORS.white, 'center'); if (foot) text(ctx, foot, W / 2, 379, 12, '#9aadc3', 'center'); }
function formatTime(sec) { const n = Math.floor(sec); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; }
