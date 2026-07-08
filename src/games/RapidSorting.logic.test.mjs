import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PIVOT,
  SESSION_SECONDS,
  randomItem,
  correctSide,
  isCorrect,
} from './RapidSorting.logic.js'

describe('RapidSorting.logic', () => {
  it('randomItem returns a value within range using the provided rng', () => {
    const stubZero = () => 0
    const stubHigh = () => 0.999
    assert.equal(randomItem(1, 99, stubZero), 1)
    assert.equal(randomItem(1, 99, stubHigh), 99)
  })

  it('correctSide returns left for item < pivot and right for item >= pivot', () => {
    assert.equal(correctSide(PIVOT - 1, PIVOT), 'left')
    assert.equal(correctSide(0, PIVOT), 'left')
    assert.equal(correctSide(PIVOT, PIVOT), 'right')
    assert.equal(correctSide(PIVOT + 1, PIVOT), 'right')
  })

  it('isCorrect agrees with correctSide for every boundary', () => {
    for (let item = 0; item <= 100; item++) {
      const expected = correctSide(item, PIVOT)
      assert.equal(isCorrect(item, PIVOT, expected), true)
      assert.equal(
        isCorrect(item, PIVOT, expected === 'left' ? 'right' : 'left'),
        false,
      )
    }
  })

  it('randomItem defaults use Math.random and produce values in the default range', () => {
    for (let i = 0; i < 100; i++) {
      const value = randomItem()
      assert.ok(value >= 1 && value <= 99)
    }
  })

  it('SESSION_SECONDS is positive and PIVOT is within the default item range', () => {
    assert.ok(SESSION_SECONDS > 0)
    assert.ok(PIVOT >= 1 && PIVOT <= 99)
  })
})
