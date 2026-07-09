// Cognitive calibration engine.
//
// Turns raw per-game scores into a 0-100 profile across the 6 dimensions in
// dimensions.js, and renders on the home page as a "brain radar".
//
// How it works
// ------------
// Every game declares, in GAME_PROFILE below, (a) which dimensions it exercises
// and how strongly (weights 0..1), and (b) a `ceiling` — the score that counts
// as mastery (1.0). A game's raw best score is normalized to a 0..1 "skill" and
// spread across its dimensions by those weights. getProfile() aggregates every
// played game into one value per dimension.
//
// Two data sources, transparently merged (see getGameSkill):
//   1. recordResult(gameId, score) — called by games at end-of-round; stores a
//      smoothed (EMA) skill so the profile reflects recent form, not just the
//      all-time best. This is the richer signal.
//   2. Best-score fallback — if a game was never instrumented (or has no EMA
//      yet) but has a stored best, we normalize that. This means every existing
//      game contributes immediately, with or without a recordResult call.
//
// Extending
// ---------
//   * New game: add one entry to GAME_PROFILE. Nothing else changes.
//   * New dimension: add it to dimensions.js and reference its id in weights.
//   * New scoring shape: set `direction: 'lower'` for time-like scores.

import { DIMENSIONS } from './dimensions.js'
import { getBest } from './scores.js'

const CALIB_PREFIX = 'brain-rot:calib:'
const EMA_ALPHA = 0.4 // weight of the newest result vs. accumulated history

// gameId -> { dims: { dimId: weight }, ceiling, direction }
// `ceiling` is the raw score treated as mastery (skill = 1.0).
// `direction` defaults to 'higher'; use 'lower' for time-like scores (sudoku).
export const GAME_PROFILE = {
  // --- existing games ---
  'number-memory': { ceiling: 12, dims: { memory: 0.9, speed: 0.2, accuracy: 0.3 } },
  'math-speed': { ceiling: 10, dims: { calculation: 0.9, speed: 0.5, accuracy: 0.4 } },
  'color-deception': {
    ceiling: 10,
    dims: { judgement: 0.6, speed: 0.5, accuracy: 0.5, observation: 0.3 },
  },
  'tap-the-color': { ceiling: 15, dims: { speed: 0.7, accuracy: 0.4, observation: 0.4 } },
  sudoku: {
    ceiling: 180,
    direction: 'lower',
    dims: { judgement: 0.6, calculation: 0.3, memory: 0.3, accuracy: 0.5 },
  },
  'path-to-safety': { ceiling: 12, dims: { memory: 0.6, judgement: 0.5, observation: 0.4 } },
  'rps-reversal': { ceiling: 15, dims: { judgement: 0.8, speed: 0.4 } },
  'attention-is-all-you-need': {
    ceiling: 3,
    dims: { memory: 0.8, observation: 0.4, accuracy: 0.4 },
  },
  'grid-rotation': { ceiling: 10, dims: { observation: 0.6, memory: 0.4, judgement: 0.4 } },
  'first-failure': { ceiling: 12, dims: { observation: 0.6, accuracy: 0.5, judgement: 0.4 } },
  'n-back': { ceiling: 5, dims: { memory: 0.9, judgement: 0.4, accuracy: 0.4 } },
  'sequence-recall': { ceiling: 12, dims: { memory: 0.9, observation: 0.4, speed: 0.2 } },
  'mental-rotation': { ceiling: 20, dims: { observation: 0.6, judgement: 0.5, speed: 0.3 } },
  'reverse-recall': { ceiling: 10, dims: { memory: 0.9, judgement: 0.3 } },
  'rule-switch': { ceiling: 40, dims: { judgement: 0.8, speed: 0.5, accuracy: 0.4 } },
  'estimate-it': { ceiling: 50, dims: { judgement: 0.7, calculation: 0.4, observation: 0.4 } },
  'go-no-go': { ceiling: 60, dims: { speed: 0.7, judgement: 0.6, accuracy: 0.5 } },
  'visual-search': { ceiling: 20, dims: { observation: 0.9, speed: 0.5 } },
  'odd-one-out': { ceiling: 20, dims: { judgement: 0.6, observation: 0.7, accuracy: 0.4 } },
  'typing-asteroids': { ceiling: 50, dims: { speed: 0.8, accuracy: 0.5, observation: 0.3 } },
  'face-identify': { ceiling: 12, dims: { memory: 0.8, observation: 0.5 } },
  'unfollow-the-leader': { ceiling: 10, dims: { memory: 0.9, observation: 0.4 } },
  'color-switch': {
    ceiling: 40,
    dims: { speed: 0.7, accuracy: 0.5, observation: 0.4, judgement: 0.3 },
  },

  // --- new games ---
  'follow-the-leader': { ceiling: 10, dims: { memory: 0.9, observation: 0.5, speed: 0.2 } },
  'bird-watching': { ceiling: 30, dims: { observation: 0.9, speed: 0.5, accuracy: 0.4 } },
  'missing-pieces': { ceiling: 15, dims: { observation: 0.7, memory: 0.6, judgement: 0.3 } },
  rainfall: { ceiling: 40, dims: { speed: 0.7, accuracy: 0.5, observation: 0.5 } },
  'rapid-sorting': { ceiling: 40, dims: { judgement: 0.7, speed: 0.6, accuracy: 0.4 } },
  matching: { ceiling: 20, dims: { memory: 0.8, observation: 0.5, speed: 0.3 } },
  'rapid-multiplication': { ceiling: 20, dims: { calculation: 0.9, speed: 0.6, accuracy: 0.5 } },
  'sign-solver': { ceiling: 15, dims: { calculation: 0.8, judgement: 0.6, accuracy: 0.4 } },

  // --- IndiaBix question-bank games (score = correct answers out of 10) ---
  'aptitude-arena': { ceiling: 10, dims: { calculation: 0.8, reasoning: 0.6, accuracy: 0.4 } },
  sequences: { ceiling: 10, dims: { reasoning: 0.8, judgement: 0.4, calculation: 0.4, observation: 0.3 } },
  deduction: { ceiling: 10, dims: { reasoning: 0.9, judgement: 0.6, memory: 0.3 } },
  'data-detective': { ceiling: 10, dims: { reasoning: 0.6, calculation: 0.6, observation: 0.5 } },
}

