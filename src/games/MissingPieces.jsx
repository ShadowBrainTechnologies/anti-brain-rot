import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import {
  ROUND_COUNT,
  GRID_DIM,
  MEMORIZE_MS,
  FEEDBACK_MS,
  PALETTE,
  buildGrid,
  removeOne,
  buildChoices,
  isCorrect,
} from './MissingPieces.logic.js'
import './MissingPieces.css'

export default function MissingPieces() {
  const [phase, setPhase] = useState('idle')
  const [rounds, setRounds] = useState([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [choices, setChoices] = useState([])
  const [wasCorrect, setWasCorrect] = useState(null)
  const [best, setBest] = useState(() => getBest('missing-pieces'))
  const [isRecord, setIsRecord] = useState(false)

  const generateRounds = useCallback(() => {
    return Array.from({ length: ROUND_COUNT }, () => {
      const grid = buildGrid(GRID_DIM * GRID_DIM, PALETTE)
      const { index, missingValue } = removeOne(grid)
      return { grid, missingIndex: index, missingValue }
    })
  }, [])

  const startGame = useCallback(() => {
    setRounds(generateRounds())
    setRoundIndex(0)
    setScore(0)
    setWasCorrect(null)
    setIsRecord(false)
    setChoices([])
    setPhase('memorize')
    feedback('start')
  }, [generateRounds])

  const finishGame = useCallback((finalScore) => {
    const record = saveBest('missing-pieces', null, finalScore)
    recordResult('missing-pieces', finalScore)
    setIsRecord(record)
    setBest(getBest('missing-pieces'))
    setPhase('finished')
    feedback('win')
  }, [])

  const advance = useCallback(() => {
    setWasCorrect(null)
    if (roundIndex + 1 >= ROUND_COUNT) {
      finishGame(score)
    } else {
      setRoundIndex((i) => i + 1)
      setChoices([])
      setPhase('memorize')
    }
  }, [roundIndex, score, finishGame])

  const handleChoice = useCallback(
    (choice) => {
      if (phase !== 'recall') return
      const round = rounds[roundIndex]
      const correct = isCorrect(round.missingValue, choice)
      setWasCorrect(correct)
      if (correct) setScore((s) => s + 1)
      setPhase('feedback')
      feedback(correct ? 'correct' : 'wrong')
    },
    [phase, rounds, roundIndex],
  )

  useEffect(() => {
    if (phase !== 'memorize' || rounds.length === 0) return
    const round = rounds[roundIndex]
    setChoices(buildChoices(round.missingValue, PALETTE))
    const id = setTimeout(() => {
      setPhase('recall')
    }, MEMORIZE_MS)
    return () => clearTimeout(id)
  }, [phase, rounds, roundIndex])

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(advance, FEEDBACK_MS)
    return () => clearTimeout(id)
  }, [phase, advance])

  const round = rounds[roundIndex]

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          Q {Math.min(roundIndex + 1, ROUND_COUNT)}/{ROUND_COUNT}
        </span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('missing-pieces', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Missing Pieces</h1>
            <p className="panel__text">
              Memorize the colored grid. One tile will be blanked out — pick the
              color that belongs there. {ROUND_COUNT} rounds, correct answers only.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'memorize' || phase === 'recall' || phase === 'feedback') && round && (
          <div className="panel panel--wide">
            <p className="panel__label">
              {phase === 'memorize' && 'Memorize the grid'}
              {phase === 'recall' && 'Which color is missing?'}
              {phase === 'feedback' && (wasCorrect ? 'Correct!' : 'Wrong!')}
            </p>

            <div
              className="mp-grid"
              style={{ gridTemplateColumns: `repeat(${GRID_DIM}, 1fr)` }}
            >
              {round.grid.map((color, i) => {
                const isMissing = i === round.missingIndex
                const isBlank = isMissing && phase !== 'memorize'
                let cellClass = 'mp-tile'
                if (phase === 'feedback' && isMissing) {
                  cellClass += ' mp-tile--correct'
                }
                return (
                  <div
                    key={`${roundIndex}-${i}`}
                    className={cellClass}
                    style={isBlank ? undefined : { backgroundColor: color.value }}
                  />
                )
              })}
            </div>

            {phase === 'recall' && (
              <div className="mp-choices">
                {choices.map((color) => (
                  <button
                    key={color.name}
                    className="mp-choice"
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleChoice(color)}
                    aria-label={`Choose ${color.name}`}
                  />
                ))}
              </div>
            )}

            {phase === 'feedback' && (
              <div className={`badge ${wasCorrect ? 'badge--ok' : 'badge--bad'}`}>
                {wasCorrect ? '+1' : '0'}
              </div>
            )}
          </div>
        )}

        {phase === 'finished' && (
          <div className="panel">
            <div className="badge badge--ok">Finished!</div>
            <p className="panel__text">
              You scored <strong>{score}/{ROUND_COUNT}</strong>
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('missing-pieces', best)}
              </p>
            )}
            <button className="btn btn--primary" onClick={startGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
