import { W, H } from './config.js';

export function updateBullets(bullets, dt) {
  for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life = (b.life ?? 3) - dt; if (b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30 || b.life <= 0) bullets.splice(i, 1); }
}

export function hitTest(a, b, padding = 0) { const dx = a.x - b.x, dy = a.y - b.y, r = (a.r || 10) + (b.r || 10) + padding; return dx * dx + dy * dy < r * r; }
