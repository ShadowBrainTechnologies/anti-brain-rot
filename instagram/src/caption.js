const HASHTAGS = `.
.
.
#brainrot #brainteaser #dailybrainteaser #criticalthinking #mentalexercise
#braingames #puzzletime #mindgames #cognitivehealth #dopaminedetox
#brainrotchallenge #brainworkout #thinkfast #mindtraining #puzzlelovers
#puzzle #riddle #braingame #logicpuzzle #mindset`

export function buildCaption(puzzle) {
  return [
    `${puzzle.title} 🧩`,
    '',
    puzzle.puzzle,
    '',
    'Drop your answer below! 👇',
    '',
    'Train your brain with 30+ free games at the link in bio.',
    HASHTAGS,
  ].join('\n')
}
