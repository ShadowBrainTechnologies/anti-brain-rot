// localStorage-backed high-score persistence.
// Each game stores a "best" keyed by gameId + optional difficulty.
// Score comparison direction is encoded per game: 'higher' or 'lower'.

const KEY_PREFIX = 'brain-rot:best:'
const DIRECTION = {
  'number-memory': 'higher', // level reached
  'math-speed': 'higher', // correct answers out of 10
  'color-deception': 'higher', // correct answers out of 10
  'tap-the-color': 'higher', // level reached
  sudoku: 'lower', // completion time (seconds)
  'path-to-safety': 'higher', // level reached
  'rps-reversal': 'higher', // correct answers out of 15
  'attention-is-all-you-need': 'higher', // correct answers out of 3
  'grid-rotation': 'higher', // correct answers out of 10
  'first-failure': 'higher', // level reached
}

function fullKey(gameId, difficulty) {
  return difficulty ? `${KEY_PREFIX}${gameId}:${difficulty}` : `${KEY_PREFIX}${gameId}`
}

export function getBest(gameId, difficulty) {
  const key = fullKey(gameId, difficulty)
  const raw = localStorage.getItem(key)
  if (raw === null) return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

// Returns true if a new best was saved.
export function saveBest(gameId, difficulty, score) {
  const dir = DIRECTION[gameId] || 'higher'
  const current = getBest(gameId, difficulty)
  const isBetter =
    current === null ||
    (dir === 'higher' ? score > current : score < current)
  if (isBetter) {
    localStorage.setItem(fullKey(gameId, difficulty), String(score))
    return true
  }
  return false
}

// Format a score for display given the game.
export function formatBest(gameId, score) {
  if (score === null) return null
  if (gameId === 'sudoku') {
    const m = Math.floor(score / 60)
    const s = score % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  if (gameId === 'math-speed' || gameId === 'color-deception') {
    return `${score}/10`
  }
  if (gameId === 'rps-reversal') {
    return `${score}/15`
  }
  if (gameId === 'attention-is-all-you-need') {
    return `${score}/3`
  }
  if (gameId === 'grid-rotation') {
    return `${score}/10`
  }
  if (gameId === 'first-failure') {
    return `Level ${score}`
  }
  return `Level ${score}`
}
