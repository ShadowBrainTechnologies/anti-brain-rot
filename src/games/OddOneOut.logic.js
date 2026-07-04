// Odd One Out - puzzle generator.
// Each puzzle shows four objects. Three share a hidden rule; one violates it.

export const PUZZLE_COUNT = 20
export const FEEDBACK_MS = 1200

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const RULE_NAMES = {
  shape: 'shape',
  rotation: 'direction',
  size: 'size',
  count: 'dot count',
  symmetry: 'symmetry',
  fill: 'fill style',
  color: 'color',
  border: 'border style',
}

export const SIZE_RADIUS = {
  large: 30,
  medium: 23,
  small: 16,
}

const NAMED_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#f97316',
  '#a855f7',
  '#14b8a6',
  '#ec4899',
  '#eab308',
]

function hsl(h) {
  return `hsl(${h}, 70%, 50%)`
}

const SYMMETRICAL_SHAPES = [
  'circle',
  'square',
  'triangle',
  'pentagon',
  'hexagon',
  'star',
  'diamond',
]
const ASYMMETRICAL_SHAPES = ['arrow', 'crescent', 'lightning']
const ALL_SHAPES = [...SYMMETRICAL_SHAPES, ...ASYMMETRICAL_SHAPES]

const SIMILAR_GROUPS = [
  ['circle', 'square'],
  ['triangle', 'diamond'],
  ['pentagon', 'star'],
  ['hexagon', 'circle'],
]

function polygonPath(n, radius) {
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    points.push(`${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`)
  }
  return `M ${points.join(' L ')} Z`
}

function starPath(points, innerRadius, outerRadius) {
  const path = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const angle = -Math.PI / 2 + (i * Math.PI) / points
    path.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`)
  }
  return `M ${path.join(' L ')} Z`
}

export const SHAPE_DEFS = {
  circle: {
    symmetrical: true,
    path: (r) => `M 50,${50 - r} A ${r},${r} 0 1,1 50,${50 + r} A ${r},${r} 0 1,1 50,${50 - r} z`,
  },
  square: {
    symmetrical: true,
    path: (r) => `M ${50 - r},${50 - r} H ${50 + r} V ${50 + r} H ${50 - r} Z`,
  },
  triangle: {
    symmetrical: true,
    path: (r) => {
      const pts = []
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
        pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`)
      }
      return `M ${pts.join(' L ')} Z`
    },
  },
  pentagon: {
    symmetrical: true,
    path: (r) => polygonPath(5, r),
  },
  hexagon: {
    symmetrical: true,
    path: (r) => polygonPath(6, r),
  },
  star: {
    symmetrical: true,
    path: (r) => starPath(5, r * 0.45, r),
  },
  diamond: {
    symmetrical: true,
    path: (r) => `M 50,${50 - r} L ${50 + r},50 L 50,${50 + r} L ${50 - r},50 Z`,
  },
  arrow: {
    symmetrical: false,
    path: (r) =>
      `M ${50 - r},${50 - r * 0.35} L ${50 + r * 0.2},${50 - r * 0.35} L ${50 + r * 0.2},${50 - r * 0.7} L ${50 + r},50 L ${50 + r * 0.2},${50 + r * 0.7} L ${50 + r * 0.2},${50 + r * 0.35} L ${50 - r},${50 + r * 0.35} Z`,
  },
  crescent: {
    symmetrical: false,
    path: (r) =>
      `M ${50 + r * 0.2},${50 - r} A ${r},${r} 0 1,1 ${50 + r * 0.2},${50 + r} A ${r * 0.65},${r * 0.65} 0 1,0 ${50 + r * 0.2},${50 - r} Z`,
  },
  lightning: {
    symmetrical: false,
    path: (r) =>
      `M ${50 - r * 0.3},${50 - r} L ${50 + r * 0.4},${50 - r * 0.1} L ${50 - r * 0.1},${50 - r * 0.1} L ${50 + r * 0.3},${50 + r} L ${50 - r * 0.4},${50 + r * 0.1} L ${50 + r * 0.1},${50 + r * 0.1} Z`,
  },
}

export const DOT_POSITIONS = {
  0: [],
  1: [[0, 0]],
  2: [
    [-12, 0],
    [12, 0],
  ],
  3: [
    [0, -12],
    [-10, 8],
    [10, 8],
  ],
  4: [
    [-10, -10],
    [10, -10],
    [10, 10],
    [-10, 10],
  ],
  5: [
    [0, 0],
    [-12, -12],
    [12, -12],
    [12, 12],
    [-12, 12],
  ],
  6: [
    [-12, -12],
    [12, -12],
    [12, 0],
    [-12, 0],
    [-12, 12],
    [12, 12],
  ],
  7: [
    [0, 0],
    [-12, -12],
    [12, -12],
    [12, 0],
    [-12, 0],
    [-12, 12],
    [12, 12],
  ],
  8: [
    [-12, -12],
    [12, -12],
    [12, 12],
    [-12, 12],
    [0, -12],
    [0, 12],
    [-12, 0],
    [12, 0],
  ],
}