function clamp01(x) {
  if (!Number.isFinite(x)) return 0
  return x < 0 ? 0 : x > 1 ? 1 : x
}

// Convert a raw score for a game into a 0..1 skill using its ceiling+direction.
export function normalize(gameId, score) {
  const profile = GAME_PROFILE[gameId]
  if (!profile || !Number.isFinite(score)) return 0
  const ceiling = profile.ceiling || 1
  if (profile.direction === 'lower') {
    // time-like: smaller is better; the ceiling is a "good" time.
    if (score <= 0) return 0
    return clamp01(ceiling / score)
  }
  return clamp01(score / ceiling)
}

function calibKey(gameId) {
  return `${CALIB_PREFIX}${gameId}`
}

function readCalib(gameId) {
  try {
    const raw = localStorage.getItem(calibKey(gameId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.skill !== 'number') return null
    return { skill: clamp01(parsed.skill), plays: parsed.plays || 0 }
  } catch {
    return null
  }
}

// Record the result of one round. `score` is the game's raw score (same value
// passed to saveBest). Stored as an exponential moving average so the profile
// tracks recent form. Returns the updated skill (0..1), or null if unrecordable.
export function recordResult(gameId, score) {
  if (!GAME_PROFILE[gameId] || !Number.isFinite(score)) return null
  const skillNow = normalize(gameId, score)
  const prev = readCalib(gameId)
  const skill = prev ? clamp01(prev.skill * (1 - EMA_ALPHA) + skillNow * EMA_ALPHA) : skillNow
  const plays = (prev?.plays || 0) + 1
  try {
    localStorage.setItem(calibKey(gameId), JSON.stringify({ skill, plays }))
  } catch {
    /* storage unavailable — the value still returns for this session */
  }
  return skill
}

// Best available skill estimate for a game, merging the two data sources.
// Returns { skill, hasData }.
export function getGameSkill(gameId) {
  const calib = readCalib(gameId)
  if (calib && calib.plays > 0) return { skill: calib.skill, hasData: true }
  let best = null
  try {
    best = getBest(gameId)
  } catch {
    best = null
  }
  if (best !== null) return { skill: normalize(gameId, best), hasData: true }
  return { skill: 0, hasData: false }
}

// Aggregate every played game into one 0-100 value per dimension.
// Only games the user has actually played (has data for) contribute, so a fresh
// profile is empty and fills in as games are played. Returns an array shaped
// like DIMENSIONS with an added `value` (0-100) and `covered` (games counted).
export function getProfile() {
  const skills = {}
  for (const gameId of Object.keys(GAME_PROFILE)) {
    skills[gameId] = getGameSkill(gameId)
  }
  return DIMENSIONS.map((dim) => {
    let weighted = 0
    let weightSum = 0
    let covered = 0
    for (const [gameId, profile] of Object.entries(GAME_PROFILE)) {
      const weight = profile.dims[dim.id]
      if (!weight) continue
      const { skill, hasData } = skills[gameId]
      if (!hasData) continue
      weighted += skill * weight
      weightSum += weight
      covered += 1
    }
    const value = weightSum > 0 ? Math.round((weighted / weightSum) * 100) : 0
    return { ...dim, value, covered }
  })
}

// Overall brain score: mean of the dimension values that have data.
export function getOverall(profile = getProfile()) {
  const active = profile.filter((d) => d.covered > 0)
  if (active.length === 0) return 0
  return Math.round(active.reduce((s, d) => s + d.value, 0) / active.length)
}

// Total number of games the user has any data for (for empty-state UI).
export function getPlayedCount() {
  return Object.keys(GAME_PROFILE).reduce(
    (n, gameId) => n + (getGameSkill(gameId).hasData ? 1 : 0),
    0,
  )
}
