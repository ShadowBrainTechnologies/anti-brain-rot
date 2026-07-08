import assert from 'node:assert'
import { describe, it } from 'node:test'
import {
  PALETTE,
  buildGrid,
  removeOne,
  buildChoices,
  isCorrect,
} from './MissingPieces.logic.js'

function fixedRng(seq) {
  let i = 0
  return () => seq[i++ % seq.length]
}

describe('MissingPieces logic', () => {
  it('buildGrid length == size and all colors are from the palette', () => {
    const rng = fixedRng([0, 0.2, 0.5, 0.8, 0.1, 0.9, 0.3, 0.6, 0.4])
    const grid = buildGrid(9, PALETTE, rng)
    assert.strictEqual(grid.length, 9)
    for (const color of grid) {
      assert(PALETTE.includes(color), `expected color ${color.name} to be in palette`)
    }
  })

  it('removeOne returns a valid index and the value that was at it', () => {
    const gridRng = fixedRng([0, 0.2, 0.5, 0.8, 0.1, 0.9, 0.3, 0.6, 0.4])
    const grid = buildGrid(9, PALETTE, gridRng)
    const removeRng = fixedRng([0.3])
    const { index, missingValue } = removeOne(grid, removeRng)
    assert.strictEqual(typeof index, 'number')
    assert(index >= 0 && index < grid.length)
    assert.strictEqual(missingValue, grid[index])
  })

  it('buildChoices includes the missing value', () => {
    const gridRng = fixedRng([0, 0.2, 0.5, 0.8, 0.1, 0.9, 0.3, 0.6, 0.4])
    const grid = buildGrid(9, PALETTE, gridRng)
    const { missingValue } = removeOne(grid, fixedRng([0.5]))
    const choices = buildChoices(missingValue, PALETTE, fixedRng([0, 0, 0]))
    assert(choices.includes(missingValue), 'expected choices to include missing value')
  })

  it('isCorrect returns true only for the missing value', () => {
    const a = PALETTE[0]
    const b = PALETTE[1]
    assert.strictEqual(isCorrect(a, a), true)
    assert.strictEqual(isCorrect(a, b), false)
  })
})
