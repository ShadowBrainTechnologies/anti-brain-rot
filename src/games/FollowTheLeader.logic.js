export const TILE_COUNT = 9
export const START_LENGTH = 1
export const GRID_SIZE = 3

export function generateSequence(length, tileCount = TILE_COUNT, rng = Math.random) {
  const sequence = []
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(rng() * tileCount))
  }
  return sequence
}

export function isCorrectSoFar(sequence, input) {
  if (input.length > sequence.length) return false
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== sequence[i]) return false
  }
  return true
}

export function isComplete(sequence, input) {
  return input.length === sequence.length && isCorrectSoFar(sequence, input)
}
