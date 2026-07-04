export const START_LENGTH = 3
export const GRID_SIZE = 3

export function highlightMsFor(level) {
  if (level <= 5) return 600
  if (level <= 10) return 500
  return 400
}

export function gapMsFor(level) {
  if (level <= 5) return 250
  if (level <= 10) return 200
  return 150
}

export function generateSequence(length, gridSize = GRID_SIZE) {
  const count = gridSize * gridSize
  return Array.from({ length }, () => Math.floor(Math.random() * count))
}

export function highestSequenceLength(roundsCompleted) {
  return START_LENGTH + roundsCompleted
}
