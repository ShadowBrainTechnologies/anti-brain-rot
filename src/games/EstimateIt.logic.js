export const ROUNDS = 12
export const FEEDBACK_MS = 1500

export const DIFFICULTY_SETTINGS = [
  { label: 'Easy', toleranceHint: ' generous tolerances' },
  { label: 'Medium', toleranceHint: ' moderate tolerances' },
  { label: 'Hard', toleranceHint: ' tight tolerances' },
]

function mulberry32(seed) {
  let state = seed >>> 0
  return function random() {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed) {
  const random = mulberry32(seed)
  return {
    random,
    range(min, max) {
      return Math.floor(random() * (max - min + 1)) + min
    },
    pick(arr) {
      return arr[Math.floor(random() * arr.length)]
    },
    shuffle(arr) {
      const copy = arr.slice()
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
  }
}

export function percentError(actual, guess) {
  if (!Number.isFinite(actual) || !Number.isFinite(guess)) return 100
  if (actual === 0) return guess === 0 ? 0 : 100
  return Math.min(100, (Math.abs(guess - actual) / Math.abs(actual)) * 100)
}

export function scoreFor(errorPercent) {
  if (errorPercent <= 2) return 100
  if (errorPercent <= 5) return 90
  if (errorPercent <= 10) return 80
  if (errorPercent <= 20) return 60
  if (errorPercent <= 40) return 30
  return 10
}

function formatNumber(n) {
  return Math.round(n).toLocaleString()
}

const WEIGHTS = [
  { name: 'apple', value: 180, unit: 'g', difficulty: 0 },
  { name: 'banana', value: 120, unit: 'g', difficulty: 0 },
  { name: 'orange', value: 150, unit: 'g', difficulty: 0 },
  { name: 'can of soda', value: 330, unit: 'g', difficulty: 0 },
  { name: 'laptop', value: 1500, unit: 'g', difficulty: 1 },
  { name: 'basketball', value: 620, unit: 'g', difficulty: 1 },
  { name: 'brick', value: 2300, unit: 'g', difficulty: 1 },
  { name: 'watermelon', value: 5000, unit: 'g', difficulty: 1 },
  { name: 'bowling ball', value: 7000, unit: 'g', difficulty: 2 },
  { name: 'bicycle', value: 12000, unit: 'g', difficulty: 2 },
  { name: 'microwave oven', value: 9000, unit: 'g', difficulty: 2 },
  { name: 'acoustic guitar', value: 2500, unit: 'g', difficulty: 2 },
]

const HEIGHTS = [
  { name: 'adult human', value: 170, unit: 'cm', difficulty: 0 },
  { name: 'standard door', value: 200, unit: 'cm', difficulty: 0 },
  { name: 'basketball hoop', value: 305, unit: 'cm', difficulty: 0 },
  { name: 'giraffe', value: 500, unit: 'cm', difficulty: 1 },
  { name: 'African elephant', value: 300, unit: 'cm', difficulty: 1 },
  { name: 'two-story house', value: 600, unit: 'cm', difficulty: 1 },
  { name: 'giant sequoia tree', value: 3500, unit: 'cm', difficulty: 2 },
  { name: 'Eiffel Tower', value: 33000, unit: 'cm', difficulty: 2 },
  { name: 'Burj Khalifa', value: 82800, unit: 'cm', difficulty: 2 },
  { name: 'redwood tree', value: 1200, unit: 'cm', difficulty: 2 },
]

const DISTANCES = [
  { name: 'a marathon', value: 42, unit: 'km', difficulty: 0 },
  { name: 'a football field', value: 0.1, unit: 'km', difficulty: 0 },
  { name: 'London to Paris', value: 344, unit: 'km', difficulty: 1 },
  { name: 'New York to Washington DC', value: 365, unit: 'km', difficulty: 1 },
  { name: 'Los Angeles to San Francisco', value: 615, unit: 'km', difficulty: 1 },
  { name: 'New York City to Los Angeles', value: 3936, unit: 'km', difficulty: 2 },
  { name: 'Earth to the Moon', value: 384400, unit: 'km', difficulty: 2 },
  { name: 'Paris to Tokyo', value: 9710, unit: 'km', difficulty: 2 },
]

const POPULATIONS = [
  { name: 'New York City', value: 8_300_000, difficulty: 0 },
  { name: 'Tokyo', value: 13_900_000, difficulty: 0 },
  { name: 'Australia', value: 26_000_000, difficulty: 0 },
  { name: 'Brazil', value: 216_000_000, difficulty: 1 },
  { name: 'India', value: 1_400_000_000, difficulty: 1 },
  { name: 'United States', value: 335_000_000, difficulty: 1 },
  { name: 'Iceland', value: 370_000, difficulty: 2 },
  { name: 'Bhutan', value: 800_000, difficulty: 2 },
  { name: 'Shanghai', value: 26_300_000, difficulty: 2 },
]

const PROBABILITY_PAIRS = [
  {
    a: { text: 'Flipping two heads in a row', prob: 0.25 },
    b: { text: 'Rolling a 6 on a die', prob: 1 / 6 },
  },
  {
    a: { text: 'Rolling an even number on a die', prob: 0.5 },
    b: { text: 'Rolling greater than 2 on a die', prob: 4 / 6 },
  },
  {
    a: { text: 'Drawing a heart from a deck', prob: 0.25 },
    b: { text: 'Drawing a red card from a deck', prob: 0.5 },
  },
  {
    a: { text: 'Rolling 1 or 2 on a die', prob: 2 / 6 },
    b: { text: 'Rolling 5 or 6 on a die', prob: 2 / 6 },
  },
  {
    a: { text: 'At least one head in two coin flips', prob: 0.75 },
    b: { text: 'Two tails in a row', prob: 0.25 },
  },
]

function pickObject(rng, difficulty, list) {
  const allowed = list.filter((item) => item.difficulty <= difficulty)
  return rng.pick(allowed)
}

function scalarChallenge(label, unit, item) {
  return {
    type: 'scalar',
    category: label,
    prompt: `Estimate the ${label} of ${item.name}.`,
    unit,
    answer: item.value,
    format: (v) => `${formatNumber(v)} ${unit}`,
    evaluate: (challenge, guess) => percentError(challenge.answer, guess),
  }
}

export const CATEGORIES = [
  {
    id: 'time',
    name: 'Time',
    generate(difficulty, rng) {
      const minSec = difficulty === 2 ? 2 : 3
      const maxSec = difficulty === 0 ? 8 : difficulty === 1 ? 12 : 15
      const targetSec = rng.range(minSec, maxSec)
      return {
        type: 'time',
        category: 'time',
        prompt: `Tap Start, then tap Stop when exactly ${targetSec} seconds have passed.`,
        unit: 's',
        answer: targetSec * 1000,
        targetSec,
        format: (v) => `${(v / 1000).toFixed(2)}s`,
        evaluate: (challenge, guess) => percentError(challenge.answer, guess),
      }
    },
  },
  {
    id: 'angle',
    name: 'Angle',
    generate(difficulty, rng) {
      const step = difficulty === 0 ? 30 : difficulty === 1 ? 15 : 1
      const targetAngle = Math.round(rng.range(0, 359) / step) * step
      return {
        type: 'angle',
        category: 'angle',
        prompt: 'What angle is the line?',
        unit: '\u00b0',
        answer: targetAngle,
        format: (v) => `${Math.round(v)}\u00b0`,
        evaluate: (challenge, guess) => {
          let diff = Math.abs(guess - challenge.answer) % 360
          diff = Math.min(diff, 360 - diff)
          return Math.min(100, (diff / 180) * 100)
        },
      }
    },
  },
  {
    id: 'length',
    name: 'Length',
    generate(difficulty, rng) {
      const minPx = difficulty === 0 ? 60 : 40
      const maxPx = difficulty === 2 ? 360 : 260
      const targetPx = rng.range(minPx, maxPx)
      return {
        type: 'length',
        category: 'length',
        prompt: 'Drag the slider to match the target length.',
        unit: 'px',
        answer: targetPx,
        max: Math.max(400, targetPx + 50),
        format: (v) => `${Math.round(v)} px`,
        evaluate: (challenge, guess) => percentError(challenge.answer, guess),
      }
    },
  },
  {
    id: 'quantity',
    name: 'Quantity',
    generate(difficulty, rng) {
      const minCount = difficulty === 0 ? 8 : difficulty === 1 ? 15 : 25
      const maxCount = difficulty === 0 ? 30 : difficulty === 1 ? 55 : 80
      const count = rng.range(minCount, maxCount)
      const displayMs = difficulty === 0 ? 3000 : difficulty === 1 ? 1500 : 700
      return {
        type: 'quantity',
        category: 'quantity',
        prompt: 'How many dots did you see?',
        unit: 'dots',
        answer: count,
        displayMs,
        format: (v) => `${Math.round(v)}`,
        evaluate: (challenge, guess) => percentError(challenge.answer, guess),
      }
    },
  },
  {
    id: 'area',
    name: 'Area',
    generate(difficulty, rng) {
      const minPct = difficulty === 0 ? 25 : 10
      const maxPct = difficulty === 2 ? 95 : 90
      const percent = rng.range(minPct, maxPct)
      return {
        type: 'area',
        category: 'area',
        prompt: 'What percentage of the square is filled?',
        unit: '%',
        answer: percent,
        format: (v) => `${Math.round(v)}%`,
        evaluate: (challenge, guess) => Math.min(100, Math.abs(guess - challenge.answer)),
      }
    },
  },
  {
    id: 'weight',
    name: 'Weight',
    generate(difficulty, rng) {
      return scalarChallenge('weight', 'g', pickObject(rng, difficulty, WEIGHTS))
    },
  },
  {
    id: 'height',
    name: 'Height',
    generate(difficulty, rng) {
      return scalarChallenge('height', 'cm', pickObject(rng, difficulty, HEIGHTS))
    },
  },
  {
    id: 'distance',
    name: 'Distance',
    generate(difficulty, rng) {
      return scalarChallenge('distance', 'km', pickObject(rng, difficulty, DISTANCES))
    },
  },
  {
    id: 'population',
    name: 'Population',
    generate(difficulty, rng) {
      const item = pickObject(rng, difficulty, POPULATIONS)
      return {
        type: 'scalar',
        category: 'population',
        prompt: `What is the population of ${item.name}?`,
        unit: 'people',
        answer: item.value,
        format: (v) => formatNumber(v),
        evaluate: (challenge, guess) => percentError(challenge.answer, guess),
      }
    },
  },
  {
    id: 'percentage',
    name: 'Percentage',
    generate(difficulty, rng) {
      const minPct = difficulty === 0 ? 10 : 5
      const maxPct = difficulty === 2 ? 95 : 90
      const percent = rng.range(minPct, maxPct)
      return {
        type: 'percentage',
        category: 'percentage',
        prompt: 'What percentage is shown?',
        unit: '%',
        answer: percent,
        format: (v) => `${Math.round(v)}%`,
        evaluate: (challenge, guess) => Math.min(100, Math.abs(guess - challenge.answer)),
      }
    },
  },
  {
    id: 'probability',
    name: 'Probability',
    generate(difficulty, rng) {
      const pair = rng.pick(PROBABILITY_PAIRS)
      const options = rng.shuffle([pair.a, pair.b])
      if (options[0].prob === options[1].prob) {
        options[1] = { text: 'Flipping at least one head in two tosses', prob: 0.75 }
      }
      const correctIndex = options[0].prob > options[1].prob ? 0 : 1
      return {
        type: 'probability',
        category: 'probability',
        prompt: 'Which event is more likely?',
        unit: '',
        answer: correctIndex,
        options,
        format: (v) => options[v].text,
        evaluate: (challenge, guess) => (guess === challenge.answer ? 0 : 100),
      }
    },
  },
  {
    id: 'speed',
    name: 'Speed',
    generate(difficulty, rng) {
      const distance = difficulty === 0 ? 200 : 300
      const minSpeed = difficulty === 0 ? 40 : difficulty === 1 ? 70 : 100
      const maxSpeed = difficulty === 0 ? 120 : difficulty === 1 ? 200 : 320
      const targetSpeed = rng.range(minSpeed, maxSpeed)
      const durationMs = (distance / targetSpeed) * 1000
      return {
        type: 'speed',
        category: 'speed',
        prompt: `A dot moved ${distance}px. What was its speed?`,
        unit: 'px/s',
        answer: targetSpeed,
        distance,
        durationMs,
        format: (v) => `${Math.round(v)} px/s`,
        evaluate: (challenge, guess) => percentError(challenge.answer, guess),
      }
    },
  },
]

function pickCategory(rng, lastCategoryId, history) {
  const weights = CATEGORIES.map((category) => {
    if (category.id === lastCategoryId) return 0
    const recentCount = history.filter((id) => id === category.id).length
    return 1 / (1 + recentCount)
  })
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total <= 0) return rng.pick(CATEGORIES)
  let r = rng.random() * total
  for (let i = 0; i < CATEGORIES.length; i++) {
    r -= weights[i]
    if (r <= 0) return CATEGORIES[i]
  }
  return CATEGORIES[CATEGORIES.length - 1]
}

export function generateSession(difficulty, seed, roundCount = ROUNDS) {
  const rng = createRng(seed)
  const rounds = []
  const history = []
  let lastCategoryId = null

  for (let i = 0; i < roundCount; i++) {
    const category = pickCategory(rng, lastCategoryId, history)
    const challenge = category.generate(difficulty, rng)
    rounds.push(challenge)
    lastCategoryId = category.id
    history.push(category.id)
    if (history.length > 3) history.shift()
  }

  return { seed, rounds }
}

export function evaluateRound(challenge, guess) {
  const error = challenge.evaluate(challenge, guess)
  const score = scoreFor(error)
  return { error, score, answer: challenge.answer, guess }
}
