import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRng, validateQuestion } from '../lib/quiz.js'
import { generateQuestion, staticBank } from './Deduction.logic.js'

describe('Deduction.logic', () => {
  it('generates 1000 valid seeded questions', () => {
    const rng = createRng(12345)
    for (let i = 0; i < 1000; i++) {
      const q = generateQuestion(rng)
      const errs = validateQuestion(q)
      assert.deepEqual(errs, [], `generation ${i}: ${errs.join(', ')}`)
      assert.ok(q.prompt.trim().length > 0, `generation ${i}: empty prompt`)
      assert.ok(q.explanation.trim().length > 0, `generation ${i}: empty explanation`)
      assert.ok(
        q.correctIndex >= 0 && q.correctIndex < q.options.length,
        `generation ${i}: correctIndex out of range`,
      )
    }
  })

  it('static bank contains at least 24 valid items', () => {
    assert.ok(staticBank.length >= 24, `static bank has ${staticBank.length} items`)
    for (const q of staticBank) {
      const errs = validateQuestion(q)
      assert.deepEqual(errs, [], `${q.topic}: ${errs.join(', ')}`)
      assert.ok(q.explanation.trim().length > 0, `${q.topic}: empty explanation`)
    }
  })
})
