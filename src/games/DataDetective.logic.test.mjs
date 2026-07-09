import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRng, validateQuestion } from '../lib/quiz.js'
import { computeAnswer, generateQuestion } from './DataDetective.logic.js'

const CHART_TYPES = ['table', 'bar', 'pie', 'line']

describe('DataDetective.logic', () => {
  it('generates 1000 valid seeded questions with correct answers', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const rng = createRng(seed)
      const q = generateQuestion(rng)

      assert.deepEqual(validateQuestion(q), [], `seed ${seed}`)
      assert.equal(q.options.length, 4, `seed ${seed}`)
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, `seed ${seed}`)
      assert.ok(q.prompt.trim().length > 0, `seed ${seed}`)
      assert.ok(CHART_TYPES.includes(q.chart.type), `seed ${seed}`)
      assert.ok(Array.isArray(q.chart.series) && q.chart.series.length > 0, `seed ${seed}`)

      for (const s of q.chart.series) {
        assert.equal(typeof s.name, 'string', `seed ${seed}`)
        assert.ok(Array.isArray(s.values), `seed ${seed}`)
      }

      const answer = computeAnswer(q)
      assert.equal(q.options[q.correctIndex], String(answer), `seed ${seed}`)
    }
  })
})
