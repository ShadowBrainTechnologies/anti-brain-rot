import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRng, validateQuestion } from '../lib/quiz.js'
import { generateQuestion } from './Sequences.logic.js'

describe('Sequences.logic', () => {
  it('produces valid questions over 1000 seeded generations', () => {
    const topics = new Set()
    for (let i = 0; i < 1000; i++) {
      const rng = createRng(i + 1)
      const q = generateQuestion(rng)
      const errs = validateQuestion(q)
      assert.deepEqual(errs, [], `seed ${i + 1}: ${errs.join(', ')}`)
      assert.equal(q.options.length, 4, `seed ${i + 1}: expected 4 options`)
      assert.ok(
        q.correctIndex >= 0 && q.correctIndex < q.options.length,
        `seed ${i + 1}: correctIndex out of range`,
      )
      assert.ok(q.prompt.trim().length > 0, `seed ${i + 1}: empty prompt`)
      assert.ok(q.explanation.trim().length > 0, `seed ${i + 1}: empty explanation`)
      topics.add(q.topic)
    }
    assert.ok(topics.size >= 4, `expected at least 4 distinct topics, got ${topics.size}`)
  })
})
