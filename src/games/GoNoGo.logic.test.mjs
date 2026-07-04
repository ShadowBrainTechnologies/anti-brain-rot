import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  TOTAL_TRIALS,
  GO_RATIO,
  DIFFICULTY_LEVELS,
  difficultyForTrial,
  generateTrials,
  scoreTrial,
  computeStats,
} from './GoNoGo.logic.js'

describe('GoNoGo.logic', () => {
  it('generateTrials produces the correct number of trials', () => {
    const trials = generateTrials(42)
    assert.equal(trials.length, TOTAL_TRIALS)
  })

  it('generateTrials respects the Go/No-Go ratio', () => {
    const trials = generateTrials(42)
    const goCount = trials.filter((t) => t.type === 'go').length
    const nogoCount = trials.filter((t) => t.type === 'nogo').length
    const expectedGo = Math.round(TOTAL_TRIALS * GO_RATIO)
    const expectedNogo = TOTAL_TRIALS - expectedGo
    assert.equal(goCount, expectedGo)
    assert.equal(nogoCount, expectedNogo)
  })

  it('generateTrials is deterministic for the same seed', () => {
    const a = generateTrials(123)
    const b = generateTrials(123)
    for (let i = 0; i < a.length; i++) {
      assert.equal(a[i].type, b[i].type)
    }
  })

  it('generateTrials produces different sequences for different seeds', () => {
    const a = generateTrials(1)
    const b = generateTrials(2)
    const sameCount = a.filter((t, i) => t.type === b[i].type).length
    assert.ok(sameCount < TOTAL_TRIALS, 'different seeds should produce different sequences')
  })

  it('every trial has a valid type and difficulty', () => {
    const trials = generateTrials(99)
    for (const trial of trials) {
      assert.ok(trial.type === 'go' || trial.type === 'nogo')
      assert.ok(trial.difficultyIndex >= 0 && trial.difficultyIndex <= 2)
      assert.ok(trial.stimulusMs > 0)
      assert.equal(typeof trial.index, 'number')
    }
  })

  it('difficultyForTrial escalates every 20 trials', () => {
    assert.equal(difficultyForTrial(0), 0)
    assert.equal(difficultyForTrial(19), 0)
    assert.equal(difficultyForTrial(20), 1)
    assert.equal(difficultyForTrial(39), 1)
    assert.equal(difficultyForTrial(40), 2)
    assert.equal(difficultyForTrial(59), 2)
  })

  it('trial stimulus duration matches the difficulty level', () => {
    const trials = generateTrials(55)
    for (const trial of trials) {
      assert.equal(trial.stimulusMs, DIFFICULTY_LEVELS[trial.difficultyIndex].stimulusMs)
    }
  })

  it('scoreTrial: correct Go (hit) gives +1', () => {
    const trial = { type: 'go' }
    const result = scoreTrial(trial, true, 350)
    assert.equal(result.delta, 1)
    assert.equal(result.outcome, 'hit')
    assert.equal(result.reactionMs, 350)
  })

  it('scoreTrial: missed Go gives 0', () => {
    const trial = { type: 'go' }
    const result = scoreTrial(trial, false, null)
    assert.equal(result.delta, 0)
    assert.equal(result.outcome, 'miss')
    assert.equal(result.reactionMs, null)
  })

  it('scoreTrial: correct No-Go (reject) gives +1', () => {
    const trial = { type: 'nogo' }
    const result = scoreTrial(trial, false, null)
    assert.equal(result.delta, 1)
    assert.equal(result.outcome, 'correctReject')
    assert.equal(result.reactionMs, null)
  })

  it('scoreTrial: false alarm on No-Go gives -1', () => {
    const trial = { type: 'nogo' }
    const result = scoreTrial(trial, true, 200)
    assert.equal(result.delta, -1)
    assert.equal(result.outcome, 'falseAlarm')
    assert.equal(result.reactionMs, 200)
  })

  it('computeStats returns correct aggregates for a perfect session', () => {
    const results = []
    for (let i = 0; i < 45; i++) {
      results.push({ trialType: 'go', outcome: 'hit', delta: 1, reactionMs: 300 })
    }
    for (let i = 0; i < 15; i++) {
      results.push({ trialType: 'nogo', outcome: 'correctReject', delta: 1, reactionMs: null })
    }
    const stats = computeStats(results)
    assert.equal(stats.score, 60)
    assert.equal(stats.accuracy, 100)
    assert.equal(stats.goAccuracy, 100)
    assert.equal(stats.nogoAccuracy, 100)
    assert.equal(stats.avgReactionMs, 300)
  })

  it('computeStats handles mixed results correctly', () => {
    const results = [
      { trialType: 'go', outcome: 'hit', delta: 1, reactionMs: 200 },
      { trialType: 'go', outcome: 'miss', delta: 0, reactionMs: null },
      { trialType: 'nogo', outcome: 'correctReject', delta: 1, reactionMs: null },
      { trialType: 'nogo', outcome: 'falseAlarm', delta: -1, reactionMs: 150 },
    ]
    const stats = computeStats(results)
    assert.equal(stats.score, 1)
    assert.equal(stats.accuracy, 50)
    assert.equal(stats.goAccuracy, 50)
    assert.equal(stats.nogoAccuracy, 50)
    assert.equal(stats.avgReactionMs, 200)
  })

  it('computeStats handles empty results', () => {
    const stats = computeStats([])
    assert.equal(stats.score, 0)
    assert.equal(stats.accuracy, 0)
    assert.equal(stats.avgReactionMs, null)
  })
})
