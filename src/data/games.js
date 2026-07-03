import NumberMemory from '../games/NumberMemory.jsx'
import MathSpeed from '../games/MathSpeed.jsx'
import ColorDeception from '../games/ColorDeception.jsx'
import TapTheColor from '../games/TapTheColor.jsx'
import Sudoku from '../games/sudoku/Sudoku.jsx'
import PathToSafety from '../games/PathToSafety.jsx'
import RPSReversal from '../games/RPSReversal.jsx'
import AttentionIsAllYouNeed from '../games/AttentionIsAllYouNeed.jsx'
import GridRotation from '../games/GridRotation.jsx'
import FirstFailure from '../games/FirstFailure.jsx'

// Registry of games grouped by category for the sidebar.
// Each game: { id, name, path, component, group }
export const GAME_GROUPS = [
  {
    label: 'Memory',
    games: [
      { id: 'number-memory', name: 'Number Memory', path: '/number-memory' },
      { id: 'attention-is-all-you-need', name: 'Attention Is All You Need', path: '/attention-is-all-you-need' },
    ],
  },
  {
    label: 'Math',
    games: [
      { id: 'math-speed', name: 'Math Speed', path: '/math-speed' },
    ],
  },
  {
    label: 'Perception',
    games: [
      { id: 'color-deception', name: 'Color of Deception', path: '/color-deception' },
      { id: 'tap-the-color', name: 'Tap the Color', path: '/tap-the-color' },
      { id: 'grid-rotation', name: 'Grid Rotation', path: '/grid-rotation' },
    ],
  },
  {
    label: 'Logic',
    games: [
      { id: 'sudoku', name: 'Sudoku', path: '/sudoku' },
      { id: 'path-to-safety', name: 'Path to Safety', path: '/path-to-safety' },
      { id: 'rps-reversal', name: 'RPS Reversal', path: '/rps-reversal' },
      { id: 'first-failure', name: 'First Failure', path: '/first-failure' },
    ],
  },
]

const GAME_COMPONENTS = {
  'number-memory': NumberMemory,
  'math-speed': MathSpeed,
  'color-deception': ColorDeception,
  'tap-the-color': TapTheColor,
  sudoku: Sudoku,
  'path-to-safety': PathToSafety,
  'rps-reversal': RPSReversal,
  'attention-is-all-you-need': AttentionIsAllYouNeed,
  'grid-rotation': GridRotation,
  'first-failure': FirstFailure,
}

export const DEFAULT_PATH = '/number-memory'

export function getGameComponent(id) {
  return GAME_COMPONENTS[id] ?? null
}

export const ALL_GAMES = GAME_GROUPS.flatMap((g) =>
  g.games.map((game) => ({ ...game, group: g.label })),
)
