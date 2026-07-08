import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import {
  TOTAL_ROUNDS,
  CHOICE_COUNT,
  randomBirdCount,
  buildChoices,
  isCorrect,
  countRangeForRound,
  flashDurationForRound,
} from './BirdWatching.logic.js'

describe('randomBirdCount', () => {
  it('returns min when rng yields 0', () => {
    assert.equal(randomBirdCount(3, 7, () => 0), 3)
  })

  it('returns max when rng yields just under 1', () => {
    assert.equal(randomBirdCount(3, 7, () => 0.999), 7)
  })

  it('returns a value within the inclusive range', () => {
    const n = randomBirdCount(5, 10, () => 0.5)
    assert.ok(n >= 5 && n <= 10)
  })
})

describe('buildChoices', () => {
  it('includes the answer, has correct length, and has no duplicates', () => {
    const choices = buildChoices(7, CHOICE_COUNT, () => 0.5)
    assert.ok(choices.includes(7))
    assert.equal(choices.length, CHOICE_COUNT)
    assert.equal(new Set(choices).size, CHOICE_COUNT)
  })

  it('is deterministic when rng is stubbed', () => {
    const choices = buildChoices(4, 4, () => 0.999)
    assert.deepStrictEqual(choices, [1, 2, 3, 4])
  })
})

describe('isCorrect', () => {
  it('returns true only for an exact match', () => {
    assert.equal(isCorrect(5, 5), true)
    assert.equal(isCorrect(5, 6), false)
  })
})

describe('round scaling', () => {
  it('grows the count range and shrinks the flash duration each round', () => {
    const early = countRangeForRound(1)
    const late = countRangeForRound(TOTAL_ROUNDS)
    assert.ok(late.min > early.min)
    assert.ok(late.max > early.max)
    assert.ok(flashDurationForRound(TOTAL_ROUNDS) < flashDurationForRound(1))
  })
})
