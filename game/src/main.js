import { W, H, makeRng } from './config.js';
import { createParticleSystem } from './particles.js';
import { createPlayer, updatePlayer, damagePlayer } from './player.js';
import { createEnemySystem, startWave, updateEnemies, splitAsteroid } from './enemies.js';
import { hitTest, updateBullets } from './bullets.js';
import { applyPowerup, dropPowerup, updatePowerups } from './powerups.js';
import { createAudio } from './audio.js';
import { render } from './render.js';
import { getShot, seedShot } from './shots.js';

const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d'), hud = document.querySelector('#hud');
const audio = createAudio(), shot = getShot(), rng = shot?.rng || makeRng(Date.now());
const game = { state: 'title', score: 0, best: Number(localStorage.getItem('neonVoidBest') || 0), elapsed: 0, time: 0, combo: 1, comboTimer: 0, banner: 0, bannerLabel: '', autoFire: true, player: createPlayer(), enemies: createEnemySystem(), bullets: [], powerups: [], particles: createParticleSystem(rng), rng };
const keys = {}, pointer = { x: W / 2, y: H / 2, down: false, aiming: false };

function start() { audio.wake(); game.state = 'playing'; game.transition = 0; game.score = 0; game.elapsed = 0; game.combo = 1; game.comboTimer = 0; game.player = createPlayer(); game.enemies = createEnemySystem(); game.bullets.length = 0; game.powerups.length = 0; game.particles.particles.length = 0; startWave(game.enemies, 1); game.banner = 1.6; game.bannerLabel = 'SECTOR 01 // ENGAGE'; }
function restart() { start(); }
function setBest() { if (game.score > game.best) { game.best = game.score; localStorage.setItem('neonVoidBest', String(game.best)); } }
function killEnemy(e, collection, index) {
  collection.splice(index, 1); game.particles.burst(e.x, e.y, e.kind === 'ship' ? '#ff4eaa' : '#ffad52', e.kind === 'ship' ? 24 : 16, e.r / 25); audio.explosion();
  const points = e.kind === 'ship' ? 180 : e.size > 1 ? 80 : 120; game.score += points * game.combo; game.combo = Math.min(8, game.combo + 1); game.comboTimer = 2;
  dropPowerup(e.x, e.y, rng, game.powerups);
}

function step(dt) {
  game.time += dt; game.particles.update(dt, game.state === 'playing' ? 1 : .35);
  if (game.state === 'boss-intro') { game.transition -= dt; if (game.transition <= 0) game.state = 'playing'; return; }
  if (game.state !== 'playing') return;
  game.elapsed += dt; game.banner = Math.max(0, game.banner - dt); game.comboTimer -= dt; if (game.comboTimer <= 0) game.combo = 1;
  if (game.transition > 0) { game.transition -= dt; if (game.transition <= 0 && game.enemies.cleared) { startWave(game.enemies, game.enemies.wave + 1); game.banner = 1.8; game.bannerLabel = `SECTOR ${String(game.enemies.wave).padStart(2, '0')} // INCOMING`; } }
  updatePlayer(game.player, dt, keys, pointer, game.autoFire, game.bullets, audio, game.particles);
  const event = updateEnemies(game.enemies, dt, rng, game.bullets, boss => {
    for (const offset of [-.42, -.21, 0, .21, .42]) game.bullets.push({ x: boss.x, y: boss.y + 28, vx: Math.sin(offset) * 240, vy: Math.cos(offset) * 240, r: 6, team: 'enemy' });
  });
  if (event === 'boss-intro') { game.state = 'boss-intro'; game.transition = 1.9; game.bullets.length = 0; audio.boss(); }
  if (event === 'wave-clear') { game.transition = 2.1; game.banner = 2.1; game.bannerLabel = `SECTOR ${String(game.enemies.wave).padStart(2, '0')} CLEAR`; }
  updateBullets(game.bullets, dt);
  for (let i = game.bullets.length - 1; i >= 0; i--) { const b = game.bullets[i]; if (b.team === 'enemy' && hitTest(b, game.player)) { game.bullets.splice(i, 1); damagePlayer(game.player, audio, game.particles); continue; }
    if (b.team !== 'player') continue;
    const boss = game.enemies.boss; if (boss && hitTest(b, boss)) { game.bullets.splice(i, 1); boss.hp--; game.particles.burst(b.x, b.y, '#ff4eaa', 3, .35); if (boss.hp <= 0) { game.particles.burst(boss.x, boss.y, '#ff4eaa', 70, 2.1); audio.explosion(); game.score += 10000; setBest(); game.enemies.boss = null; game.enemies.bossDone = true; game.state = 'win'; } continue; }
    for (let j = game.enemies.enemies.length - 1; j >= 0; j--) { const e = game.enemies.enemies[j]; if (hitTest(b, e)) { game.bullets.splice(i, 1); e.hp--; game.particles.burst(b.x, b.y, '#55f6ff', 4, .25); if (e.hp <= 0) { splitAsteroid(game.enemies, e, rng); killEnemy(e, game.enemies.enemies, j); } break; } }
  }
  for (let i = game.enemies.enemies.length - 1; i >= 0; i--) { const e = game.enemies.enemies[i]; if (hitTest(e, game.player, -5)) { game.enemies.enemies.splice(i, 1); damagePlayer(game.player, audio, game.particles); } }
  updatePowerups(game.powerups, game.player, dt, item => { applyPowerup(game.player, item); game.score += 50; audio.powerup(); game.particles.burst(item.x, item.y, '#8cffba', 14); });
  if (!game.player.alive) { game.state = 'gameover'; setBest(); }
}