export function createRng(seed) {
  let t = seed >>> 0
  return {
    random() {
      t += 0x6d2b79f5
      let r = Math.imul(t ^ (t >>> 15), 1 | t)
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    },
    int(min, max) {
      return Math.floor(this.random() * (max - min + 1)) + min
    },
    pick(arr) {
      return arr[Math.floor(this.random() * arr.length)]
    },
    shuffle(arr) {
      const copy = arr.slice()
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
  }
}

function makeBaseTemplate(rng) {
  return {
    shape: rng.pick(SYMMETRICAL_SHAPES),
    color: rng.pick(NAMED_COLORS),
    fill: 'filled',
    size: 'large',
    border: 'solid',
    rotation: 0,
    dotCount: 0,
    symmetry: true,
  }
}

function pickSecondaryValues(prop, base, objects, rng) {
  const usedShape = new Set([base.shape, objects.find((o) => o.shape !== base.shape)?.shape])
  const usedColor = new Set([base.color, objects.find((o) => o.color !== base.color)?.color])
  const usedCount = new Set([
    base.dotCount,
    objects.find((o) => o.dotCount !== base.dotCount)?.dotCount,
  ])

  if (prop === 'shape') {
    const pool = ALL_SHAPES.filter((s) => !usedShape.has(s))
    if (pool.length < 2) {
      const a = rng.pick(ALL_SHAPES)
      let b = rng.pick(ALL_SHAPES.filter((s) => s !== a))
      return [a, b]
    }
    const a = rng.pick(pool)
    const b = rng.pick(pool.filter((s) => s !== a))
    return [a, b]
  }

  if (prop === 'color') {
    const pool = NAMED_COLORS.filter((c) => !usedColor.has(c))
    if (pool.length < 2) {
      const a = rng.pick(NAMED_COLORS)
      const b = rng.pick(NAMED_COLORS.filter((c) => c !== a))
      return [a, b]
    }
    const a = rng.pick(pool)
    const b = rng.pick(pool.filter((c) => c !== a))
    return [a, b]
  }

  if (prop === 'fill') return ['filled', 'outlined']
  if (prop === 'border') return ['solid', 'dashed']

  if (prop === 'size') {
    const pool = ['large', 'medium', 'small'].filter((s) => s !== base.size)
    const a = rng.pick(pool)
    const b = rng.pick(pool.filter((s) => s !== a))
    return [a, b]
  }

  if (prop === 'rotation') {
    const opts = [0, 90, 180, 270].filter((a) => a !== base.rotation)
    const a = rng.pick(opts)
    const b = rng.pick(opts.filter((x) => x !== a))
    return [a, b]
  }

  if (prop === 'count') {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((n) => !usedCount.has(n))
    const a = rng.pick(pool)
    const b = rng.pick(pool.filter((n) => n !== a))
    return [a, b]
  }

  return [null, null]
}

function applySecondaryNoise(objects, excludeRule, rng, base) {
  const candidates = ['shape', 'color', 'fill', 'border', 'size', 'rotation', 'count'].filter(
    (p) => p !== excludeRule,
  )
  const prop = rng.pick(candidates)
  const [valA, valB] = pickSecondaryValues(prop, base, objects, rng)
  const pattern = rng.shuffle([0, 0, 1, 1])

  for (let i = 0; i < 4; i++) {
    const value = pattern[i] === 0 ? valA : valB
    if (prop === 'shape') {
      objects[i].shape = value
      objects[i].symmetry = SHAPE_DEFS[value].symmetrical
    } else if (prop === 'color') {
      objects[i].color = value
    } else if (prop === 'fill') {
      objects[i].fill = value
    } else if (prop === 'border') {
      objects[i].border = value
    } else if (prop === 'size') {
      objects[i].size = value
    } else if (prop === 'rotation') {
      objects[i].rotation = value
    } else if (prop === 'count') {
      objects[i].dotCount = value
    }
  }
}

export function isOnlyOdd(objects, answerIndex) {
  const props = ['shape', 'color', 'fill', 'size', 'border', 'rotation', 'dotCount', 'symmetry']
  for (const prop of props) {
    const counts = new Map()
    for (const obj of objects) {
      const v = obj[prop]
      counts.set(v, (counts.get(v) || 0) + 1)
    }
    for (const [value, count] of counts) {
      if (count === 1) {
        const uniqueIdx = objects.findIndex((o) => o[prop] === value)
        if (uniqueIdx !== answerIndex) return false
      }
    }
  }
  return true
}

function makePuzzle(base, ruleId, deviant, difficulty, rng) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const answerIndex = rng.int(0, 3)
    const objects = Array.from({ length: 4 }, () => ({ ...base }))
    objects[answerIndex] = { ...objects[answerIndex], ...deviant }

    if (difficulty === DIFFICULTY.HARD) {
      applySecondaryNoise(objects, ruleId, rng, base)
    }

    if (isOnlyOdd(objects, answerIndex)) {
      return {
        ruleId,
        ruleName: RULE_NAMES[ruleId],
        objects,
        answerIndex,
        explanation: `The odd one out differs in ${RULE_NAMES[ruleId]}.`,
        difficulty,
      }
    }
  }

  // Fallback: identical non-rule properties (guaranteed valid by construction).
  const answerIndex = rng.int(0, 3)
  const objects = Array.from({ length: 4 }, () => ({ ...base }))
  objects[answerIndex] = { ...objects[answerIndex], ...deviant }
  return {
    ruleId,
    ruleName: RULE_NAMES[ruleId],
    objects,
    answerIndex,
    explanation: `The odd one out differs in ${RULE_NAMES[ruleId]}.`,
    difficulty,
  }
}

