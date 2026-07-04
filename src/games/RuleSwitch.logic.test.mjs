import assert from 'node:assert'
import { describe, it } from 'node:test'
import {
  COLORS,
  SHAPES,
  SIZES,
  RULES,
  optionsForRule,
  generateOptions,
  answerFor,
  rulesForDifficulty,
  pickRule,
  generateObject,
  objectsEqual,
} from './RuleSwitch.logic.js'

describe('RuleSwitch logic', () => {
  it('returns four color options for the color rule', () => {
    const options = optionsForRule(RULES.COLOR)
    assert.deepStrictEqual(options, COLORS.map((c) => c.label))
  })

  it('returns four shape options for the shape rule', () => {
    const options = optionsForRule(RULES.SHAPE)
    assert.deepStrictEqual(options, SHAPES.map((s) => s.label))
  })

  it('returns two size options for the size rule', () => {
    const options = optionsForRule(RULES.SIZE)
    assert.deepStrictEqual(options, SIZES.map((s) => s.label))
  })

  it('answers according to the active rule', () => {
    const object = { color: 'blue', shape: 'triangle', size: 'small' }
    assert.strictEqual(answerFor(object, RULES.COLOR), 'Blue')
    assert.strictEqual(answerFor(object, RULES.SHAPE), 'Triangle')
    assert.strictEqual(answerFor(object, RULES.SIZE), 'Small')
  })

  it('includes all three rules for every difficulty', () => {
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const rules = rulesForDifficulty(difficulty)
      assert.deepStrictEqual(rules.sort(), [RULES.COLOR, RULES.SHAPE, RULES.SIZE].sort())
    }
  })

  it('picks a different rule than the current one', () => {
    const current = RULES.COLOR
    for (let i = 0; i < 20; i++) {
      const next = pickRule('medium', current)
      assert.notStrictEqual(next, current)
    }
  })

  it('generates size options that include both Small and Large', () => {
    const object = { color: 'red', shape: 'circle', size: 'small' }
    const options = generateOptions(object, RULES.SIZE)
    assert.strictEqual(options.length, 2)
    assert.ok(options.includes('Small'))
    assert.ok(options.includes('Large'))
  })

  it('generates color options that include the object shape as a distractor', () => {
    const object = { color: 'green', shape: 'circle', size: 'large' }
    const options = generateOptions(object, RULES.COLOR)
    assert.strictEqual(options.length, 4)
    assert.ok(options.includes('Green'))
    assert.ok(options.includes('Circle'))
  })

  it('generates shape options that include the object color as a distractor', () => {
    const object = { color: 'blue', shape: 'triangle', size: 'small' }
    const options = generateOptions(object, RULES.SHAPE)
    assert.strictEqual(options.length, 4)
    assert.ok(options.includes('Triangle'))
    assert.ok(options.includes('Blue'))
  })

  it('generates objects that avoid three consecutive identical objects', () => {
    const same = { color: 'red', shape: 'circle', size: 'large' }
    const history = [same, same]
    for (let i = 0; i < 50; i++) {
      const object = generateObject(history)
      assert.strictEqual(objectsEqual(object, same), false)
    }
  })
})
