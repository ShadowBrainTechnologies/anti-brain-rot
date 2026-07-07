export const COLORS = ['red', 'blue']
export const SESSION_SECONDS = 45
export const LANE_HEIGHT = 400
export const CATCHER_Y = 340
export const BALL_SIZE = 36

export function scoreForCatch(catcherColor, ballColor) {
  return catcherColor === ballColor ? 1 : -1
}

export function toggleColor(current) {
  return current === COLORS[0] ? COLORS[1] : COLORS[0]
}

export function randomColor(rng = Math.random) {
  return COLORS[Math.floor(rng() * COLORS.length)]
}

export function fallSpeedFor(elapsedSeconds) {
  const base = 2
  const increase = Math.floor(elapsedSeconds / 10)
  return base + increase
}
