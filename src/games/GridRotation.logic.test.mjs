import assert from 'node:assert'
import { describe, it } from 'node:test'
import {
  rotateIndex,
  buildRotatedOrder,
  sizeForWins,
  blueCountForSize,
  setsEqual,
} from './GridRotation.logic.js'

describe('GridRotation logic', () => {
  it('rotates 90° clockwise correctly for a 3x3 grid', () => {
    // 0 1 2    6 3 0
    // 3 4 5 -> 7 4 1
    // 6 7 8    8 5 2
    assert.strictEqual(rotateIndex(0, 3, 90), 2)
    assert.strictEqual(rotateIndex(1, 3, 90), 5)
    assert.strictEqual(rotateIndex(2, 3, 90), 8)
    assert.strictEqual(rotateIndex(3, 3, 90), 1)
    assert.strictEqual(rotateIndex(4, 3, 90), 4)
    assert.strictEqual(rotateIndex(5, 3, 90), 7)
    assert.strictEqual(rotateIndex(6, 3, 90), 0)
    assert.strictEqual(rotateIndex(7, 3, 90), 3)
    assert.strictEqual(rotateIndex(8, 3, 90), 6)
  })

  it('rotates 90° counter-clockwise correctly for a 3x3 grid', () => {
    // 0 1 2    2 5 8
    // 3 4 5 -> 1 4 7
    // 6 7 8    0 3 6
    assert.strictEqual(rotateIndex(0, 3, 270), 6)
    assert.strictEqual(rotateIndex(1, 3, 270), 3)
    assert.strictEqual(rotateIndex(2, 3, 270), 0)
    assert.strictEqual(rotateIndex(3, 3, 270), 7)
    assert.strictEqual(rotateIndex(4, 3, 270), 4)
    assert.strictEqual(rotateIndex(5, 3, 270), 1)
    assert.strictEqual(rotateIndex(6, 3, 270), 8)
    assert.strictEqual(rotateIndex(7, 3, 270), 5)
    assert.strictEqual(rotateIndex(8, 3, 270), 2)
  })

  it('buildRotatedOrder inverts rotateIndex', () => {
    for (const size of [3, 4, 5]) {
      for (const degrees of [90, 270]) {
        const order = buildRotatedOrder(size, degrees)
        for (let visualPos = 0; visualPos < size * size; visualPos++) {
          const originalIndex = order[visualPos]
          assert.strictEqual(
            rotateIndex(originalIndex, size, degrees),
            visualPos,
            `size=${size} deg=${degrees} visualPos=${visualPos}`,
          )
        }
      }
    }
  })

  it('expected set matches visual positions after rotation', () => {
    const size = 3
    const original = new Set([0, 4, 8]) // main diagonal
    const degrees = 90
    const expected = new Set([...original].map((i) => rotateIndex(i, size, degrees)))
    // 0 -> 2, 4 -> 4, 8 -> 6
    assert.deepStrictEqual([...expected].sort((a, b) => a - b), [2, 4, 6])

    const order = buildRotatedOrder(size, degrees)
    // The cells the player should click are the visual positions in `expected`.
    // Those visual positions map back to the original indices via `order`.
    const clickedOriginalIndices = new Set([...expected].map((pos) => order[pos]))
    assert(setsEqual(clickedOriginalIndices, original))
  })

  it('size and blue count scale with wins', () => {
    assert.strictEqual(sizeForWins(0), 3)
    assert.strictEqual(sizeForWins(2), 3)
    assert.strictEqual(sizeForWins(3), 4)
    assert.strictEqual(sizeForWins(5), 4)
    assert.strictEqual(sizeForWins(6), 5)
    assert.strictEqual(sizeForWins(10), 5)

    assert.strictEqual(blueCountForSize(3), 3)
    assert.strictEqual(blueCountForSize(4), 5)
    assert.strictEqual(blueCountForSize(5), 7)
  })
})
