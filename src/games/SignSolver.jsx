import { useCallback, useEffect, useRef, useState } from 'react'
import { feedback } from '../lib/feedback.js'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import {
  OPERATORS,
  SESSION_SECONDS,
  generatePuzzle,
  checkOperator,
} from './SignSolver.logic.js'
import './SignSolver.css'

export default function SignSolver() {
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS)
  const [best, setBest] = useState(() => getBest('sign-solver'))
  const [isRecord, setIsRecord] = useState(false)
  const [puzzle, setPuzzle] = useState(() => generatePuzzle())

  const scoreRef = useRef(score)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(SESSION_SECONDS)
    setIsRecord(false)
    setPuzzle(generatePuzzle())
    setPhase('playing')
    feedback('start')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing' || timeLeft > 0) return
    const finalScore = scoreRef.current
    const record = saveBest('sign-solver', null, finalScore)
    setIsRecord(record)
    setBest(getBest('sign-solver'))
    recordResult('sign-solver', finalScore)
    if (finalScore > 0) feedback('win')
    setPhase('gameover')
  }, [phase, timeLeft])

  const handleOperator = useCallback(
    (op) => {
      if (phase !== 'playing') return
      if (checkOperator(puzzle.a, puzzle.b, op, puzzle.result)) {
        feedback('correct')
        setScore((s) => s + 1)
        setPuzzle(generatePuzzle())
      } else {
        feedback('wrong')
      }
    },
    [phase, puzzle],
  )

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Time {timeLeft}s</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('sign-solver', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Sign Solver</h1>
            <p className="panel__text">
              Pick the operator that makes the equation true. Solve as many as
              you can in {SESSION_SECONDS} seconds.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            <div className="ss-equation">
              <span className="ss-operand">{puzzle.a}</span>
              <span className="ss-gap">?</span>
              <span className="ss-operand">{puzzle.b}</span>
              <span className="ss-gap">=</span>
              <span className="ss-operand">{puzzle.result}</span>
            </div>
            <div className="ss-operators">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  className="ss-btn"
                  onClick={() => handleOperator(op)}
                  aria-label={`Operator ${op}`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Time's Up!</div>

            <div className="ss-summary">
              <div className="ss-summary__row">
                <span>Final score</span>
                <span>{score}</span>
              </div>
              <div className="ss-summary__row">
                <span>Duration</span>
                <span>{SESSION_SECONDS}s</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('sign-solver', best)}
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
