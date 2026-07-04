// Testable game logic for Rule Switch.
// Objects combine colors, shapes, and sizes; the active rule decides the correct answer.

export const COLORS = [
  { id: 'red', label: 'Red', class: 'color-red' },
  { id: 'blue', label: 'Blue', class: 'color-blue' },
  { id: 'green', label: 'Green', class: 'color-green' },
  { id: 'yellow', label: 'Yellow', class: 'color-yellow' },
]

export const SHAPES = [
  { id: 'circle', label: 'Circle', class: 'shape-circle' },
  { id: 'square', label: 'Square', class: 'shape-square' },
  { id: 'triangle', label: 'Triangle', class: 'shape-triangle' },
  { id: 'star', label: 'Star', class: 'shape-star' },
]

export const SIZES = [
  { id: 'small', label: 'Small', class: 'size-small' },
  { id: 'large', label: 'Large', class: 'size-large' },
]

export const RULES = {
  COLOR: 'color',
  SHAPE: 'shape',
  SIZE: 'size',
}

export const RULE_LABELS = {
  color: 'Sort by Color',
  shape: 'Sort by Shape',
  size: 'Sort by Size',
}

export const RULE_KEYS = {
  color: 'COLOR',
  shape: 'SHAPE',
  size: 'SIZE',
}

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const SESSION_SECONDS = 90

export function optionsForRule(rule) {
  if (rule === RULES.SIZE) return SIZES.map((s) => s.label)
  if (rule === RULES.SHAPE) return SHAPES.map((s) => s.label)
  return COLORS.map((c) => c.label)
}

export function answerFor(object, rule) {
  if (rule === RULES.SIZE) {
    return SIZES.find((s) => s.id === object.size)?.label
  }
  if (rule === RULES.SHAPE) {
    return SHAPES.find((s) => s.id === object.shape)?.label
  }
  return COLORS.find((c) => c.id === object.color)?.label
}

export function rulesForDifficulty(difficulty) {
  if (difficulty === DIFFICULTY.EASY) {
    return [RULES.COLOR, RULES.SHAPE]
  }
  return [RULES.COLOR, RULES.SHAPE, RULES.SIZE]
}

export function pickRule(difficulty, currentRule) {
  const pool = rulesForDifficulty(difficulty)
  if (pool.length === 1) return pool[0]
  const choices = pool.filter((r) => r !== currentRule)
  return choices[Math.floor(Math.random() * choices.length)]
}

export function switchThreshold(difficulty) {
  if (difficulty === DIFFICULTY.EASY) return 10
  if (difficulty === DIFFICULTY.MEDIUM) return 6
  // Hard: random every 3–5 questions.
  return 3 + Math.floor(Math.random() * 3)
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

export function generateObject(history = []) {
  let object
  let attempts = 0
  const maxAttempts = 100

  do {
    object = {
      color: randomItem(COLORS).id,
      shape: randomItem(SHAPES).id,
      size: randomItem(SIZES).id,
    }
    attempts++
  } while (
    attempts < maxAttempts &&
    history.length >= 2 &&
    objectsEqual(object, history[history.length - 1]) &&
    objectsEqual(object, history[history.length - 2])
  )

  return object
}

export function objectsEqual(a, b) {
  if (!a || !b) return false
  return a.color === b.color && a.shape === b.shape && a.size === b.size
}

export function objectClasses(object) {
  const colorClass = COLORS.find((c) => c.id === object.color)?.class ?? ''
  const shapeClass = SHAPES.find((s) => s.id === object.shape)?.class ?? ''
  const sizeClass = SIZES.find((s) => s.id === object.size)?.class ?? ''
  return ['shape', colorClass, shapeClass, sizeClass].filter(Boolean).join(' ')
}
