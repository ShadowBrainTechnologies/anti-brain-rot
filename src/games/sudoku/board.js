// Parse an 81-char puzzle/solution string into a 9x9 grid of numbers.
// '-' (or '.') becomes 0 (empty). Returns number[][].
export function parseBoard(str) {
  const cells = []
  for (let i = 0; i < 81; i++) {
    const ch = str[i]
    cells.push(ch === '-' || ch === '.' ? 0 : Number(ch))
  }
  const grid = []
  for (let r = 0; r < 9; r++) grid.push(cells.slice(r * 9, r * 9 + 9))
  return grid
}

// Identify which cells are part of the original puzzle (fixed/given).
export function parseGivenMask(str) {
  const mask = []
  for (let i = 0; i < 81; i++) {
    const ch = str[i]
    mask.push(ch !== '-' && ch !== '.')
  }
  const grid = []
  for (let r = 0; r < 9; r++) grid.push(mask.slice(r * 9, r * 9 + 9))
  return grid
}

// Build a set of conflicting cell indices for the current values grid.
// A cell conflicts if its value appears elsewhere in its row, col, or 3x3 box.
export function findConflicts(values) {
  const conflict = Array.from({ length: 81 }, () => false)

  const markGroup = (indices) => {
    const seen = new Map()
    for (const idx of indices) {
      const v = values[idx]
      if (v === 0) continue
      if (seen.has(v)) {
        conflict[idx] = true
        conflict[seen.get(v)] = true
      } else {
        seen.set(v, idx)
      }
    }
  }

  for (let r = 0; r < 9; r++) markGroup([...Array(9)].map((_, c) => r * 9 + c))
  for (let c = 0; c < 9; c++) markGroup([...Array(9)].map((_, r) => r * 9 + c))
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const indices = []
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          indices.push((br * 3 + r) * 9 + (bc * 3 + c))
        }
      }
      markGroup(indices)
    }
  }

  return conflict
}

// True when every cell is filled and there are no conflicts.
export function isSolved(values) {
  if (values.some((v) => v === 0)) return false
  return findConflicts(values).every((c) => !c)
}

export const idx = (r, c) => r * 9 + c
export const rowOf = (i) => Math.floor(i / 9)
export const colOf = (i) => i % 9
