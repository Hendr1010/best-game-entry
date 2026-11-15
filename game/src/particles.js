import { W, H } from './config.js';

export function createParticleSystem(rng) {
  const stars = Array.from({ length: 140 }, () => ({ x: rng() * W, y: rng() * H, z: 0.3 + rng() * 1.5, tw: rng() * 7 }));
  const particles = [];
  return {
    stars, particles,
    update(dt, speed = 1) {
      for (const s of stars) { s.y += (10 + s.z * 25) * dt * speed; if (s.y > H) { s.y = 0; s.x = rng() * W; } s.tw += dt; }
      for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vx *= Math.pow(.985, dt * 60); if (p.life <= 0) particles.splice(i, 1); }
    },
    burst(x, y, color, amount = 18, scale = 1) {
      for (let i = 0; i < amount; i++) { const a = rng() * Math.PI * 2, v = (35 + rng() * 190) * scale; particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .35 + rng() * .7, max: 1.05, size: 1 + rng() * 3.5, color }); }
    },
    trail(x, y) { if (rng() < .7) particles.push({ x: x + (rng() - .5) * 8, y, vx: (rng() - .5) * 18, vy: 65 + rng() * 55, life: .22 + rng() * .2, max: .4, size: 2 + rng() * 2, color: rng() < .5 ? '#55f6ff' : '#ff4eaa' }); }
  };
}
