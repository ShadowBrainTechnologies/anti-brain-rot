export const START_N = 1
export const START_LENGTH = 5
export const MATCH_RATIO = 0.3
export const ROUND_MS = 2000
export const COUNTDOWN_SECONDS = 3
export const MAX_N = 6
export const MAX_LENGTH = 30
export const ADVANCE_ACCURACY = 80

export function roundsForN(n) {
  return Math.min(MAX_LENGTH, 5 * n)
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function randomPos() {
  return Math.floor(Math.random() * 9)
}

export function generateSequence(length, n, matchRatio = MATCH_RATIO) {
  const sequence = new Array(length)
  const available = Math.max(0, length - n)
  const matchCount = Math.max(0, Math.min(available, Math.round(length * matchRatio)))
  const possibleIndices = Array.from({ length: available }, (_, i) => i + n)
  const matchIndices = new Set(shuffle(possibleIndices).slice(0, matchCount))

  for (let i = 0; i < length; i++) {
    if (i < n) {
      sequence[i] = randomPos()
    } else if (matchIndices.has(i)) {
      sequence[i] = sequence[i - n]
    } else {
      let pos = randomPos()
      // Avoid accidental matches on non-match rounds.
      while (pos === sequence[i - n]) {
        pos = randomPos()
      }
      sequence[i] = pos
    }
  }

  return { sequence, matchIndices }
}

export function isMatchRound(index, sequence, n) {
  if (index < n) return false
  return sequence[index] === sequence[index - n]
}

export function scoreRound(expected, tapped) {
  return expected === tapped ? 1 : -1
}

export function computeStats(responses, reactionTimes, sequence, n) {
  let correct = 0
  let score = 0
  let matchReactionSum = 0
  let matchReactionCount = 0

  for (let i = 0; i < sequence.length; i++) {
    const expected = isMatchRound(i, sequence, n)
    const tapped = responses[i] ?? false
    if (expected === tapped) correct += 1
    score += scoreRound(expected, tapped)

    if (expected && tapped && reactionTimes[i] != null) {
      matchReactionSum += reactionTimes[i]
      matchReactionCount += 1
    }
  }

  const accuracy = sequence.length > 0 ? (correct / sequence.length) * 100 : 0
  const avgReactionMs =
    matchReactionCount > 0 ? Math.round(matchReactionSum / matchReactionCount) : null

  return { correct, score, accuracy, avgReactionMs }
}

export function nextDifficulty(accuracy, n, length) {
  if (accuracy < ADVANCE_ACCURACY) {
    return { n, length }
  }
  if (n < MAX_N) {
    const nextN = n + 1
    return { n: nextN, length: roundsForN(nextN) }
  }
  if (length + 2 <= MAX_LENGTH) {
    return { n, length: length + 2 }
  }
  return { n, length }
}
