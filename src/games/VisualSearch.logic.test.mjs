import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DIFFICULTY,
  ROUNDS,
  gridSizeFor,
  maxTimeFor,
  scoreForTime,
  generateRound,
  generateRounds,
  computeStats,
  formatTime,
} from './VisualSearch.logic.js'

describe('VisualSearch logic', () => {
  it('returns expected grid sizes and time limits', () => {
    assert.equal(gridSizeFor(DIFFICULTY.EASY), 5)
    assert.equal(gridSizeFor(DIFFICULTY.MEDIUM), 8)
    assert.equal(gridSizeFor(DIFFICULTY.HARD), 10)
    assert.equal(maxTimeFor(DIFFICULTY.EASY), 6000)
    assert.equal(maxTimeFor(DIFFICULTY.MEDIUM), 5000)
    assert.equal(maxTimeFor(DIFFICULTY.HARD), 4000)
  })

  it('scores by speed and misses', () => {
    assert.equal(scoreForTime(500, true), 100)
    assert.equal(scoreForTime(1500, true), 80)
    assert.equal(scoreForTime(2500, true), 60)
    assert.equal(scoreForTime(4000, true), 40)
    assert.equal(scoreForTime(8000, true), 40)
    assert.equal(scoreForTime(500, false), 0)
  })

  it('generates exactly one target', () => {
    const round = generateRound(DIFFICULTY.MEDIUM, null, null, () => 0.5)
    const targets = round.cells.filter((c) => c.isTarget)
    assert.equal(targets.length, 1)
    assert.equal(round.cells[round.targetIndex].isTarget, true)
  })

  it('avoids repeating the same region across consecutive rounds', () => {
    const rounds = generateRounds(DIFFICULTY.EASY, 12345)
    for (let i = 1; i < rounds.length; i += 1) {
      assert.notEqual(rounds[i].region, rounds[i - 1].region)
    }
  })

  it('generates 20 rounds', () => {
    const rounds = generateRounds(DIFFICULTY.HARD, 999)
    assert.equal(rounds.length, ROUNDS)
    rounds.forEach((r) => {
      assert.equal(r.size, 10)
      assert.equal(r.cells.length, 100)
    })
  })

  it('computes stats from results', () => {
    const results = [
      { hit: true, reactionMs: 800, score: 100 },
      { hit: true, reactionMs: 1200, score: 80 },
      { hit: false, reactionMs: null, score: 0 },
      { hit: true, reactionMs: 3000, score: 60 },
    ]
    const stats = computeStats(results)
    assert.equal(stats.score, 240)
    assert.equal(stats.accuracy, 75)
    assert.equal(stats.hits, 3)
    assert.equal(stats.total, 4)
    assert.equal(stats.avgTime, (800 + 1200 + 3000) / 3)
    assert.equal(stats.fastest, 800)
  })

  it('formats time', () => {
    assert.equal(formatTime(null), '—')
    assert.equal(formatTime(1500), '1.50s')
  })
})
