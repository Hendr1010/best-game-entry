import { W, H, WAVE } from './config.js';

export function createEnemySystem() { return { enemies: [], boss: null, wave: 1, spawned: 0, timer: 0, cleared: false, bossDone: false }; }
export function startWave(sys, n) { sys.wave = n; sys.spawned = 0; sys.timer = .45; sys.cleared = false; sys.boss = null; }
export function updateEnemies(sys, dt, rng, bullets, fireBoss) {
  const cfg = WAVE(sys.wave);
  if (sys.wave === 5 && !sys.bossDone && !sys.boss) { sys.boss = { x: W / 2, y: 115, vx: 85, hp: 90, maxHp: 90, r: 66, fire: 1.2, phase: 0 }; return 'boss-intro'; }
  if (sys.wave !== 5 && sys.spawned < cfg.count) {
    sys.timer -= dt;
    if (sys.timer <= 0) { const ship = rng() < Math.min(.55, .18 + sys.wave * .035); sys.enemies.push({ kind: ship ? 'ship' : 'asteroid', x: 40 + rng() * (W - 80), y: -24, vx: (rng() - .5) * (ship ? 90 : 55), vy: cfg.speed * (.7 + rng() * .65), r: ship ? 17 : 19 + rng() * 8, hp: ship ? 2 : 1, fire: 1.2 + rng() * 1.6, spin: (rng() - .5) * 2, angle: rng() * 6, size: 2 }); sys.spawned++; sys.timer = cfg.interval / 1000 * (.7 + rng() * .6); }
  }
  for (let i = sys.enemies.length - 1; i >= 0; i--) { const e = sys.enemies[i]; e.x += e.vx * dt; e.y += e.vy * dt; e.angle += e.spin * dt; if (e.x < 18 || e.x > W - 18) e.vx *= -1;
    if (e.kind === 'ship') { e.fire -= dt; if (e.fire <= 0 && e.y > 20) { bullets.push({ x: e.x, y: e.y + 15, vx: 0, vy: 210 + sys.wave * 11, r: 5, team: 'enemy' }); e.fire = Math.max(.65, 1.9 - sys.wave * .1); } }
    if (e.y > H + 50) sys.enemies.splice(i, 1);
  }
  if (sys.boss) { const b = sys.boss; b.phase += dt; b.x += b.vx * dt; if (b.x < 130 || b.x > W - 130) b.vx *= -1; b.fire -= dt; if (b.fire <= 0) { fireBoss(b); b.fire = .82; } }
  if (sys.wave !== 5 && sys.spawned >= cfg.count && sys.enemies.length === 0 && !sys.cleared) { sys.cleared = true; return 'wave-clear'; }
  return null;
}

export function splitAsteroid(sys, e, rng) { if (e.kind !== 'asteroid' || e.size <= 1) return; for (let i = 0; i < 2; i++) sys.enemies.push({ kind: 'asteroid', x: e.x, y: e.y, vx: (rng() - .5) * 190, vy: 80 + rng() * 90, r: e.r * .58, hp: 1, fire: 2, spin: (rng() - .5) * 3, angle: rng() * 6, size: 1 }); }
