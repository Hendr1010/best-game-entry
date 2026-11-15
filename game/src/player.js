import { W, H } from './config.js';

export function createPlayer() {
  return { x: W / 2, y: H - 95, vx: 0, vy: 0, r: 14, lives: 3, shield: false, rapid: 0, double: 0, cooldown: 0, invuln: 0, angle: -Math.PI / 2, alive: true };
}

export function updatePlayer(p, dt, keys, pointer, autoFire, bullets, audio, particles) {
  const ax = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ay = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  p.vx = (p.vx + ax * 630 * dt) * Math.pow(.84, dt * 60); p.vy = (p.vy + ay * 630 * dt) * Math.pow(.84, dt * 60);
  p.x = Math.max(22, Math.min(W - 22, p.x + p.vx * dt)); p.y = Math.max(35, Math.min(H - 35, p.y + p.vy * dt));
  p.invuln = Math.max(0, p.invuln - dt); p.rapid = Math.max(0, p.rapid - dt); p.double = Math.max(0, p.double - dt); p.cooldown -= dt;
  if (pointer.aiming) p.angle = Math.atan2(pointer.y - p.y, pointer.x - p.x);
  else if (ax || ay) p.angle = Math.atan2(ay, ax);
  particles.trail(p.x, p.y + 14);
  if ((autoFire || pointer.down || keys.shoot) && p.cooldown <= 0) {
    const spread = p.double > 0 ? [-.14, .14] : [0];
    for (const a of spread) { const ang = p.angle + a; bullets.push({ x: p.x + Math.cos(ang) * 19, y: p.y + Math.sin(ang) * 19, vx: Math.cos(ang) * 560, vy: Math.sin(ang) * 560, r: 3, team: 'player', damage: 1 }); }
    p.cooldown = p.rapid > 0 ? .095 : .22; audio.shoot();
  }
}

export function damagePlayer(p, audio, particles) {
  if (p.invuln > 0) return false;
  audio.hit(); particles.burst(p.x, p.y, '#ff4eaa', 22); p.invuln = 1.35;
  if (p.shield) { p.shield = false; return 'shield'; }
  p.lives--; if (p.lives <= 0) p.alive = false; return 'hit';
}
