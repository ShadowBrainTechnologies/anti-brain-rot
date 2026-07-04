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
  'n-back': 'higher', // highest N reached
  'sequence-recall': 'higher', // longest sequence reached (tiles)
  'mental-rotation': 'higher', // correct answers in a session
  'reverse-recall': 'higher', // longest digit sequence recalled
  'rule-switch': 'higher', // correct answers in a 90s session
  'estimate-it': 'higher', // total points across estimation rounds
  'go-no-go': 'higher', // score across 60 trials
  'visual-search': 'higher', // score across 20 rounds
  'odd-one-out': 'higher', // correct answers out of 20
  'typing-asteroids': 'higher', // score before base is destroyed
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
  if (gameId === 'mental-rotation') {
    return `${score} pts`
  }
  if (gameId === 'n-back') {
    return `N = ${score}`
  }
  if (gameId === 'sequence-recall') {
    return `${score} tiles`
  }
  if (gameId === 'reverse-recall') {
    return `${score} digits`
  }
  if (gameId === 'rule-switch') {
    return `${score} pts`
  }
  if (gameId === 'estimate-it') {
    return `${score} pts`
  }
  if (gameId === 'go-no-go') {
    return `${score} pts`
  }
  if (gameId === 'visual-search') {
    return `${score} pts`
  }
  if (gameId === 'odd-one-out') {
    return `${score}/20`
  }
  if (gameId === 'typing-asteroids') {
    return `${score} pts`
  }
  return `Level ${score}`
}
