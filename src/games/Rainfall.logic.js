export const SESSION_SECONDS = 45
export const TICK_MS = 16
export const DROP_SIZE = 40
export const ARENA_HEIGHT = 400

export function fallSpeedFor(elapsedSeconds) {
  const base = 2
  const increase = Math.floor(elapsedSeconds / 8) * 0.6
  return base + increase
}

export function spawnIntervalFor(elapsedSeconds) {
  const base = 1000
  const decrease = Math.floor(elapsedSeconds / 8) * 120
  return Math.max(320, base - decrease)
}

export function spawnDrop(arenaWidth, rng = Math.random) {
  const half = DROP_SIZE / 2
  const x = Math.floor(rng() * (arenaWidth - DROP_SIZE + 1)) + half
  return { x, y: 0, size: DROP_SIZE }
}
