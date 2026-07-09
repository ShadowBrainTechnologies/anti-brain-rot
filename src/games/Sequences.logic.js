import { randInt, pick, shuffle, buildChoices } from '../lib/quiz.js'

const TOPICS = {
  NUMBER_SERIES: 'Number Series',
  LETTER_SERIES: 'Letter Series',
  WORD_ANALOGY: 'Word Analogy',
  ODD_ONE_OUT: 'Odd One Out',
  CLASSIFICATION: 'Classification',
}

// ---------------- Word banks ----------------

const ANALOGY_BANK = [
  { a: 'Dog', b: 'Puppy', relation: 'adult : young' },
  { a: 'Cat', b: 'Kitten', relation: 'adult : young' },
  { a: 'Cow', b: 'Calf', relation: 'adult : young' },
  { a: 'Horse', b: 'Foal', relation: 'adult : young' },
  { a: 'Sheep', b: 'Lamb', relation: 'adult : young' },
  { a: 'Tiger', b: 'Cub', relation: 'adult : young' },
  { a: 'Lion', b: 'Cub', relation: 'adult : young' },
  { a: 'Goose', b: 'Gosling', relation: 'adult : young' },
  { a: 'Deer', b: 'Fawn', relation: 'adult : young' },
  { a: 'Frog', b: 'Tadpole', relation: 'adult : young' },
  { a: 'Butterfly', b: 'Caterpillar', relation: 'adult : young' },
  { a: 'Ant', b: 'Larva', relation: 'adult : young' },
  { a: 'Tree', b: 'Forest', relation: 'part : whole' },
  { a: 'Page', b: 'Book', relation: 'part : whole' },
  { a: 'Brick', b: 'Wall', relation: 'part : whole' },
  { a: 'Star', b: 'Galaxy', relation: 'part : whole' },
  { a: 'Drop', b: 'Ocean', relation: 'part : whole' },
  { a: 'Letter', b: 'Word', relation: 'part : whole' },
  { a: 'Word', b: 'Sentence', relation: 'part : whole' },
  { a: 'Sentence', b: 'Paragraph', relation: 'part : whole' },
  { a: 'Hot', b: 'Cold', relation: 'opposite' },
  { a: 'Fast', b: 'Slow', relation: 'opposite' },
  { a: 'Tall', b: 'Short', relation: 'opposite' },
  { a: 'Happy', b: 'Sad', relation: 'opposite' },
  { a: 'Light', b: 'Dark', relation: 'opposite' },
  { a: 'Strong', b: 'Weak', relation: 'opposite' },
  { a: 'Rich', b: 'Poor', relation: 'opposite' },
  { a: 'Love', b: 'Hate', relation: 'opposite' },
  { a: 'War', b: 'Peace', relation: 'opposite' },
  { a: 'Begin', b: 'End', relation: 'opposite' },
  { a: 'Doctor', b: 'Hospital', relation: 'worker : workplace' },
  { a: 'Teacher', b: 'School', relation: 'worker : workplace' },
  { a: 'Chef', b: 'Restaurant', relation: 'worker : workplace' },
  { a: 'Pilot', b: 'Airplane', relation: 'worker : workplace' },
  { a: 'Farmer', b: 'Farm', relation: 'worker : workplace' },
  { a: 'Judge', b: 'Court', relation: 'worker : workplace' },
  { a: 'Actor', b: 'Theater', relation: 'worker : workplace' },
  { a: 'Sailor', b: 'Ship', relation: 'worker : workplace' },
  { a: 'Scientist', b: 'Laboratory', relation: 'worker : workplace' },
  { a: 'Pen', b: 'Write', relation: 'tool : action' },
  { a: 'Knife', b: 'Cut', relation: 'tool : action' },
  { a: 'Broom', b: 'Sweep', relation: 'tool : action' },
  { a: 'Brush', b: 'Paint', relation: 'tool : action' },
  { a: 'Shovel', b: 'Dig', relation: 'tool : action' },
  { a: 'Hammer', b: 'Hit', relation: 'tool : action' },
  { a: 'Key', b: 'Open', relation: 'tool : action' },
  { a: 'Camera', b: 'Photograph', relation: 'tool : action' },
  { a: 'Spoon', b: 'Eat', relation: 'tool : action' },
  { a: 'Microphone', b: 'Sing', relation: 'tool : action' },
  { a: 'Bee', b: 'Honey', relation: 'producer : product' },
  { a: 'Hen', b: 'Egg', relation: 'producer : product' },
  { a: 'Cow', b: 'Milk', relation: 'producer : product' },
  { a: 'Sheep', b: 'Wool', relation: 'producer : product' },
  { a: 'Silkworm', b: 'Silk', relation: 'producer : product' },
  { a: 'Oak', b: 'Acorn', relation: 'producer : product' },
  { a: 'Flower', b: 'Nectar', relation: 'producer : product' },
  { a: 'Vine', b: 'Grape', relation: 'producer : product' },
]

