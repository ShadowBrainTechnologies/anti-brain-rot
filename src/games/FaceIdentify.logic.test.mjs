import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  START_FACES,
  MEMORIZE_MS_PER_FACE,
  memorizeMsFor,
  NAMES,
  createRng,
  generateFace,
  faceCountFor,
  generateRound,
  evaluateRound,
} from './FaceIdentify.logic.js'

describe('FaceIdentify.logic', () => {
  it('memorize time scales with face count', () => {
    assert.equal(MEMORIZE_MS_PER_FACE, 2500)
    assert.equal(memorizeMsFor(3), 7500)
    assert.equal(memorizeMsFor(4), 10000)
    assert.equal(memorizeMsFor(8), 20000)
  })

  it('face count grows by one each level', () => {
    assert.equal(faceCountFor(1), START_FACES)
    assert.equal(faceCountFor(2), START_FACES + 1)
    assert.equal(faceCountFor(5), START_FACES + 4)
  })

  it('createRng is deterministic for the same seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    for (let i = 0; i < 20; i++) {
      assert.equal(a.random(), b.random())
    }
  })

  it('generateFace produces deterministic output for a seed', () => {
    const a = generateFace(42)
    const b = generateFace(42)
    assert.deepEqual(a, b)
    assert.ok(a.skin)
    assert.ok(a.hairColor)
    assert.equal(typeof a.hairStyle, 'number')
    assert.equal(typeof a.eyeStyle, 'number')
    assert.equal(typeof a.mouthStyle, 'number')
    assert.equal(typeof a.accessory, 'number')
  })

  it('generateRound produces unique names and expected count', () => {
    const round = generateRound(1, 99)
    assert.equal(round.count, START_FACES)
    assert.equal(round.faces.length, START_FACES)
    const names = round.faces.map((f) => f.name)
    assert.equal(new Set(names).size, names.length)
    names.forEach((name) => assert.ok(NAMES.includes(name)))
  })

  it('generateRound quiz order shuffles all indices', () => {
    const round = generateRound(2, 77)
    assert.equal(round.quizOrder.length, round.faces.length)
    assert.deepEqual(new Set(round.quizOrder), new Set(Array.from({ length: round.count }, (_, i) => i)))
  })

  it('evaluateRound reports perfect when all answers match', () => {
    const round = generateRound(1, 11)
    const answers = round.faces.map((f) => f.name)
    const result = evaluateRound(round, answers)
    assert.equal(result.correct, round.count)
    assert.equal(result.total, round.count)
    assert.equal(result.perfect, true)
  })

  it('evaluateRound reports imperfect when an answer is wrong', () => {
    const round = generateRound(1, 22)
    const answers = round.faces.map((f) => f.name)
    answers[0] = 'DefinitelyNotARealName'
    const result = evaluateRound(round, answers)
    assert.equal(result.perfect, false)
    assert.equal(result.correct, round.count - 1)
  })

  it('evaluateRound works when answers are provided in quiz order', () => {
    const round = generateRound(1, 33)
    const answers = new Array(round.count).fill(null)
    for (let i = 0; i < round.count; i++) {
      const faceIndex = round.quizOrder[i]
      answers[faceIndex] = round.faces[faceIndex].name
    }
    const result = evaluateRound(round, answers)
    assert.equal(result.perfect, true)
  })
})
