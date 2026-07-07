import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  GRID_SIZE,
  START_LENGTH,
  sequenceLengthFor,
  generateSequence,
  reverseSequence,
  highlightMsFor,
  gapMsFor,
} from './UnfollowTheLeader.logic.js'

describe('UnfollowTheLeader.logic', () => {
  it('sequenceLengthFor grows by 1 per level', () => {
    assert.equal(sequenceLengthFor(1), START_LENGTH)
    assert.equal(sequenceLengthFor(2), START_LENGTH + 1)
    assert.equal(sequenceLengthFor(5), START_LENGTH + 4)
    assert.equal(sequenceLengthFor(10), START_LENGTH + 9)
  })

  it('generateSequence returns correct length with values in range', () => {
    const seq = generateSequence(5)
    assert.equal(seq.length, 5)
    const max = GRID_SIZE * GRID_SIZE
    for (const val of seq) {
      assert.ok(val >= 0 && val < max)
      assert.equal(val, Math.floor(val))
    }
  })

  it('reverseSequence returns a correctly reversed NEW array without mutating input', () => {
    const original = [1, 2, 3, 4, 5]
    const copy = [...original]
    const reversed = reverseSequence(original)
    assert.deepEqual(reversed, [5, 4, 3, 2, 1])
    assert.deepEqual(original, copy, 'input must not be mutated')
    assert.notEqual(reversed, original, 'must return a new array')
  })

  it('highlightMsFor and gapMsFor are positive and non-increasing as level rises', () => {
    for (let level = 1; level < 20; level++) {
      assert.ok(highlightMsFor(level) > 0)
      assert.ok(gapMsFor(level) > 0)
      assert.ok(highlightMsFor(level + 1) <= highlightMsFor(level))
      assert.ok(gapMsFor(level + 1) <= gapMsFor(level))
    }
  })
})
