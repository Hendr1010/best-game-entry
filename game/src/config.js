export const W = 960;
export const H = 640;
export const COLORS = { bg: '#050913', cyan: '#55f6ff', pink: '#ff4eaa', orange: '#ffad52', white: '#eafaff', muted: '#71839b', green: '#8cffba' };
export const WAVE = n => ({ count: 5 + n * 2, speed: 44 + n * 7, interval: Math.max(360, 1100 - n * 65) });

export function makeRng(seed = 1) {
  let value = (Number(seed) >>> 0) || 1;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}
