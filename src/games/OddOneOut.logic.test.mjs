import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PUZZLE_COUNT,
  RULE_IDS,
  DIFFICULTY,
  createRng,
  generateSession,
  generatePuzzle,
  isOnlyOdd,
} from './OddOneOut.logic.js'

describe('OddOneOut.logic', () => {
  it('createRng is deterministic for the same seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    for (let i = 0; i < 20; i++) {
      assert.equal(a.random(), b.random())
    }
  })

  it('generateSession creates the requested number of puzzles', () => {
    const session = generateSession(DIFFICULTY.EASY, 42, PUZZLE_COUNT)
    assert.equal(session.length, PUZZLE_COUNT)
  })

  it('never uses the same rule back-to-back', () => {
    const session = generateSession(DIFFICULTY.MEDIUM, 7, PUZZLE_COUNT)
    for (let i = 1; i < session.length; i++) {
      assert.notEqual(session[i].ruleId, session[i - 1].ruleId)
    }
  })

  it('every puzzle has exactly one valid answer', () => {
    const session = generateSession(DIFFICULTY.HARD, 99, PUZZLE_COUNT)
    for (const puzzle of session) {
      assert.ok(puzzle.answerIndex >= 0 && puzzle.answerIndex <= 3)
      assert.equal(puzzle.objects.length, 4)
      assert.ok(isOnlyOdd(puzzle.objects, puzzle.answerIndex))
    }
  })

  it('answer object is uniquely different in the rule property', () => {
    const session = generateSession(DIFFICULTY.EASY, 202, PUZZLE_COUNT)
    for (const puzzle of session) {
      const prop = puzzle.ruleId === 'count' ? 'dotCount' : puzzle.ruleId
      const values = puzzle.objects.map((o) => o[prop])
      const answerValue = values[puzzle.answerIndex]
      const occurrences = values.filter((v) => v === answerValue).length
      assert.equal(occurrences, 1)
    }
  })

  it('every rule can generate a valid puzzle at each difficulty', () => {
    for (const ruleId of RULE_IDS) {
      for (const difficulty of Object.values(DIFFICULTY)) {
        const puzzle = generatePuzzle(ruleId, difficulty, createRng(1))
        assert.ok(puzzle, `${ruleId} ${difficulty} failed to generate`)
        assert.ok(isOnlyOdd(puzzle.objects, puzzle.answerIndex))
      }
    }
  })

  it('hard puzzles include secondary variation beyond the answer object', () => {
    let varied = 0
    const session = generateSession(DIFFICULTY.HARD, 55, PUZZLE_COUNT)
    for (const puzzle of session) {
      const base = { ...puzzle.objects[puzzle.answerIndex === 0 ? 1 : 0] }
      const others = puzzle.objects.filter((_, i) => i !== puzzle.answerIndex)
      if (others.some((o) => !objectsEqualExcept(o, base, puzzle.ruleId))) {
        varied++
      }
    }
    assert.ok(varied > PUZZLE_COUNT * 0.5, 'expected most hard puzzles to vary a second property')
  })
})

function objectsEqualExcept(a, b, ruleId) {
  const props = ['shape', 'color', 'fill', 'size', 'border', 'rotation', 'dotCount', 'symmetry']
  for (const prop of props) {
    const isRuleProp = (ruleId === 'count' && prop === 'dotCount') || prop === ruleId
    if (isRuleProp) continue
    if (a[prop] !== b[prop]) return false
  }
  return true
}
