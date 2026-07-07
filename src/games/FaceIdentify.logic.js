export const START_FACES = 3
export const MEMORIZE_MS_PER_FACE = 2500
export const NEXT_ROUND_DELAY_MS = 1200

export function memorizeMsFor(count) {
  return count * MEMORIZE_MS_PER_FACE
}

export const NAMES = [
  'Aiden',
  'Briar',
  'Carmen',
  'Darius',
  'Elara',
  'Felix',
  'Gia',
  'Hugo',
  'Iris',
  'Jasper',
  'Kira',
  'Leo',
  'Mira',
  'Nico',
  'Opal',
  'Pablo',
  'Quinn',
  'Rosa',
  'Silas',
  'Tessa',
  'Uri',
  'Vera',
  'Wes',
  'Xia',
  'Yara',
  'Zane',
]

const SKIN_TONES = [
  '#f8d9c6',
  '#f0c0a0',
  '#e0ac84',
  '#cd956d',
  '#a16e4b',
  '#7a4e35',
  '#5c3a2a',
]

const HAIR_COLORS = [
  '#0f0f0f',
  '#3b2618',
  '#6b4c28',
  '#a52a2a',
  '#d4a017',
  '#e6e6e6',
  '#c2185b',
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

export function generateFace(seed) {
  const rng = createRng(seed)
  const skin = rng.pick(SKIN_TONES)
  const hairColor = rng.pick(HAIR_COLORS)
  const hairStyle = rng.range(0, 4)
  const eyeStyle = rng.range(0, 3)
  const mouthStyle = rng.range(0, 3)
  const accessory = rng.range(0, 4)
  return {
    seed,
    skin,
    hairColor,
    hairStyle,
    eyeStyle,
    mouthStyle,
    accessory,
  }
}

export function faceCountFor(level) {
  return START_FACES + (level - 1)
}

export function generateRound(level, seed) {
  const rng = createRng(seed)
  const count = faceCountFor(level)
  const shuffledNames = rng.shuffle(NAMES)
  const faces = []
  for (let i = 0; i < count; i++) {
    const faceSeed = seed * 1000 + i * 13 + level * 7
    faces.push({
      name: shuffledNames[i],
      ...generateFace(faceSeed),
    })
  }
  const quizOrder = rng.shuffle(faces.map((_, i) => i))
  return { level, count, faces, quizOrder }
}

export function evaluateRound(round, answers) {
  let correct = 0
  for (let i = 0; i < round.faces.length; i++) {
    if (answers[i] === round.faces[i].name) correct += 1
  }
  return {
    correct,
    total: round.faces.length,
    perfect: correct === round.faces.length,
  }
}
