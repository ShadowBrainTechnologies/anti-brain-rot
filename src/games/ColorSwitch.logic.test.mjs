import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  COLORS,
  SESSION_SECONDS,
  scoreForCatch,
  toggleColor,
  randomColor,
  fallSpeedFor,
} from './ColorSwitch.logic.js'

describe('ColorSwitch.logic', () => {
  it('scoreForCatch returns +1 on match and -1 on mismatch for both colors', () => {
    assert.equal(scoreForCatch('red', 'red'), 1)
    assert.equal(scoreForCatch('blue', 'blue'), 1)
    assert.equal(scoreForCatch('red', 'blue'), -1)
    assert.equal(scoreForCatch('blue', 'red'), -1)
  })

  it('toggleColor is an involution and always returns a value in COLORS', () => {
    for (const c of COLORS) {
      const toggled = toggleColor(c)
      assert.ok(COLORS.includes(toggled))
      assert.equal(toggleColor(toggled), c)
      assert.notEqual(toggled, c)
    }
  })

  it('randomColor with a stubbed rng returns a value in COLORS', () => {
    const stubZero = () => 0
    const stubHigh = () => 0.99
    assert.ok(COLORS.includes(randomColor(stubZero)))
    assert.ok(COLORS.includes(randomColor(stubHigh)))
  })

  it('fallSpeedFor is positive and non-decreasing with elapsed time', () => {
    for (let t = 0; t < SESSION_SECONDS; t += 5) {
      assert.ok(fallSpeedFor(t) > 0)
      if (t + 5 <= SESSION_SECONDS) {
        assert.ok(fallSpeedFor(t + 5) >= fallSpeedFor(t))
      }
    }
  })

  it('COLORS has exactly 2 entries and SESSION_SECONDS is positive', () => {
    assert.equal(COLORS.length, 2)
    assert.ok(SESSION_SECONDS > 0)
  })
})
