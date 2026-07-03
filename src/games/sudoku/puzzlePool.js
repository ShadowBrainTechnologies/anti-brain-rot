import { getSudoku } from 'sudoku-gen'

// Pre-generation pool: keeps a small queue of ready puzzles per difficulty
// so starting a new game feels instant. Refill runs in idle time so the main
// thread never janks.
const POOL_SIZE = 4
const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert']

const pools = Object.fromEntries(DIFFICULTIES.map((d) => [d, []]))
const refilling = Object.fromEntries(DIFFICULTIES.map((d) => [d, false]))

const idleCb =
  typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback
    : (fn) => setTimeout(() => fn({ didTimeout: false }), 0)
const cancelIdle =
  typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function'
    ? window.cancelIdleCallback
    : clearTimeout

function generateOne(difficulty) {
  return getSudoku(difficulty)
}

// Fill the pool for a difficulty up to POOL_SIZE, one puzzle per idle tick so
// we never block the main thread for long.
function refill(difficulty) {
  if (refilling[difficulty]) return
  if (pools[difficulty].length >= POOL_SIZE) return
  refilling[difficulty] = true

  const step = () => {
    if (pools[difficulty].length >= POOL_SIZE) {
      refilling[difficulty] = false
      return
    }
    try {
      pools[difficulty].push(generateOne(difficulty))
    } catch (err) {
      refilling[difficulty] = false
      console.error('sudoku pool generation failed', err)
      return
    }
    idleCb(step)
  }
  idleCb(step)
}

// Public: get a puzzle for a difficulty. Pops from the pool when available
// (instant) and triggers a background refill. Falls back to a synchronous
// generate if the pool is empty (first-ever call for that difficulty).
export function getPuzzle(difficulty) {
  const pooled = pools[difficulty].shift()
  if (pooled) {
    refill(difficulty)
    return pooled
  }
  const fresh = generateOne(difficulty)
  refill(difficulty)
  return fresh
}

// Kick off background pre-generation for all difficulties on module load so
// the first game of each kind is also likely instant.
export function primeAllPools() {
  for (const d of DIFFICULTIES) refill(d)
}

// Test helper: expose pool sizes. Not used in UI.
export function __poolSizes() {
  return Object.fromEntries(DIFFICULTIES.map((d) => [d, pools[d].length]))
}

// Keep cancelIdle referenced so linters don't drop the import in some setups.
void cancelIdle
