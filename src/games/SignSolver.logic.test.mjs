import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  OPERATORS,
  applyOp,
  checkOperator,
  generatePuzzle,
} from './SignSolver.logic.js'

function countCorrectOperators(a, b, result) {
  return OPERATORS.filter((op) => checkOperator(a, b, op, result)).length
}

function makeRng(seed) {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

describe('SignSolver.logic', () => {
  it('applyOp computes each operator correctly', () => {
    assert.equal(applyOp(3, '+', 4), 7)
    assert.equal(applyOp(9, '−', 4), 5)
    assert.equal(applyOp(6, '×', 7), 42)
    assert.equal(applyOp(20, '÷', 4), 5)
    assert.equal(applyOp(5, '÷', 0), null)
  })

  it('generatePuzzle produces a solvable equation with a unique correct operator', () => {
    for (let i = 0; i < 200; i++) {
      const puzzle = generatePuzzle()
      assert.equal(applyOp(puzzle.a, puzzle.op, puzzle.b), puzzle.result)
      assert.equal(
        countCorrectOperators(puzzle.a, puzzle.b, puzzle.result),
        1,
        `expected one correct operator for ${puzzle.a} ? ${puzzle.b} = ${puzzle.result}`,
      )
      assert.ok(checkOperator(puzzle.a, puzzle.b, puzzle.op, puzzle.result))
    }
  })

  it('checkOperator returns true only for the operator that satisfies the equation', () => {
    assert.equal(checkOperator(8, 5, '+', 13), true)
    assert.equal(checkOperator(8, 5, '+', 12), false)
    assert.equal(checkOperator(10, 3, '−', 7), true)
    assert.equal(checkOperator(10, 3, '−', 8), false)
    assert.equal(checkOperator(4, 6, '×', 24), true)
    assert.equal(checkOperator(4, 6, '×', 25), false)
    assert.equal(checkOperator(18, 3, '÷', 6), true)
    assert.equal(checkOperator(18, 3, '÷', 5), false)
    assert.equal(checkOperator(7, 0, '÷', 1), false)
  })

  it('never divides by zero across many stubbed-rng generations', () => {
    const rng = makeRng(12345)
    for (let i = 0; i < 500; i++) {
      const puzzle = generatePuzzle(rng)
      assert.notEqual(puzzle.b, 0)
      assert.ok(Number.isFinite(puzzle.result))
      for (const op of OPERATORS) {
        applyOp(puzzle.a, op, puzzle.b)
      }
    }
  })
})
