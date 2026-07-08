import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildDeck, isMatch } from './Matching.logic.js'

const SYMBOLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const PAIR_COUNT = 4
const stubRng = () => 0.5

describe('Matching.logic', () => {
  it('buildDeck returns a deck of length pairCount * 2', () => {
    const deck = buildDeck(PAIR_COUNT, SYMBOLS, stubRng)
    assert.equal(deck.length, PAIR_COUNT * 2)
  })

  it('every symbol in the deck appears exactly twice', () => {
    const deck = buildDeck(PAIR_COUNT, SYMBOLS, stubRng)
    const counts = {}
    for (const symbol of deck) {
      counts[symbol] = (counts[symbol] || 0) + 1
    }
    assert.equal(Object.keys(counts).length, PAIR_COUNT)
    assert.ok(Object.values(counts).every((count) => count === 2))
  })

  it('deck only contains chosen symbols', () => {
    const deck = buildDeck(PAIR_COUNT, SYMBOLS, stubRng)
    for (const symbol of deck) {
      assert.ok(SYMBOLS.includes(symbol))
    }
  })

  it('isMatch returns true only for equal values', () => {
    assert.equal(isMatch('x', 'x'), true)
    assert.equal(isMatch('x', 'y'), false)
    assert.equal(isMatch(1, 1), true)
    assert.equal(isMatch(1, 2), false)
  })
})
