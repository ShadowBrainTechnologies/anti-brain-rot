import assert from 'node:assert'
import { describe, it } from 'node:test'
import {
  generateSequence,
  scoreRound,
  computeStats,
  nextDifficulty,
  START_N,
  START_LENGTH,
  MATCH_RATIO,
  MAX_N,
  MAX_LENGTH,
  LENGTH_STEP,
  ADVANCE_ACCURACY,
} from './NBack.logic.js'

describe('NBack logic', () => {
  it('generates a sequence of the requested length', () => {
    const { sequence } = generateSequence(20, 1)
    assert.strictEqual(sequence.length, 20)
    assert.ok(sequence.every((pos) => pos >= 0 && pos < 9))
  })

  it('produces the expected number of valid matches for 1-Back', () => {
    const length = 20
    const { sequence, matchIndices } = generateSequence(length, 1)
    const expectedMatches = Math.round(length * MATCH_RATIO)
    assert.strictEqual(matchIndices.size, expectedMatches)
    for (const i of matchIndices) {
      assert.strictEqual(sequence[i], sequence[i - 1])
    }
  })

  it('produces the expected number of valid matches for 2-Back', () => {
    const length = 20
    const { sequence, matchIndices } = generateSequence(length, 2)
    const expectedMatches = Math.round(length * MATCH_RATIO)
    assert.strictEqual(matchIndices.size, expectedMatches)
    for (const i of matchIndices) {
      assert.strictEqual(sequence[i], sequence[i - 2])
    }
  })

  it('does not create accidental matches on non-match rounds', () => {
    const { sequence, matchIndices } = generateSequence(20, 1)
    for (let i = 1; i < sequence.length; i++) {
      const isMatch = sequence[i] === sequence[i - 1]
      assert.strictEqual(isMatch, matchIndices.has(i))
    }
  })

  it('scores rounds correctly', () => {
    assert.strictEqual(scoreRound(true, true), 1)
    assert.strictEqual(scoreRound(false, false), 1)
    assert.strictEqual(scoreRound(true, false), -1)
    assert.strictEqual(scoreRound(false, true), -1)
  })

  it('computes accuracy and average reaction time', () => {
    const sequence = [0, 0, 1, 2, 2] // 1-Back: matches at 1 and 4
    const responses = [true, true, false, false, true]
    const reactionTimes = [null, 350, null, null, 420]
    const stats = computeStats(responses, reactionTimes, sequence, 1)
    // correct at 0? expected false, tapped true -> false; 1 true, 2 true, 3 true, 4 true -> 4/5
    assert.strictEqual(stats.correct, 4)
    assert.strictEqual(stats.score, 3) // 4 correct + 1 wrong
    assert.strictEqual(stats.accuracy, 80)
    assert.strictEqual(stats.avgReactionMs, Math.round((350 + 420) / 2))
  })

  it('advances sequence length before increasing N', () => {
    const result = nextDifficulty(ADVANCE_ACCURACY, START_N, START_LENGTH)
    assert.strictEqual(result.n, START_N)
    assert.strictEqual(result.length, START_LENGTH + LENGTH_STEP)
  })

  it('increases N only after sequence length is maxed', () => {
    const result = nextDifficulty(ADVANCE_ACCURACY, 2, MAX_LENGTH)
    assert.strictEqual(result.n, 3)
    assert.strictEqual(result.length, START_LENGTH)
  })

  it('caps N and length at maximums', () => {
    const result = nextDifficulty(ADVANCE_ACCURACY, MAX_N, MAX_LENGTH)
    assert.strictEqual(result.n, MAX_N)
    assert.strictEqual(result.length, MAX_LENGTH)
  })

  it('keeps the same difficulty when accuracy is below threshold', () => {
    const result = nextDifficulty(ADVANCE_ACCURACY - 1, 2, 22)
    assert.strictEqual(result.n, 2)
    assert.strictEqual(result.length, 22)
  })
})
