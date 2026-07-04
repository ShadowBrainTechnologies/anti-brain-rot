import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BASE_HEALTH,
  CONFIG,
  DIFFICULTY,
  createRng,
  pickWord,
  makeAsteroid,
  getTarget,
  randInt,
  clampX,
} from './TypingAsteroids.logic.js'

describe('TypingAsteroids.logic', () => {
  it('createRng is deterministic for the same seed', () => {
    const rngA = createRng(12345)
    const rngB = createRng(12345)
    for (let i = 0; i < 10; i++) {
      assert.equal(rngA(), rngB())
    }
  })

  it('pickWord returns a word within difficulty length bounds', () => {
    for (const difficulty of Object.values(DIFFICULTY)) {
      const rng = createRng(1)
      for (let i = 0; i < 50; i++) {
        const word = pickWord(rng, difficulty)
        assert.ok(word.length >= 3)
        assert.ok(word.length <= CONFIG[difficulty].maxWordLength)
      }
    }
  })

  it('makeAsteroid places the word within horizontal bounds and assigns a valid speed', () => {
    const rng = createRng(99)
    for (const difficulty of Object.values(DIFFICULTY)) {
      const asteroid = makeAsteroid(1, 'test', 600, difficulty, rng)
      assert.equal(asteroid.word, 'test')
      assert.equal(asteroid.id, 1)
      assert.equal(asteroid.y, -48)
      assert.ok(asteroid.xPercent >= 0.08)
      assert.ok(asteroid.xPercent <= 0.92)
      assert.ok(asteroid.speed >= CONFIG[difficulty].speedMin)
      assert.ok(asteroid.speed <= CONFIG[difficulty].speedMax)
    }
  })

  it('getTarget returns the asteroid closest to the bottom', () => {
    const asteroids = [
      { id: 1, word: 'top', xPercent: 0.5, y: 10, speed: 10 },
      { id: 2, word: 'middle', xPercent: 0.5, y: 100, speed: 10 },
      { id: 3, word: 'bottom', xPercent: 0.5, y: 250, speed: 10 },
    ]
    const target = getTarget(asteroids)
    assert.equal(target.id, 3)
  })

  it('getTarget returns null for an empty field', () => {
    assert.equal(getTarget([]), null)
  })

  it('randInt stays within the requested range', () => {
    const rng = createRng(7)
    for (let i = 0; i < 100; i++) {
      const value = randInt(rng, 0, 10)
      assert.ok(value >= 0 && value < 10)
    }
  })

  it('clampX keeps values within safe margins', () => {
    assert.equal(clampX(0), 0.08)
    assert.equal(clampX(1), 0.92)
    assert.ok(clampX(0.5) === 0.5)
  })

  it('BASE_HEALTH is 100', () => {
    assert.equal(BASE_HEALTH, 100)
  })
})
