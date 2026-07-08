export const SESSION_SECONDS = 60
export const MAX_TABLE = 12
export const CHOICE_COUNT = 4

export function randomFactors(maxTable = MAX_TABLE, rng = Math.random) {
  const a = Math.floor(rng() * maxTable) + 1
  const b = Math.floor(rng() * maxTable) + 1
  return { a, b, product: a * b }
}

export function buildChoices(product, rng = Math.random) {
  const choices = new Set([product])

  const candidates = [
    product + 1,
    product - 1,
    product + 2,
    product - 2,
    product + 10,
    product - 10,
    product + (product > 10 ? 5 : 3),
    product - (product > 10 ? 5 : 3),
  ]

  for (const value of candidates) {
    if (value > 0 && value !== product) {
      choices.add(value)
    }
    if (choices.size >= CHOICE_COUNT) break
  }

  let offset = 1
  while (choices.size < CHOICE_COUNT) {
    const above = product + offset
    if (above > 0 && above !== product) choices.add(above)
    const below = product - offset
    if (below > 0 && below !== product) choices.add(below)
    offset++
  }

  const arr = Array.from(choices)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }

  return arr
}

export function isCorrect(product, choice) {
  return choice === product
}
