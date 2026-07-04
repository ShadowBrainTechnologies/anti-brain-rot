import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DIFFICULTY_SETTINGS,
  FEEDBACK_MS,
  SESSION_TIME_MS,
  TOTAL_PUZZLES,
  centerCells,
  generatePuzzle,
  generateShape,
  modifyCells,
} from './MentalRotation.logic.js'

function transformGrid(cells, transform) {
  return cells.map(([x, y]) => transform(x, y))
}

function round6(n) {
  return Math.round(n * 1_000_000) / 1_000_000
}

// Rotation/reflection-invariant fingerprint using unordered triples.
// Rotation preserves the values; reflection negates them.
function shapeFingerprint(cells) {
  const values = []
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      for (let k = j + 1; k < cells.length; k++) {
        const [x1, y1] = cells[i]
        const [x2, y2] = cells[j]
        const [x3, y3] = cells[k]
        values.push((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1))
      }
    }
  }
  values.sort((a, b) => a - b)
  return values
}

function fingerprintsEqual(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
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
  return points
    .map(([x, y]) => [round6(x - minX), round6(y - minY)])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map((p) => p.join(','))
    .join('|')
}

const D4_TRANSFORMS = [
  (x, y) => [x, y], // identity
  (x, y) => [-y, x], // 90°
  (x, y) => [-x, -y], // 180°
  (x, y) => [y, -x], // 270°
  (x, y) => [-x, y], // mirror X
  (x, y) => [x, -y], // mirror Y
  (x, y) => [y, x], // mirror main diagonal
  (x, y) => [-y, -x], // mirror anti-diagonal
]

describe('MentalRotation.logic', () => {
  it('generates shapes of the requested size', () => {
    for (let size = 4; size <= 12; size++) {
      const shape = generateShape(size)
      assert.equal(shape.length, size)
    }
  })

  it('centers shapes around the origin', () => {
    const shape = generateShape(8)
    const centered = centerCells(shape)
    const cx = centered.reduce((s, [x]) => s + x, 0) / centered.length
    const cy = centered.reduce((s, [, y]) => s + y, 0) / centered.length
    assert.ok(Math.abs(cx) < 1e-9 && Math.abs(cy) < 1e-9)
  })

  it('modifies a shape by exactly one cell', () => {
    const shape = generateShape(8)
    const modified = modifyCells(shape)
    assert.equal(Math.abs(modified.length - shape.length), 1)
  })

  it('generates D4-asymmetric shapes', () => {
    for (let size = 4; size <= 12; size++) {
      const shape = generateShape(size)
      const baseSig = signature(shape, 0, 1, 1)
      for (let i = 1; i < D4_TRANSFORMS.length; i++) {
        const candidateSig = signature(transformGrid(shape, D4_TRANSFORMS[i]), 0, 1, 1)
        assert.ok(
          candidateSig !== baseSig,
          `shape of size ${size} matches a non-identity D4 transform`,
        )
      }
    }
  })

  it('generates exactly one correct option per puzzle', () => {
    for (let difficulty = 0; difficulty < DIFFICULTY_SETTINGS.length; difficulty++) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzle(difficulty)
        const correct = puzzle.options.filter((o) => o.type === 'correct')
        assert.equal(correct.length, 1)
        assert.ok(puzzle.correctIndex >= 0 && puzzle.correctIndex < 4)
      }
    }
  })

  it('produces four visually distinct options per puzzle', () => {
    for (let difficulty = 0; difficulty < DIFFICULTY_SETTINGS.length; difficulty++) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzle(difficulty)
        const sigs = new Set()
        for (const opt of puzzle.options) {
          const sig = signature(opt.cells, opt.angle, opt.scaleX, opt.scaleY)
          assert.ok(!sigs.has(sig), `duplicate option signature at difficulty ${difficulty}`)
          sigs.add(sig)
        }
      }
    }
  })

  it('only the correct option is a rotated copy of the target', () => {
    for (let difficulty = 0; difficulty < DIFFICULTY_SETTINGS.length; difficulty++) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzle(difficulty)
        const targetFp = shapeFingerprint(puzzle.canonical)
        for (const opt of puzzle.options) {
          // Remove the option's rotation (rotation does not change the fingerprint).
          // Keep any reflection, because a reflected shape is not a valid rotation.
          const oriented =
            opt.scaleX === -1 ? transformGrid(opt.cells, (x, y) => [-x, y]) : opt.cells
          const fp = shapeFingerprint(oriented)
          if (opt.type === 'correct') {
            assert.ok(
              fingerprintsEqual(fp, targetFp),
              `correct option is not a rotation of the target at difficulty ${difficulty}`,
            )
          } else {
            assert.ok(
              !fingerprintsEqual(fp, targetFp),
              `distractor is a rotation of the target at difficulty ${difficulty}`,
            )
          }
        }
      }
    }
  })

  it('mirror option is always a reflection of the target, not a rotation', () => {
    for (let difficulty = 0; difficulty < DIFFICULTY_SETTINGS.length; difficulty++) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzle(difficulty)
        const mirror = puzzle.options.find((o) => o.type === 'mirror')
        assert.ok(mirror, 'mirror distractor missing')
        const targetFp = shapeFingerprint(puzzle.canonical)
        const reflectedFp = shapeFingerprint(transformGrid(mirror.cells, (x, y) => [-x, y]))
        assert.ok(
          fingerprintsEqual(reflectedFp, targetFp.map((v) => -v).sort((a, b) => a - b)),
          'mirror option is not a reflection of the target',
        )
      }
    }
  })

  it('wrong-rotation distractor uses a different shape than the target', () => {
    for (let difficulty = 0; difficulty < DIFFICULTY_SETTINGS.length; difficulty++) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzle(difficulty)
        const wrong = puzzle.options.find((o) => o.type === 'wrong')
        assert.notEqual(
          wrong.cells.length,
          puzzle.canonical.length,
          'wrong-rotation distractor is the same size as the target',
        )
      }
    }
  })

  it('exports session constants', () => {
    assert.equal(TOTAL_PUZZLES, 20)
    assert.equal(SESSION_TIME_MS, 90_000)
    assert.equal(FEEDBACK_MS, 500)
  })
})
