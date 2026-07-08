export const OPERATORS = ['+', '−', '×', '÷']
export const SESSION_SECONDS = 60

function randInt(min, max, rng) {
  return min + Math.floor(rng() * (max - min + 1))
}

export function applyOp(a, op, b) {
  switch (op) {
    case '+':
      return a + b
    case '−':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? null : a / b
    default:
      return null
  }
}

export function checkOperator(a, b, op, result) {
  return applyOp(a, op, b) === result
}

function isUniqueSolution(a, b, result, targetOp) {
  let matches = 0
  for (const op of OPERATORS) {
    if (checkOperator(a, b, op, result)) matches++
  }
  return matches === 1 && checkOperator(a, b, targetOp, result)
}

export function generatePuzzle(rng = Math.random) {
  let a
  let b
  let op
  let result

  do {
    op = OPERATORS[Math.floor(rng() * OPERATORS.length)]

    if (op === '+') {
      a = randInt(2, 20, rng)
      b = randInt(2, 20, rng)
      result = a + b
    } else if (op === '−') {
      a = randInt(2, 30, rng)
      b = randInt(2, 30, rng)
      result = a - b
    } else if (op === '×') {
      a = randInt(2, 12, rng)
      b = randInt(2, 12, rng)
      result = a * b
    } else {
      b = randInt(2, 12, rng)
      const quotient = randInt(2, 12, rng)
      a = b * quotient
      result = quotient
    }
  } while (!isUniqueSolution(a, b, result, op))

  return { a, b, op, result }
}