const RULE_GENERATORS = {
  shape(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const baseShape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = baseShape
    base.symmetry = true

    let deviantShape
    if (difficulty === DIFFICULTY.EASY) {
      deviantShape = rng.pick(ALL_SHAPES.filter((s) => s !== baseShape))
    } else {
      const group = SIMILAR_GROUPS.find((g) => g.includes(baseShape))
      const candidates = group
        ? group.filter((s) => s !== baseShape)
        : ALL_SHAPES.filter((s) => s !== baseShape)
      deviantShape = rng.pick(candidates)
    }

    return makePuzzle(
      base,
      'shape',
      { shape: deviantShape, symmetry: SHAPE_DEFS[deviantShape].symmetrical },
      difficulty,
      rng,
    )
  },

  rotation(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(ASYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = false

    const rotation = difficulty === DIFFICULTY.EASY ? 180 : 60
    return makePuzzle(base, 'rotation', { rotation }, difficulty, rng)
  },

  size(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = true

    const size = difficulty === DIFFICULTY.EASY ? 'small' : 'medium'
    return makePuzzle(base, 'size', { size }, difficulty, rng)
  },

  count(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = true
    base.dotCount = 4

    const dotCount = difficulty === DIFFICULTY.EASY ? 8 : 5
    return makePuzzle(base, 'count', { dotCount }, difficulty, rng)
  },

  symmetry(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = true

    const deviantShape = rng.pick(ASYMMETRICAL_SHAPES)
    return makePuzzle(
      base,
      'symmetry',
      { shape: deviantShape, symmetry: false },
      difficulty,
      rng,
    )
  },

  fill(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = true

    return makePuzzle(base, 'fill', { fill: 'outlined' }, difficulty, rng)
  },

  color(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = true

    const hue = rng.int(0, 359)
    base.color = hsl(hue)
    const offset = difficulty === DIFFICULTY.EASY ? 120 : 30
    return makePuzzle(base, 'color', { color: hsl((hue + offset) % 360) }, difficulty, rng)
  },

  border(difficulty, rng) {
    const base = makeBaseTemplate(rng)
    const shape = rng.pick(SYMMETRICAL_SHAPES)
    base.shape = shape
    base.symmetry = true

    return makePuzzle(base, 'border', { border: 'dashed' }, difficulty, rng)
  },
}

export const RULE_IDS = Object.keys(RULE_GENERATORS)

export function generatePuzzle(ruleId, difficulty, rng) {
  const generator = RULE_GENERATORS[ruleId]
  for (let attempt = 0; attempt < 10; attempt++) {
    const puzzle = generator(difficulty, rng)
    if (isOnlyOdd(puzzle.objects, puzzle.answerIndex)) return puzzle
  }
  return RULE_GENERATORS[ruleId](difficulty, rng)
}

export function generateSession(difficulty, seed, count = PUZZLE_COUNT) {
  const rng = createRng(seed)
  const puzzles = []
  let lastRule = null
  for (let i = 0; i < count; i++) {
    let ruleId
    do {
      ruleId = rng.pick(RULE_IDS)
    } while (ruleId === lastRule)
    lastRule = ruleId
    puzzles.push(generatePuzzle(ruleId, difficulty, rng))
  }
  return puzzles
}
