export const ROUND_COUNT = 10
export const MEMORIZE_TIME = 5
export const RECALL_TIME = 15
export const ROTATE_DURATION = 1800

export const DIRECTIONS = ['cw', 'ccw']

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function sizeForWins(wins) {
  return Math.min(5, 3 + Math.floor(wins / 3))
}

export function blueCountForSize(size) {
  if (size === 3) return 3
  if (size === 4) return 5
  return 7
}

export function rotateIndex(index, size, degrees) {
  const r = Math.floor(index / size)
  const c = index % size
  switch (degrees) {
    case 90:
      return c * size + (size - 1 - r)
    case 270:
      return (size - 1 - c) * size + r
    default:
      return index
  }
}

export function buildRotatedOrder(size, degrees) {
  const order = new Array(size * size)
  for (let i = 0; i < order.length; i++) {
    order[rotateIndex(i, size, degrees)] = i
  }
  return order
}

export function rotationLabel(direction) {
  return direction === 'cw' ? '90° right' : '90° left'
}

export function rotationDeg(direction) {
  return direction === 'cw' ? 90 : -90
}

export function setsEqual(a, b) {
  if (a.size !== b.size) return false
  for (const x of a) if (!b.has(x)) return false
  return true
}