const CLASSIFICATION_BANK = [
  { words: ['Apple', 'Banana', 'Grape', 'Carrot'], odd: 'Carrot', rule: 'fruit vs vegetable' },
  { words: ['Dog', 'Cat', 'Hamster', 'Eagle'], odd: 'Eagle', rule: 'pet vs bird of prey' },
  { words: ['Truck', 'Bus', 'Bicycle', 'Car'], odd: 'Bicycle', rule: 'motor vehicle' },
  { words: ['Square', 'Circle', 'Triangle', 'Sphere'], odd: 'Sphere', rule: '2-D shape' },
  { words: ['January', 'March', 'Tuesday', 'May'], odd: 'Tuesday', rule: 'month' },
  { words: ['Rose', 'Tulip', 'Oak', 'Daisy'], odd: 'Oak', rule: 'flower vs tree' },
  { words: ['Piano', 'Guitar', 'Violin', 'Drum'], odd: 'Drum', rule: 'string instrument' },
  { words: ['Python', 'Java', 'HTML', 'Rust'], odd: 'HTML', rule: 'programming language' },
  { words: ['Fever', 'Cough', 'Rash', 'Exercise'], odd: 'Exercise', rule: 'symptom' },
  { words: ['Gold', 'Silver', 'Iron', 'Copper'], odd: 'Iron', rule: 'precious metal' },
  { words: ['Add', 'Subtract', 'Multiply', 'Divide'], odd: 'Add', rule: 'operation starting with consonant' },
  { words: ['Sparrow', 'Robin', 'Crow', 'Bat'], odd: 'Bat', rule: 'bird' },
  { words: ['Tomato', 'Potato', 'Onion', 'Mango'], odd: 'Mango', rule: 'vegetable' },
  { words: ['River', 'Lake', 'Ocean', 'Desert'], odd: 'Desert', rule: 'body of water' },
  { words: ['Doctor', 'Nurse', 'Teacher', 'Patient'], odd: 'Patient', rule: 'medical profession' },
  { words: ['Helium', 'Oxygen', 'Nitrogen', 'Iron'], odd: 'Iron', rule: 'gas' },
  { words: ['Summer', 'Winter', 'Spring', 'Monday'], odd: 'Monday', rule: 'season' },
  { words: ['Hat', 'Shirt', 'Shoe', 'Sock'], odd: 'Hat', rule: 'worn on feet or torso' },
  { words: ['Fork', 'Spoon', 'Knife', 'Plate'], odd: 'Plate', rule: 'utensil' },
  { words: ['Earth', 'Mars', 'Venus', 'Moon'], odd: 'Moon', rule: 'planet' },
]

// ---------------- Helpers ----------------

function toLetter(n) {
  return String.fromCharCode(65 + ((n % 26) + 26) % 26)
}

