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
import NBack from '../games/NBack.jsx'
import SequenceRecall from '../games/SequenceRecall.jsx'
import MentalRotation from '../games/MentalRotation.jsx'
import ReverseRecall from '../games/ReverseRecall.jsx'
import RuleSwitch from '../games/RuleSwitch.jsx'

// Registry of games grouped by category for the sidebar and home page.
// Each game: { id, name, description, path, component, group }
export const GAME_GROUPS = [
  {
    label: 'Memory',
    games: [
      {
        id: 'number-memory',
        name: 'Number Memory',
        description: 'Memorize digits and recall them before time runs out.',
        path: '/number-memory',
      },
      {
        id: 'attention-is-all-you-need',
        name: 'Attention Is All You Need',
        description: 'Read a short story in 25 seconds, then answer comprehension questions.',
        path: '/attention-is-all-you-need',
      },
      {
        id: 'n-back',
        name: 'N-Back',
        description: 'Tap Match when the current tile position matches the one from N turns ago.',
        path: '/n-back',
      },
      {
        id: 'sequence-recall',
        name: 'Sequence Recall',
        description: 'Watch tiles light up, then repeat the pattern as it grows longer and faster.',
        path: '/sequence-recall',
      },
      {
        id: 'reverse-recall',
        name: 'Reverse Recall',
        description: 'Memorize digits, then enter them in reverse order as the sequence grows.',
        path: '/reverse-recall',
      },
    ],
  },
  {
    label: 'Flexibility',
    games: [
      {
        id: 'rule-switch',
        name: 'Rule Switch',
        description: 'Sort objects by color, shape, or size — and adapt instantly when the rule changes.',
        path: '/rule-switch',
      },
    ],
  },
  {
    label: 'Math',
    games: [
      {
        id: 'math-speed',
        name: 'Math Speed',
        description: 'Solve arithmetic problems as fast as you can.',
        path: '/math-speed',
      },
    ],
  },
  {
    label: 'Perception',
    games: [
      {
        id: 'color-deception',
        name: 'Color of Deception',
        description: 'Fight through misleading labels and click the real color.',
        path: '/color-deception',
      },
      {
        id: 'tap-the-color',
        name: 'Tap the Color',
        description: 'Quickly tap the color that matches the prompt.',
        path: '/tap-the-color',
      },
      {
        id: 'grid-rotation',
        name: 'Grid Rotation',
        description: 'Track how a grid transforms after a hidden rotation.',
        path: '/grid-rotation',
      },
    ],
  },
  {
    label: 'Logic',
    games: [
      {
        id: 'sudoku',
        name: 'Sudoku',
        description: 'Fill the board so every row, column, and box contains 1-9.',
        path: '/sudoku',
      },
      {
        id: 'path-to-safety',
        name: 'Path to Safety',
        description: 'Find a safe route through a grid of hidden traps.',
        path: '/path-to-safety',
      },
      {
        id: 'rps-reversal',
        name: 'RPS Reversal',
        description: 'Play Rock Paper Scissors with reversed winning rules.',
        path: '/rps-reversal',
      },
      {
        id: 'first-failure',
        name: 'First Failure',
        description: 'Spot the first mistake in a sequence before it compounds.',
        path: '/first-failure',
      },
      {
        id: 'mental-rotation',
        name: 'Mental Rotation',
        description: 'Pick the rotated shape among mirrored and modified decoys.',
        path: '/mental-rotation',
      },
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
  'n-back': NBack,
  'sequence-recall': SequenceRecall,
  'mental-rotation': MentalRotation,
  'reverse-recall': ReverseRecall,
  'rule-switch': RuleSwitch,
}

export const DEFAULT_PATH = '/'

export function getGameComponent(id) {
  return GAME_COMPONENTS[id] ?? null
}

export const ALL_GAMES = GAME_GROUPS.flatMap((g) =>
  g.games.map((game) => ({ ...game, group: g.label })),
)
