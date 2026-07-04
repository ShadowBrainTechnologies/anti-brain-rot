// Pure shape generation / transformation logic for Mental Rotation.

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

export const TOTAL_PUZZLES = 20
export const SESSION_TIME_MS = 90_000
export const FEEDBACK_MS = 500

export const DIFFICULTY_SETTINGS = [
  { label: 'Easy', minSeg: 4, maxSeg: 6, angles: [0, 90, 180, 270] },
  { label: 'Medium', minSeg: 6, maxSeg: 8, angles: [0, 45, 90, 135, 180, 225, 270, 315] },
  { label: 'Hard', minSeg: 8, maxSeg: 12, angles: 'any' },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function key(x, y) {
  return `${x},${y}`
}

export function centerCells(cells) {
  if (cells.length === 0) return []
  let cx = 0
  let cy = 0
  for (const [x, y] of cells) {
    cx += x
    cy += y
  }
  cx /= cells.length
  cy /= cells.length
  return cells.map(([x, y]) => [x - cx, y - cy])
}

function transformGrid(cells, transform) {
  return cells.map(([x, y]) => transform(x, y))
}

function isSymmetric(cells) {
  // Compare centered-and-normalized signatures so symmetries around the
  // centroid are detected (the same way the SVG renderer centers shapes).
  const baseSig = signature(cells, 0, 1, 1)
  const transforms = [
    (x, y) => [-y, x], // 90°
    (x, y) => [-x, -y], // 180°
    (x, y) => [y, -x], // 270°
    (x, y) => [-x, y], // mirror X
    (x, y) => [x, -y], // mirror Y
    (x, y) => [y, x], // mirror main diagonal
    (x, y) => [-y, -x], // mirror anti-diagonal
  ]
  return transforms.some((t) => {
    const candidate = signature(transformGrid(cells, t), 0, 1, 1)
    return candidate === baseSig
  })
}

function generateCells(size) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const cells = [[0, 0]]
    const occupied = new Set([key(0, 0)])
    let tries = 0
    while (cells.length < size && tries < 1000) {
      const [x, y] = cells[randomInt(0, cells.length - 1)]
      const [dx, dy] = DIRECTIONS[randomInt(0, DIRECTIONS.length - 1)]
      const nx = x + dx
      const ny = y + dy
      const k = key(nx, ny)
      if (!occupied.has(k)) {
        occupied.add(k)
        cells.push([nx, ny])
      }
      tries++
    }
    if (cells.length === size) return cells
  }
  // Fallback: straight line (should be very rare).
  const fallback = []
  for (let i = 0; i < size; i++) fallback.push([i, 0])
  return fallback
}

export function generateShape(size) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const cells = generateCells(size)
    if (!isSymmetric(cells)) return cells
  }
  // Last resort even if symmetric.
  return generateCells(size)
}

function round6(n) {
  return Math.round(n * 1_000_000) / 1_000_000
}

function signature(cells, angle, scaleX, scaleY) {
  const centered = centerCells(cells)
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const points = centered.map(([x, y]) => {
    const sx = x * scaleX
    const sy = y * scaleY
    const rx = sx * cos - sy * sin
    const ry = sx * sin + sy * cos
    return [round6(rx), round6(ry)]
  })
  const minX = Math.min(...points.map(([x]) => x))
  const minY = Math.min(...points.map(([, y]) => y))
  const normalized = points
    .map(([x, y]) => [round6(x - minX), round6(y - minY)])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return normalized.map((p) => p.join(',')).join('|')
}

function signaturesUnique(options) {
  const seen = new Set()
  for (const opt of options) {
    const sig = signature(opt.cells, opt.angle, opt.scaleX, opt.scaleY)
    if (seen.has(sig)) return false
    seen.add(sig)
  }
  return true
}

function pickAngle(settings, exclude = []) {
  if (settings.angles === 'any') {
    const excluded = new Set(exclude)
    for (let attempt = 0; attempt < 1000; attempt++) {
      const angle = randomInt(0, 359)
      if (excluded.has(angle)) continue
      // Keep hard-mode angles visually distinct from excluded ones.
      const tooClose = exclude.some((a) => Math.abs(((angle - a + 180) % 360) - 180) < 10)
      if (!tooClose) return angle
    }
    return randomInt(0, 359)
  }
  const pool = settings.angles.filter((a) => !exclude.includes(a))
  if (pool.length === 0) return settings.angles[randomInt(0, settings.angles.length - 1)]
  return pool[randomInt(0, pool.length - 1)]
}

function getNeighbors([x, y]) {
  return DIRECTIONS.map(([dx, dy]) => [x + dx, y + dy])
}

function isConnected(cells) {
  if (cells.length === 0) return false
  const occupied = new Set(cells.map(([x, y]) => key(x, y)))
  const start = key(cells[0][0], cells[0][1])
  const queue = [cells[0]]
  const visited = new Set([start])
  while (queue.length > 0) {
    const [x, y] = queue.shift()
    for (const [nx, ny] of getNeighbors([x, y])) {
      const k = key(nx, ny)
      if (occupied.has(k) && !visited.has(k)) {
        visited.add(k)
        queue.push([nx, ny])
      }
    }
  }
  return visited.size === cells.length
}

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function modifyCells(cells) {
  const occupied = new Set(cells.map(([x, y]) => key(x, y)))
  const operation = Math.random() < 0.5 && cells.length > 2 ? 'remove' : 'add'

  if (operation === 'remove') {
    const order = shuffle(cells)
    for (const [x, y] of order) {
      const next = cells.filter(([cx, cy]) => cx !== x || cy !== y)
      if (isConnected(next)) return next
    }
  }

  // Add a cell adjacent to the shape.
  const order = shuffle(cells)
  for (const [x, y] of order) {
    const candidates = shuffle(getNeighbors([x, y]))
    for (const [nx, ny] of candidates) {
      if (!occupied.has(key(nx, ny))) {
        return [...cells, [nx, ny]]
      }
    }
  }

  return cells
}

export function generatePuzzle(difficultyIndex = 0) {
  const settings = DIFFICULTY_SETTINGS[difficultyIndex]
  const size = randomInt(settings.minSeg, settings.maxSeg)
  const canonical = generateShape(size)

  const correctAngle = pickAngle(settings)
  const baseOptions = [
    { cells: canonical, angle: correctAngle, scaleX: 1, scaleY: 1, type: 'correct' },
  ]

  for (let attempt = 0; attempt < 50; attempt++) {
    const options = [...baseOptions]

    const mirrorAngle = pickAngle(settings, [correctAngle])
    options.push({ cells: canonical, angle: mirrorAngle, scaleX: -1, scaleY: 1, type: 'mirror' })

    const modifiedCells = modifyCells(canonical)
    const modifiedAngle = pickAngle(settings, [correctAngle])
    options.push({ cells: modifiedCells, angle: modifiedAngle, scaleX: 1, scaleY: 1, type: 'modified' })

    // The "wrong rotation" distractor rotates the *modified* shape, so it can
    // never be mistaken for a pure rotation of the canonical target.
    const wrongAngle = pickAngle(settings, [correctAngle, modifiedAngle])
    options.push({ cells: modifiedCells, angle: wrongAngle, scaleX: 1, scaleY: 1, type: 'wrong' })

    if (signaturesUnique(options)) {
      const shuffled = shuffle(options)
      const correctIndex = shuffled.findIndex((o) => o.type === 'correct')
      return { canonical, options: shuffled, correctIndex, difficultyIndex }
    }
  }

  // Fallback: keep trying with a fresh shape.
  return generatePuzzle(difficultyIndex)
}
