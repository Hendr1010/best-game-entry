import { makeRng, W, H } from './config.js';

export function getShot() {
  const params = new URLSearchParams(location.search), shot = params.get('shot');
  if (!['start', 'play', 'win', 'over'].includes(shot)) return null;
  const seed = Number(params.get('seed') || 1) || 1, rng = makeRng(seed);
  return { shot, rng, seed, W, H };
}

export function seedShot(game, shot) {
  const rand = game.rng;
  if (shot === 'play') {
    game.state = 'playing'; game.score = 2470; game.combo = 3; game.comboTimer = 1.4; game.elapsed = 86; game.enemies.wave = 2; game.enemies.spawned = 4; game.enemies.cleared = false;
    game.player.x = 481; game.player.y = 493; game.player.shield = true; game.player.rapid = 6;
    game.enemies.enemies = [
      { kind: 'asteroid', x: 180, y: 176, vx: 37, vy: 96, r: 27, hp: 1, spin: .45, angle: .5, size: 2 },
      { kind: 'ship', x: 723, y: 210, vx: -35, vy: 113, r: 17, hp: 2, fire: .8, angle: 0 },
      { kind: 'asteroid', x: 595, y: 84, vx: -22, vy: 119, r: 21, hp: 1, spin: -.7, angle: 1.2, size: 2 }
    ];
    game.bullets.push({ x: 481, y: 430, vx: 0, vy: -560, r: 3, team: 'player' }, { x: 481, y: 365, vx: 0, vy: -560, r: 3, team: 'player' }, { x: 723, y: 282, vx: 0, vy: 230, r: 5, team: 'enemy' });
    game.powerups.push({ x: 332, y: 359, r: 12, type: 'rapid', phase: .5, life: 8 });
  } else if (shot === 'win') { game.state = 'win'; game.score = 18640; game.best = Math.max(game.best, game.score); game.elapsed = 392; game.player.lives = 2; }
  else if (shot === 'over') { game.state = 'gameover'; game.score = 9340; game.best = Math.max(game.best, 12820); game.elapsed = 255; game.player.lives = 0; }
  // Keep the seeded stream exercised so equal seeds stay tied to the fixture's decoration.
  for (const star of game.particles.stars) star.tw += rand() * .001;
}
