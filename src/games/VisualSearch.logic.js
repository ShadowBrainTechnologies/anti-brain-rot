// Visual Search logic: generate grids with exactly one target among distractors.

export const ROUNDS = 20
export const COUNTDOWN_SECONDS = 3

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const PUZZLE_TYPE_LABELS = {
  letter: 'Letter',
  shape: 'Shape',
  orientation: 'Orientation',
  gap: 'Gap Position',
  color: 'Color',
  size: 'Size',
  rotation: 'Rotation',
}

const PUZZLE_TYPES = ['letter', 'shape', 'orientation', 'gap', 'color', 'size', 'rotation']

export function gridSizeFor(difficulty) {
  if (difficulty === DIFFICULTY.HARD) return 10
  if (difficulty === DIFFICULTY.MEDIUM) return 8
  return 5
}

export function maxTimeFor(difficulty) {
  if (difficulty === DIFFICULTY.HARD) return 4000
  if (difficulty === DIFFICULTY.MEDIUM) return 5000
  return 6000
}

export function scoreForTime(ms, hit) {
  if (!hit) return 0
  const s = ms / 1000
  if (s < 1) return 100
  if (s < 2) return 80
  if (s < 4) return 60
  return 40
}

export function formatTime(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—'
  return `${(ms / 1000).toFixed(2)}s`
}

// Deterministic PRNG (mulberry32) so tests can be reproducible.
export function createRng(seed = Date.now()) {
  let t = seed >>> 0
  return function rand() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), t | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick(array, rng) {
  return array[Math.floor(rng() * array.length)]
}

function regionFor(index, size) {
  const row = Math.floor(index / size)
  const col = index % size
  const midRow = Math.floor(size / 2)
  const midCol = Math.floor(size / 2)
  const top = row < midRow ? 0 : 2
  const left = col < midCol ? 0 : 1
  return top + left
}

function pickTargetIndex(size, previousRegion, rng) {
  const total = size * size
  let index = Math.floor(rng() * total)
  if (previousRegion == null) return index
  let guard = 0
  while (regionFor(index, size) === previousRegion && guard < 100) {
    index = Math.floor(rng() * total)
    guard += 1
  }
  return index
}

function generateLetterContent(_difficulty, rng) {
  const sets = [
    { target: 'Q', distractor: 'O' },
    { target: 'G', distractor: 'C' },
    { target: 'B', distractor: 'R' },
  ]
  const set = pick(sets, rng)
  return {
    target: { kind: 'text', text: set.target },
    distractor: { kind: 'text', text: set.distractor },
  }
}

function generateOrientationContent(_difficulty, rng) {
  const sets = [
    { target: '↓', distractor: '↑' },
    { target: '→', distractor: '←' },
    { target: '↘', distractor: '↗' },
  ]
  const set = pick(sets, rng)
  return {
    target: { kind: 'text', text: set.target },
    distractor: { kind: 'text', text: set.distractor },
  }
}

function generateGapContent(_difficulty, rng) {
  const sets = [
    { target: '◖', distractor: '◗' },
    { target: '◓', distractor: '◒' },
  ]
  const set = pick(sets, rng)
  return {
    target: { kind: 'text', text: set.target },
    distractor: { kind: 'text', text: set.distractor },
  }
}

function generateShapeContent(_difficulty, _rng) {
  return {
    target: { kind: 'shape', shape: 'pentagon' },
    distractor: { kind: 'shape', shape: 'hexagon' },
  }
}

function generateColorContent(difficulty, rng) {
  const hue = Math.floor(rng() * 360)
  const saturation = 70
  const baseLightness = 45
  const delta =
    difficulty === DIFFICULTY.EASY ? 22 : difficulty === DIFFICULTY.MEDIUM ? 12 : 6
  const targetLightness = Math.min(baseLightness + delta, 92)
  return {
    target: {
      kind: 'shape',
      shape: 'square',
      color: `hsl(${hue} ${saturation}% ${targetLightness}%)`,
    },
    distractor: {
      kind: 'shape',
      shape: 'square',
      color: `hsl(${hue} ${saturation}% ${baseLightness}%)`,
    },
  }
}

function generateSizeContent(difficulty, rng) {
  const shape = rng() > 0.5 ? 'square' : 'circle'
  const scale =
    difficulty === DIFFICULTY.EASY ? 0.5 : difficulty === DIFFICULTY.MEDIUM ? 0.7 : 0.85
  return {
    target: { kind: 'shape', shape, scale },
    distractor: { kind: 'shape', shape, scale: 1 },
  }
}

function generateRotationContent(difficulty, rng) {
  const shape = rng() > 0.5 ? 'square' : 'diamond'
  const angle =
    difficulty === DIFFICULTY.EASY ? 90 : difficulty === DIFFICULTY.MEDIUM ? 45 : 22.5
  return {
    target: { kind: 'shape', shape, rotation: angle },
    distractor: { kind: 'shape', shape, rotation: 0 },
  }
}

const CONTENT_GENERATORS = {
  letter: generateLetterContent,
  shape: generateShapeContent,
  orientation: generateOrientationContent,
  gap: generateGapContent,
  color: generateColorContent,
  size: generateSizeContent,
  rotation: generateRotationContent,
}

function pickPuzzleType(previousType, rng) {
  let type = pick(PUZZLE_TYPES, rng)
  let guard = 0
  while (type === previousType && guard < 10) {
    type = pick(PUZZLE_TYPES, rng)
    guard += 1
  }
  return type
}

export function generateRound(difficulty, previousRegion, previousType, rng) {
  const size = gridSizeFor(difficulty)
  const type = pickPuzzleType(previousType, rng)
  const generator = CONTENT_GENERATORS[type]
  const { target, distractor } = generator(difficulty, rng)
  const targetIndex = pickTargetIndex(size, previousRegion, rng)
  const cells = Array.from({ length: size * size }, (_, i) => ({
    ...(i === targetIndex ? target : distractor),
    isTarget: i === targetIndex,
  }))

  return {
    type,
    size,
    targetIndex,
    target,
    distractor,
    cells,
    region: regionFor(targetIndex, size),
  }
}

export function generateRounds(difficulty, seed = Date.now()) {
  const rng = createRng(seed)
  const rounds = []
  let previousRegion = null
  let previousType = null
  for (let i = 0; i < ROUNDS; i += 1) {
    const round = generateRound(difficulty, previousRegion, previousType, rng)
    rounds.push(round)
    previousRegion = round.region
    previousType = round.type
  }
  return rounds
}

export function computeStats(results) {
  const hits = results.filter((r) => r.hit).length
  const accuracy = Math.round((hits / results.length) * 100)
  const reactionTimes = results
    .map((r) => r.reactionMs)
    .filter((ms) => ms != null && Number.isFinite(ms))
  const avgTime =
    reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : null
  const fastest = reactionTimes.length > 0 ? Math.min(...reactionTimes) : null
  const score = results.reduce((sum, r) => sum + r.score, 0)
  return {
    score,
    accuracy,
    avgTime,
    fastest,
    hits,
    total: results.length,
  }
}
