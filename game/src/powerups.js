const TYPES = ['shield', 'rapid', 'life', 'double'];
export function dropPowerup(x, y, rng, powerups) { if (rng() < .2) powerups.push({ x, y, r: 12, type: TYPES[Math.floor(rng() * TYPES.length)], phase: rng() * 6, life: 12 }); }
export function updatePowerups(powerups, p, dt, onCollect) {
  for (let i = powerups.length - 1; i >= 0; i--) { const item = powerups[i]; item.y += 40 * dt; item.phase += dt * 4; item.life -= dt; const dx = item.x - p.x, dy = item.y - p.y; if (dx * dx + dy * dy < 28 * 28) { onCollect(item); powerups.splice(i, 1); } else if (item.life <= 0 || item.y > 680) powerups.splice(i, 1); }
}
export function applyPowerup(p, item) { if (item.type === 'shield') p.shield = true; if (item.type === 'rapid') p.rapid = 10; if (item.type === 'double') p.double = 10; if (item.type === 'life') p.lives = Math.min(5, p.lives + 1); }
