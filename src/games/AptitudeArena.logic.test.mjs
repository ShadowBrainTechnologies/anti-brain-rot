import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRng, validateQuestion } from '../lib/quiz.js'
import { generateQuestion, TOPIC_GENERATORS } from './AptitudeArena.logic.js'

function assertQuestionShape(q) {
  assert.deepEqual(validateQuestion(q), [], `validation failed: ${validateQuestion(q).join(', ')}`)
  assert.equal(q.options.length, 4)
  assert.ok(Number.isInteger(q.correctIndex))
  assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length)
  assert.equal(typeof q.prompt, 'string')
  assert.ok(q.prompt.trim().length > 0)
  assert.equal(typeof q.explanation, 'string')
  assert.ok(q.explanation.trim().length > 0)
}

describe('AptitudeArena.logic', () => {
  it('every topic generator produces 100 valid questions with the correct option in place', () => {
    for (const generator of TOPIC_GENERATORS) {
      for (let i = 1; i <= 100; i++) {
        const rng = createRng(i * 997 + generator.name.length)
        const { question, answer } = generator(rng)
        assertQuestionShape(question)
        assert.equal(question.options[question.correctIndex], String(answer))
        assert.equal(Number.isInteger(answer), true)
      }
    }
  })

  it('generateQuestion produces valid questions over 1000 seeded generations', () => {
    const topics = new Set()
    for (let i = 0; i < 1000; i++) {
      const rng = createRng(i + 1)
      const q = generateQuestion(rng)
      assertQuestionShape(q)
      topics.add(q.topic)
    }
    assert.ok(topics.size > 1, 'expected more than one distinct topic')
  })
})
