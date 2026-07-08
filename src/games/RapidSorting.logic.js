export const PIVOT = 50
export const SESSION_SECONDS = 45
export const MIN_ITEM = 1
export const MAX_ITEM = 99

export function randomItem(min = MIN_ITEM, max = MAX_ITEM, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function correctSide(item, pivot = PIVOT) {
  return item < pivot ? 'left' : 'right'
}

export function isCorrect(item, pivot = PIVOT, side) {
  return correctSide(item, pivot) === side
}
