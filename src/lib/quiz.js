// Shared helpers for question-bank ("quiz") games — the IndiaBix-derived family
// (Aptitude Arena, Sequences, Deduction, Data Detective).
//
// These games all share one shape: a `generate(rng)` function returns a single
// multiple-choice question, and the QuizGame shell (src/components/QuizGame.jsx)
// runs a fixed number of rounds, scoring one point per correct answer.
//
// A question object is:
//   { prompt, options, correctIndex, explanation, topic }
//     prompt      — string (may contain \n for multi-line statements)
//     options     — array of 2..4 strings
//     correctIndex— index into options of the right answer
//     explanation — short string shown after answering (why it's right)
//     topic       — optional label of the IndiaBix sub-topic, for flavour
//
// Everything here is pure and seedable so generators can be unit-tested with a
// deterministic RNG (`createRng(seed)`), matching the repo's node:test convention.

// Deterministic PRNG (mulberry32). Returns a function producing floats in [0,1).
export function createRng(seed = 1) {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Integer in [min, max] inclusive.
export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

// Pick one element of a non-empty array.
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

// Fisher-Yates shuffle. Returns a new array; does not mutate the input.
export function shuffle(rng, arr) {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Build a shuffled MCQ from a correct answer and candidate distractors.
//
// Distractors are stringified, de-duplicated, and any equal to the correct
// answer are dropped. Up to `count-1` distractors are kept, then everything is
// shuffled. Returns { options, correctIndex }. Throws if there aren't enough
// distinct distractors to fill `count` options — that's a generator bug worth
// surfacing loudly rather than shipping a question with a repeated option.
export function buildChoices(rng, correct, distractors, count = 4) {
  const correctStr = String(correct)
  const seen = new Set([correctStr])
  const pool = []
  for (const d of distractors) {
    const s = String(d)
    if (seen.has(s)) continue
    seen.add(s)
    pool.push(s)
  }
  if (pool.length < count - 1) {
    throw new Error(
      `buildChoices: need ${count - 1} distinct distractors, got ${pool.length}`,
    )
  }
  const chosen = shuffle(rng, pool).slice(0, count - 1)
  const options = shuffle(rng, [correctStr, ...chosen])
  return { options, correctIndex: options.indexOf(correctStr) }
}

// Validate a generated question object (used in tests and dev). Returns an
// array of problem strings; empty means the question is well-formed.
export function validateQuestion(q) {
  const errs = []
  if (!q || typeof q !== 'object') return ['not an object']
  if (typeof q.prompt !== 'string' || q.prompt.trim() === '') errs.push('bad prompt')
  if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) {
    errs.push('options must be 2..4')
  } else {
    if (new Set(q.options.map(String)).size !== q.options.length) errs.push('duplicate options')
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      errs.push('correctIndex out of range')
    }
  }
  return errs
}
