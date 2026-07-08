import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  SESSION_SECONDS,
  MAX_TABLE,
  CHOICE_COUNT,
  randomFactors,
  buildChoices,
  isCorrect,
} from './RapidMultiplication.logic.js'

describe('RapidMultiplication.logic', () => {
  it('randomFactors returns factors in range and a correct product with a stubbed rng', () => {
    let index = 0
    const values = [0, 0.5, 0.99, 0.25, 0.75]
    const rng = () => {
      const v = values[index % values.length]
      index++
      return v
    }

    for (let i = 0; i < 10; i++) {
      const { a, b, product } = randomFactors(MAX_TABLE, rng)
      assert.ok(a >= 1 && a <= MAX_TABLE, `a=${a} out of range`)
      assert.ok(b >= 1 && b <= MAX_TABLE, `b=${b} out of range`)
      assert.equal(product, a * b)
    }
  })

  it('buildChoices includes the product with no duplicates and has the expected length', () => {
    const rng = () => 0.5
    const choices = buildChoices(24, rng)
    assert.equal(choices.length, CHOICE_COUNT)
    assert.ok(choices.includes(24))
    assert.equal(new Set(choices).size, choices.length)
  })

  it('buildChoices returns only positive numbers distinct from the product', () => {
    const rng = () => 0
    for (const product of [1, 6, 12, 25, 64]) {
      const choices = buildChoices(product, rng)
      for (const choice of choices) {
        assert.ok(choice > 0)
      }
      assert.equal(new Set(choices).size, CHOICE_COUNT)
      assert.ok(choices.includes(product))
    }
  })

  it('isCorrect returns true only when the choice equals the product', () => {
    assert.equal(isCorrect(12, 12), true)
    assert.equal(isCorrect(12, 11), false)
    assert.equal(isCorrect(12, 13), false)
    assert.equal(isCorrect(1, 1), true)
    assert.equal(isCorrect(1, 2), false)
  })

  it('SESSION_SECONDS and MAX_TABLE are positive constants', () => {
    assert.ok(SESSION_SECONDS > 0)
    assert.ok(MAX_TABLE > 0)
  })
})