function isPrime(n) {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

// ---------------- Generators ----------------

function generateNumberSeries(rng) {
  const variant = randInt(rng, 0, 3)
  let terms = []
  let correct
  let explanation

  if (variant === 0) {
    // Arithmetic progression
    const start = randInt(rng, 1, 20)
    const step = randInt(rng, 2, 9) * (rng() < 0.5 ? 1 : -1)
    const count = randInt(rng, 4, 6)
    terms = Array.from({ length: count }, (_, i) => start + step * i)
    correct = start + step * count
    explanation = `${step >= 0 ? '+' : ''}${step} each step`
  } else if (variant === 1) {
    // Geometric progression (keep numbers friendly)
    const ratio = pick(rng, [2, 3, 4, 5])
    const start = randInt(rng, 2, Math.floor(200 / ratio ** 4))
    const count = 4
    terms = Array.from({ length: count }, (_, i) => start * ratio ** i)
    correct = start * ratio ** count
    explanation = `×${ratio} each step`
  } else if (variant === 2) {
    // Increasing difference
    const start = randInt(rng, 1, 10)
    const firstDiff = randInt(rng, 1, 4)
    let value = start
    terms = [value]
    let diff = firstDiff
    const count = 5
    for (let i = 0; i < count - 1; i++) {
      value += diff
      terms.push(value)
      diff++
    }
    correct = value + diff
    explanation = `differences increase by 1 (+${firstDiff}, +${firstDiff + 1}, …)`
  } else {
    // Alternating pattern (two interleaved operations)
    const a = randInt(rng, 2, 15)
    const b = randInt(rng, 2, 9)
    const op1 = pick(rng, ['+', '-'])
    const op2 = op1 === '+' ? '-' : '+'
    let value = randInt(rng, 5, 30)
    terms = [value]
    for (let i = 0; i < 5; i++) {
      value = op1 === '+' ? value + a : value - a
      terms.push(value)
      value = op2 === '+' ? value + b : value - b
      terms.push(value)
    }
    terms = terms.slice(0, 6)
    const last = terms[terms.length - 1]
    correct = op1 === '+' ? last + a : last - a
    explanation = `alternating ${op1}${a}, ${op2}${b}`
  }

  const prompt = `What comes next in the series?\n${terms.join(', ')}, ?`
  const distractors = [
    correct + 1,
    correct - 1,
    correct + 2,
    correct * 2,
    Math.floor(correct / 2),
    correct + terms[1] - terms[0],
  ]
  const { options, correctIndex } = buildChoices(rng, correct, distractors, 4)
  return {
    prompt,
    options,
    correctIndex,
    explanation: `Rule: ${explanation}; the next term is ${correct}.`,
    topic: TOPICS.NUMBER_SERIES,
  }
}

function generateLetterSeries(rng) {
  // Pattern: groups of three letters, e.g. SCD, TEF, UGH, ?, WKL
  // First letter advances by 1, second and third advance by fixed offsets.
  const first = randInt(rng, 0, 25)
  const offset2 = randInt(rng, -4, 4)
  const offset3 = randInt(rng, -4, 4)
  const groupCount = 5
  const groups = []
  for (let i = 0; i < groupCount; i++) {
    const a = toLetter(first + i)
    const b = toLetter(first + i + offset2)
    const c = toLetter(first + i + offset3)
    groups.push(`${a}${b}${c}`)
  }
  const missingIndex = randInt(rng, 1, groupCount - 2)
  const correct = groups[missingIndex]
  groups[missingIndex] = '?'

  const prompt = `Find the missing group.\n${groups.join(', ')}`
  const explanation = `First letters advance by 1; the missing group is ${correct}.`

  // Distractors: shift one position or change offsets.
  const distractors = [
    groups[missingIndex - 1],
    groups[missingIndex + 1],
    toLetter(first + missingIndex + 1) + toLetter(first + missingIndex + offset2) + toLetter(first + missingIndex + offset3),
    toLetter(first + missingIndex) + toLetter(first + missingIndex + offset2 + 1) + toLetter(first + missingIndex + offset3),
  ].filter((x) => x !== correct)

  const { options, correctIndex } = buildChoices(rng, correct, distractors, 4)
  return {
    prompt,
    options,
    correctIndex,
    explanation,
    topic: TOPICS.LETTER_SERIES,
  }
}

function generateWordAnalogy(rng) {
  const pair = pick(rng, ANALOGY_BANK)
  const otherPairs = ANALOGY_BANK.filter((p) => p.b !== pair.b && p.a !== pair.a)
  const prompt = `${pair.a} : ${pair.b} :: ___ : ?`
  const correct = pair.b
  const explanation = `${pair.a} relates to ${pair.b} as ${pair.relation}.`
  const distractors = shuffle(rng, otherPairs)
    .slice(0, 6)
    .map((p) => p.b)
  const { options, correctIndex } = buildChoices(rng, correct, distractors, 4)
  return {
    prompt,
    options,
    correctIndex,
    explanation,
    topic: TOPICS.WORD_ANALOGY,
  }
}

function generateOddOneOut(rng) {
  const variant = randInt(rng, 0, 3)
  let items = []
  let oddValue
  let rule

  if (variant === 0) {
    // Multiples
    const factor = randInt(rng, 3, 9)
    const count = 3
    const baseStart = randInt(rng, 1, 8)
    items = Array.from({ length: count }, (_, i) => factor * (baseStart + i))
    oddValue = items[0] + randInt(rng, 1, factor - 1)
    while (oddValue % factor === 0) oddValue++
    rule = `multiples of ${factor}`
  } else if (variant === 1) {
    // Perfect squares
    const start = randInt(rng, 2, 8)
    items = Array.from({ length: 3 }, (_, i) => (start + i) ** 2)
    oddValue = items[0] + randInt(rng, 1, 5)
    while (Number.isInteger(Math.sqrt(oddValue))) oddValue++
    rule = 'perfect squares'
  } else if (variant === 2) {
    // Prime numbers
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
    const start = randInt(rng, 0, primes.length - 4)
    items = primes.slice(start, start + 3)
    oddValue = items[0] + 1
    while (isPrime(oddValue)) oddValue++
    rule = 'prime numbers'
  } else {
    // Even numbers
    const start = randInt(rng, 4, 30)
    items = [start, start + 2, start + 4]
    oddValue = start + 1
    rule = 'even numbers'
  }

  items.push(oddValue)
  const shuffled = shuffle(rng, items)
  const correctIndex = shuffled.indexOf(oddValue)
  const prompt = `Which number is the odd one out?\n${shuffled.join(', ')}`
  const explanation = `The others are ${rule}.`

  return {
    prompt,
    options: shuffled.map(String),
    correctIndex,
    explanation,
    topic: TOPICS.ODD_ONE_OUT,
  }
}

function generateClassification(rng) {
  const item = pick(rng, CLASSIFICATION_BANK)
  const words = shuffle(rng, item.words)
  const correctIndex = words.indexOf(item.odd)
  const prompt = `Which word does not belong with the others?\n${words.join(', ')}`
  const explanation = `The others are ${item.rule}.`

  return {
    prompt,
    options: words,
    correctIndex,
    explanation,
    topic: TOPICS.CLASSIFICATION,
  }
}

const GENERATORS = [
  generateNumberSeries,
  generateLetterSeries,
  generateWordAnalogy,
  generateOddOneOut,
  generateClassification,
]

export function generateQuestion(rng) {
  const generator = pick(rng, GENERATORS)
  return generator(rng)
}
