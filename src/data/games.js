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
import EstimateIt from '../games/EstimateIt.jsx'
import OddOneOut from '../games/OddOneOut.jsx'
import GoNoGo from '../games/GoNoGo.jsx'
import VisualSearch from '../games/VisualSearch.jsx'
import TypingAsteroids from '../games/TypingAsteroids.jsx'
import FaceIdentify from '../games/FaceIdentify.jsx'
import UnfollowTheLeader from '../games/UnfollowTheLeader.jsx'
import ColorSwitch from '../games/ColorSwitch.jsx'
import FollowTheLeader from '../games/FollowTheLeader.jsx'
import BirdWatching from '../games/BirdWatching.jsx'
import MissingPieces from '../games/MissingPieces.jsx'
import Rainfall from '../games/Rainfall.jsx'
import RapidSorting from '../games/RapidSorting.jsx'
import Matching from '../games/Matching.jsx'
import RapidMultiplication from '../games/RapidMultiplication.jsx'
import SignSolver from '../games/SignSolver.jsx'

// Registry of games grouped by category for the sidebar and home page.
// Each game: { id, name, description, path, component, group }
export const GAME_GROUPS = [
  {
    label: 'Reasoning',
    games: [
      {
        id: 'estimate-it',
        name: 'Estimate It',
        description:
          'Test your intuition with quick estimation challenges across time, angle, quantity, speed, and more.',
        path: '/estimate-it',
      },
      {
        id: 'odd-one-out',
        name: 'Odd One Out',
        description:
          'Three objects follow a hidden rule. Spot the single object that breaks it.',
        path: '/odd-one-out',
      },
      {
        id: 'rapid-sorting',
        name: 'Rapid Sorting',
        description: 'Snap-judge each number above or below the pivot as fast as you can.',
        path: '/rapid-sorting',
      },
    ],
  },
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
      {
        id: 'face-identify',
        name: 'Face Identify',
        description: 'Study faces and their names for 15 seconds, then match each face to the right name.',
        path: '/face-identify',
      },
      {
        id: 'unfollow-the-leader',
        name: 'Unfollow the Leader',
        description: 'Watch tiles light up in order, then tap them back in reverse.',
        path: '/unfollow-the-leader',
      },
      {
        id: 'follow-the-leader',
        name: 'Follow the Leader',
        description: 'Watch tiles light up in order, then tap them back in the same order as the sequence grows.',
        path: '/follow-the-leader',
      },
      {
        id: 'matching',
        name: 'Matching',
        description: 'Flip cards two at a time to find every matching pair from memory.',
        path: '/matching',
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
      {
        id: 'rapid-multiplication',
        name: 'Rapid Multiplication',
        description: 'Blast through times-tables against a 60-second clock.',
        path: '/rapid-multiplication',
      },
      {
        id: 'sign-solver',
        name: 'Sign Solver',
        description: 'Pick the operator that makes each equation true before time runs out.',
        path: '/sign-solver',
      },
    ],
  },
  {
    label: 'Speed',
    games: [
      {
        id: 'typing-asteroids',
        name: 'Typing Asteroids',
        description:
          'Type falling words before they crash into your base. Wrong words damage your shields.',
        path: '/typing-asteroids',
      },
      {
        id: 'color-switch',
        name: 'Color Switch',
        description: 'Toggle lane colors to match falling circles in a 45-second rush.',
        path: '/color-switch',
      },
      {
        id: 'rainfall',
        name: 'Rainfall',
        description: 'Tap the raindrops before they hit the ground in a 45-second downpour.',
        path: '/rainfall',
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
      {
        id: 'visual-search',
        name: 'Visual Search',
        description:
          'Locate the one target symbol hidden among visually similar distractors as fast as you can.',
        path: '/visual-search',
      },
      {
        id: 'bird-watching',
        name: 'Bird Watching',
        description: 'A flock flashes for a moment — count how many birds you spotted.',
        path: '/bird-watching',
      },
      {
        id: 'missing-pieces',
        name: 'Missing Pieces',
        description: 'Study the grid, then identify which colored piece went missing.',
        path: '/missing-pieces',
      },
    ],
  },
  {
    label: 'Inhibition',
    games: [
      {
        id: 'go-no-go',
        name: 'Go / No-Go',
        description: 'Tap green circles, resist red ones. Train impulse control across 60 fast trials.',
        path: '/go-no-go',
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
  'estimate-it': EstimateIt,
  'go-no-go': GoNoGo,
  'visual-search': VisualSearch,
  'odd-one-out': OddOneOut,
  'typing-asteroids': TypingAsteroids,
  'face-identify': FaceIdentify,
  'unfollow-the-leader': UnfollowTheLeader,
  'color-switch': ColorSwitch,
  'follow-the-leader': FollowTheLeader,
  'bird-watching': BirdWatching,
  'missing-pieces': MissingPieces,
  rainfall: Rainfall,
  'rapid-sorting': RapidSorting,
  matching: Matching,
  'rapid-multiplication': RapidMultiplication,
  'sign-solver': SignSolver,
}

export const DEFAULT_PATH = '/'

export function getGameComponent(id) {
  return GAME_COMPONENTS[id] ?? null
}

export const ALL_GAMES = GAME_GROUPS.flatMap((g) =>
  g.games.map((game) => ({ ...game, group: g.label })),
)
