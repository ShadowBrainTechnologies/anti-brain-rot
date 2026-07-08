import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  TILE_COUNT,
  START_LENGTH,
  GRID_SIZE,
  generateSequence,
  isCorrectSoFar,
  isComplete,
} from './FollowTheLeader.logic.js'

describe('FollowTheLeader.logic', () => {
  it('generateSequence returns an array of the requested length in tile range', () => {
    const sequence = generateSequence(5, TILE_COUNT)
    assert.equal(sequence.length, 5)
    for (const index of sequence) {
      assert.ok(index >= 0)
      assert.ok(index < TILE_COUNT)
      assert.ok(Number.isInteger(index))
    }
  })

  it('generateSequence with a stubbed rng produces deterministic values', () => {
    let value = 0
    const rng = () => {
      value = (value + 0.34) % 1
      return value
    }
    const sequence = generateSequence(4, TILE_COUNT, rng)
    assert.equal(sequence.length, 4)
    assert.deepEqual(sequence, [3, 6, 0, 3])
  })

  it('isCorrectSoFar returns true for matching prefixes and false on any mismatch', () => {
    const sequence = [2, 5, 1, 7]
    assert.equal(isCorrectSoFar(sequence, []), true)
    assert.equal(isCorrectSoFar(sequence, [2]), true)
    assert.equal(isCorrectSoFar(sequence, [2, 5]), true)
    assert.equal(isCorrectSoFar(sequence, [2, 5, 1, 7]), true)
    assert.equal(isCorrectSoFar(sequence, [3]), false)
    assert.equal(isCorrectSoFar(sequence, [2, 4]), false)
    assert.equal(isCorrectSoFar(sequence, [2, 5, 1, 8]), false)
    assert.equal(isCorrectSoFar(sequence, [2, 5, 1, 7, 0]), false)
  })

  it('isComplete is true only on a full, correct match', () => {
    const sequence = [2, 5, 1, 7]
    assert.equal(isComplete(sequence, []), false)
    assert.equal(isComplete(sequence, [2, 5]), false)
    assert.equal(isComplete(sequence, [2, 5, 1, 7]), true)
    assert.equal(isComplete(sequence, [2, 5, 1, 8]), false)
    assert.equal(isComplete(sequence, [2, 5, 1, 7, 0]), false)
  })

  it('TILE_COUNT matches GRID_SIZE squared and START_LENGTH is positive', () => {
    assert.equal(TILE_COUNT, GRID_SIZE * GRID_SIZE)
    assert.ok(START_LENGTH > 0)
  })
})
