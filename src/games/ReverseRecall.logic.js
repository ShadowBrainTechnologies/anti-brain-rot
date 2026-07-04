export const START_LENGTH = 3
export const GAP_MS = 300
export const PAUSE_BEFORE_KEYPAD_MS = 500
export const DISPLAY_TIME_MS = 800

export function displayTimeFor(level) {
  if (level <= 5) return 800
  if (level <= 9) return 700
  return 600
}

export function sequenceLengthFor(level) {
  return START_LENGTH + level - 1
}

export function generateSequence(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10))
}

export function reverseSequence(sequence) {
  return [...sequence].reverse()
}
