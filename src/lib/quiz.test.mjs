import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createRng,
  randInt,
  pick,
  shuffle,
  buildChoices,
  validateQuestion,
} from './quiz.js'

describe('quiz helpers', () => {
  it('createRng is deterministic for a given seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 100; i++) assert.equal(a(), b())
  })

  it('createRng returns floats in [0,1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const x = rng()
      assert.ok(x >= 0 && x < 1, `out of range: ${x}`)
    }
  })

  it('randInt stays within inclusive bounds', () => {
    const rng = createRng(3)
    for (let i = 0; i < 1000; i++) {
      const n = randInt(rng, 5, 9)
      assert.ok(n >= 5 && n <= 9 && Number.isInteger(n))
    }
  })

  it('pick returns a member of the array', () => {
    const rng = createRng(11)
    const arr = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 100; i++) assert.ok(arr.includes(pick(rng, arr)))
  })

  it('shuffle is a permutation and does not mutate input', () => {
    const rng = createRng(99)
    const input = [1, 2, 3, 4, 5, 6]
    const copy = input.slice()
    const out = shuffle(rng, input)
    assert.deepEqual(input, copy, 'input mutated')
    assert.deepEqual(out.slice().sort((a, b) => a - b), copy)
  })

  it('buildChoices puts the correct answer at correctIndex with unique options', () => {
    const rng = createRng(5)
    for (let i = 0; i < 500; i++) {
      const { options, correctIndex } = buildChoices(rng, 42, [10, 20, 30, 40, 50])
      assert.equal(options.length, 4)
      assert.equal(new Set(options).size, 4, 'options not unique')
      assert.equal(options[correctIndex], '42')
    }
  })

  it('buildChoices throws when there are too few distinct distractors', () => {
    const rng = createRng(1)
    assert.throws(() => buildChoices(rng, 5, [5, 5, 5]))
  })

  it('validateQuestion accepts a well-formed question and rejects bad ones', () => {
    assert.deepEqual(
      validateQuestion({ prompt: 'x?', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }),
      [],
    )
    assert.ok(validateQuestion({ prompt: '', options: ['a', 'b'], correctIndex: 0 }).length > 0)
    assert.ok(validateQuestion({ prompt: 'x', options: ['a', 'a'], correctIndex: 0 }).length > 0)
    assert.ok(validateQuestion({ prompt: 'x', options: ['a', 'b'], correctIndex: 5 }).length > 0)
  })
})
