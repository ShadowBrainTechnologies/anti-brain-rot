export const ROUND_COUNT = 10
export const GRID_DIM = 3
export const MEMORIZE_MS = 1200
export const FEEDBACK_MS = 700
export const CHOICE_COUNT = 4

export const PALETTE = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
]

export function shuffle(arr, rng = Math.random) {
  return [...arr].sort(() => rng() - 0.5)
}

export function buildGrid(size, palette, rng = Math.random) {
  return Array.from({ length: size }, () => palette[Math.floor(rng() * palette.length)])
}

export function removeOne(grid, rng = Math.random) {
  const index = Math.floor(rng() * grid.length)
  return { index, missingValue: grid[index] }
}

export function buildChoices(missingValue, palette, rng = Math.random) {
  const count = Math.min(CHOICE_COUNT, palette.length)
  const others = palette.filter((color) => color !== missingValue)
  const picks = shuffle(others, rng).slice(0, count - 1)
  return shuffle([missingValue, ...picks], rng)
}

export function isCorrect(missingValue, choice) {
  return missingValue === choice
}
