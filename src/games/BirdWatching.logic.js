export const TOTAL_ROUNDS = 10
export const CHOICE_COUNT = 4

const BASE_COUNT_MIN = 3
const BASE_COUNT_MAX = 6
const BASE_FLASH_MS = 1500
const MIN_FLASH_MS = 800

export function randomBirdCount(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function buildChoices(answer, count = CHOICE_COUNT, rng = Math.random) {
  const maxPool = Math.max(answer + count, 10)
  const pool = []
  for (let i = 1; i <= maxPool; i++) {
    if (i !== answer) pool.push(i)
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = pool[i]
    pool[i] = pool[j]
    pool[j] = tmp
  }

  return [answer, ...pool.slice(0, count - 1)].sort((a, b) => a - b)
}

export function isCorrect(answer, choice) {
  return answer === choice
}

export function countRangeForRound(round) {
  const min = BASE_COUNT_MIN + round - 1
  const max = BASE_COUNT_MAX + round - 1
  return { min, max }
}

export function flashDurationForRound(round) {
  const ms = BASE_FLASH_MS - (round - 1) * 80
  return Math.max(MIN_FLASH_MS, ms)
}