function frame(now) { const dt = Math.min(.033, (now - last) / 1000 || 0); last = now; step(dt); render(ctx, game, hud); requestAnimationFrame(frame); }
let last = performance.now();
canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); pointer.x = (e.clientX - r.left) * W / r.width; pointer.y = (e.clientY - r.top) * H / r.height; pointer.aiming = true; });
canvas.addEventListener('pointerdown', e => { audio.wake(); pointer.down = true; canvas.setPointerCapture(e.pointerId); if (game.state === 'title' || game.state === 'win' || game.state === 'gameover') restart(); });
canvas.addEventListener('pointerup', () => pointer.down = false); canvas.addEventListener('pointercancel', () => pointer.down = false);
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === 'arrowup' || k === 'w') keys.up = true; if (k === 'arrowdown' || k === 's') keys.down = true; if (k === 'arrowleft' || k === 'a') keys.left = true; if (k === 'arrowright' || k === 'd') keys.right = true; if (k === ' ' || k === 'control') keys.shoot = true;
  if (k === 'enter' && (game.state === 'title' || game.state === 'win' || game.state === 'gameover')) { audio.wake(); restart(); }
  if (k === 'p' && (game.state === 'playing' || game.state === 'paused')) game.state = game.state === 'playing' ? 'paused' : 'playing';
  if (k === 'm') { audio.wake(); audio.toggle(); document.querySelector('#sound').textContent = audio.muted ? '♪ OFF' : '♪ ON'; }
  if (k === 'r') restart();
});
window.addEventListener('keyup', e => { const k = e.key.toLowerCase(); if (k === 'arrowup' || k === 'w') keys.up = false; if (k === 'arrowdown' || k === 's') keys.down = false; if (k === 'arrowleft' || k === 'a') keys.left = false; if (k === 'arrowright' || k === 'd') keys.right = false; if (k === ' ' || k === 'control') keys.shoot = false; });
window.addEventListener('blur', () => { pointer.down = false; for (const k in keys) keys[k] = false; if (game.state === 'playing') game.state = 'paused'; });
document.querySelector('#sound').addEventListener('click', () => { audio.wake(); audio.toggle(); document.querySelector('#sound').textContent = audio.muted ? '♪ OFF' : '♪ ON'; });
if (shot) seedShot(game, shot.shot); else startWave(game.enemies, 1);
requestAnimationFrame(frame);
