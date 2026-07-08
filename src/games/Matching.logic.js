export function buildDeck(pairCount, symbols, rng = Math.random) {
  const chosen = symbols.slice(0, pairCount)
  const deck = chosen.flatMap((symbol) => [symbol, symbol])

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  return deck
}

export function isMatch(a, b) {
  return a === b
}
