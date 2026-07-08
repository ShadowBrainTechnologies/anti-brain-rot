// The cognitive dimensions the calibration engine tracks.
//
// This is the single source of truth for "what skills a brain has" in this app.
// Order defines the layout order around the brain radar on the home page.
//
// Extending: add a new entry here (unique `id`, a `label`, a `color`, an
// `emoji`, a one-line `blurb`) and reference its `id` in a game's weights inside
// calibration.js. The radar, legend, and profile math all derive from this list,
// so nothing else needs to change.

export const DIMENSIONS = [
  {
    id: 'speed',
    label: 'Speed',
    color: '#f97316',
    emoji: '⚡',
    blurb: 'How quickly you react and respond under time pressure.',
  },
  {
    id: 'judgement',
    label: 'Judgement',
    color: '#a855f7',
    emoji: '⚖️',
    blurb: 'Making the right call quickly when rules shift or conflict.',
  },
  {
    id: 'calculation',
    label: 'Calculation',
    color: '#0ea5e9',
    emoji: '🔢',
    blurb: 'Mental arithmetic and working with numbers.',
  },
  {
    id: 'accuracy',
    label: 'Accuracy',
    color: '#22c55e',
    emoji: '🎯',
    blurb: 'Precision and consistency — getting it right, not just fast.',
  },
  {
    id: 'observation',
    label: 'Observation',
    color: '#eab308',
    emoji: '👁️',
    blurb: 'Spotting details, targets, and changes in a busy field.',
  },
  {
    id: 'memory',
    label: 'Memory',
    color: '#ec4899',
    emoji: '🧩',
    blurb: 'Holding and recalling sequences, positions, and facts.',
  },
]

export const DIMENSION_IDS = DIMENSIONS.map((d) => d.id)

export function getDimension(id) {
  return DIMENSIONS.find((d) => d.id === id) ?? null
}
