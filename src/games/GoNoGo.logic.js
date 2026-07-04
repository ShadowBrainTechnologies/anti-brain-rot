export const TOTAL_TRIALS = 60
export const FIXATION_MS = 300
export const FEEDBACK_MS = 400
export const COUNTDOWN_SECONDS = 3
export const GO_RATIO = 0.75

export const DIFFICULTY_LEVELS = [
  { label: 'Easy', stimulusMs: 900, size: 'large' },
  { label: 'Medium', stimulusMs: 700, size: 'large' },
  { label: 'Hard', stimulusMs: 500, size: 'small' },
]

export function difficultyForTrial(trialIndex) {
  if (trialIndex < 20) return 0
  if (trialIndex < 40) return 1
  return 2
}

function mulberry32(seed) {
  let state = seed >>> 0
  return function random() {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateTrials(seed, count = TOTAL_TRIALS) {
  const random = mulberry32(seed)
  const goCount = Math.round(count * GO_RATIO)
  const nogoCount = count - goCount
  const types = []
  for (let i = 0; i < goCount; i++) types.push('go')
  for (let i = 0; i < nogoCount; i++) types.push('nogo')

  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[types[i], types[j]] = [types[j], types[i]]
  }

  return types.map((type, index) => ({
    index,
    type,
    difficultyIndex: difficultyForTrial(index),
    stimulusMs: DIFFICULTY_LEVELS[difficultyForTrial(index)].stimulusMs,
  }))
}

export function scoreTrial(trial, tapped, reactionMs) {
  if (trial.type === 'go') {
    if (tapped) return { delta: 1, outcome: 'hit', reactionMs }
    return { delta: 0, outcome: 'miss', reactionMs: null }
  }
  if (tapped) return { delta: -1, outcome: 'falseAlarm', reactionMs }
  return { delta: 1, outcome: 'correctReject', reactionMs: null }
}

export function computeStats(results) {
  let score = 0
  let goCorrect = 0
  let goTotal = 0
  let nogoCorrect = 0
  let nogoTotal = 0
  const reactionTimes = []

  for (const r of results) {
    score += r.delta
    if (r.trialType === 'go') {
      goTotal++
      if (r.outcome === 'hit') {
        goCorrect++
        if (r.reactionMs != null) reactionTimes.push(r.reactionMs)
      }
    } else {
      nogoTotal++
      if (r.outcome === 'correctReject') nogoCorrect++
    }
  }

  const total = goTotal + nogoTotal
  const correct = goCorrect + nogoCorrect
  const avgReactionMs =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : null

  return {
    score,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    goAccuracy: goTotal > 0 ? Math.round((goCorrect / goTotal) * 100) : 0,
    nogoAccuracy: nogoTotal > 0 ? Math.round((nogoCorrect / nogoTotal) * 100) : 0,
    avgReactionMs,
    goTotal,
    nogoTotal,
    goCorrect,
    nogoCorrect,
  }
}
