import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CATEGORIES,
  ROUNDS,
  createRng,
  evaluateRound,
  generateSession,
  percentError,
  scoreFor,
} from './EstimateIt.logic.js'

describe('EstimateIt.logic', () => {
  it('scoreFor follows the documented table', () => {
    assert.equal(scoreFor(0), 100)
    assert.equal(scoreFor(2), 100)
    assert.equal(scoreFor(3), 90)
    assert.equal(scoreFor(5), 90)
    assert.equal(scoreFor(6), 80)
    assert.equal(scoreFor(10), 80)
    assert.equal(scoreFor(11), 60)
    assert.equal(scoreFor(20), 60)
    assert.equal(scoreFor(21), 30)
    assert.equal(scoreFor(40), 30)
    assert.equal(scoreFor(41), 10)
    assert.equal(scoreFor(100), 10)
  })

  it('percentError caps at 100%', () => {
    assert.equal(percentError(100, 50), 50)
    assert.equal(percentError(100, 200), 100)
    assert.equal(percentError(0, 0), 0)
    assert.equal(percentError(0, 5), 100)
  })

  it('createRng is deterministic for the same seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    for (let i = 0; i < 20; i++) {
      assert.equal(a.random(), b.random())
    }
  })

  it('generateSession produces the requested number of rounds', () => {
    const session = generateSession(0, 42, 10)
    assert.equal(session.rounds.length, 10)
  })

  it('generateSession never repeats a category back-to-back', () => {
    const session = generateSession(1, 999, ROUNDS)
    for (let i = 1; i < session.rounds.length; i++) {
      assert.notEqual(session.rounds[i].category, session.rounds[i - 1].category)
    }
  })

  it('every round has a valid challenge with an answer and evaluator', () => {
    const session = generateSession(2, 777, ROUNDS)
    for (const round of session.rounds) {
      assert.ok('answer' in round)
      assert.equal(typeof round.evaluate, 'function')
      assert.equal(typeof round.format, 'function')
      assert.ok(round.category)
    }
  })

  it('evaluateRound returns a score between 10 and 100', () => {
    const session = generateSession(1, 555, ROUNDS)
    for (const round of session.rounds) {
      const guess = round.answer * (0.9 + Math.random() * 0.2)
      const res = evaluateRound(round, guess)
      assert.ok(res.score >= 10 && res.score <= 100)
      assert.ok(res.error >= 0 && res.error <= 100)
      assert.equal(res.answer, round.answer)
      assert.equal(res.guess, guess)
    }
  })

  it('probability rounds are binary correct/incorrect', () => {
    const prob = CATEGORIES.find((c) => c.id === 'probability')
    const challenge = prob.generate(0, createRng(1))
    assert.equal(challenge.evaluate(challenge, challenge.answer), 0)
    const wrong = challenge.answer === 0 ? 1 : 0
    assert.equal(challenge.evaluate(challenge, wrong), 100)
  })

  it('angle evaluation wraps around 360 degrees', () => {
    const angle = CATEGORIES.find((c) => c.id === 'angle')
    const challenge = angle.generate(0, createRng(1))
    const target = challenge.answer
    const guess = (target + 350) % 360
    const error = challenge.evaluate(challenge, guess)
    assert.ok(error <= 20, `expected small wrapped error, got ${error}`)
  })

  it('every category can generate a challenge at each difficulty', () => {
    for (const category of CATEGORIES) {
      for (let d = 0; d < 3; d++) {
        const challenge = category.generate(d, createRng(d + 1))
        assert.ok(challenge, `${category.id} failed at difficulty ${d}`)
        assert.ok(Number.isFinite(challenge.answer))
      }
    }
  })
})
