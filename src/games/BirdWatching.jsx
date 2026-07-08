import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  TOTAL_ROUNDS,
  CHOICE_COUNT,
  randomBirdCount,
  buildChoices,
  isCorrect,
  countRangeForRound,
  flashDurationForRound,
} from './BirdWatching.logic.js'
import './BirdWatching.css'

function randomPositions(count) {
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({
      top: `${10 + Math.random() * 80}%`,
      left: `${10 + Math.random() * 80}%`,
    })
  }
  return positions
}

export default function BirdWatching() {
  const [phase, setPhase] = useState('idle')
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [count, setCount] = useState(0)
  const [choices, setChoices] = useState([])
  const [positions, setPositions] = useState([])
  const [best, setBest] = useState(() => getBest('bird-watching'))
  const [isRecord, setIsRecord] = useState(false)

  const scoreRef = useRef(0)
  const timeoutRef = useRef(null)
  const answeringRef = useRef(false)

  const clearRoundTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearRoundTimeout()
  }, [clearRoundTimeout])

  const startRound = useCallback((roundNum) => {
    clearRoundTimeout()
    answeringRef.current = false
    const { min, max } = countRangeForRound(roundNum)
    const nextCount = randomBirdCount(min, max)
    const nextChoices = buildChoices(nextCount, CHOICE_COUNT)
    setCount(nextCount)
    setChoices(nextChoices)
    setPositions(randomPositions(nextCount))
    setPhase('flash')
    const duration = flashDurationForRound(roundNum)
    timeoutRef.current = setTimeout(() => {
      setPhase('guess')
    }, duration)
  }, [clearRoundTimeout])

  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setRound(1)
    setIsRecord(false)
    setBest(getBest('bird-watching'))
    feedback('start')
    startRound(1)
  }, [startRound])

  const handleChoice = useCallback((choice) => {
    if (phase !== 'guess' || answeringRef.current) return
    answeringRef.current = true
    const correct = isCorrect(count, choice)
    if (correct) {
      feedback('correct')
      setScore((s) => {
        const next = s + 1
        scoreRef.current = next
        return next
      })
    } else {
      feedback('wrong')
    }

    if (round < TOTAL_ROUNDS) {
      setRound((r) => r + 1)
      startRound(round + 1)
    } else {
      clearRoundTimeout()
      const finalScore = scoreRef.current
      const record = saveBest('bird-watching', null, finalScore)
      setIsRecord(record)
      setBest(getBest('bird-watching'))
      recordResult('bird-watching', finalScore)
      feedback('win')
      setPhase('gameover')
    }
  }, [phase, count, round, startRound, clearRoundTimeout])

  return (
    <div className="game">
      <header className="game__hud">
        {phase !== 'idle' && phase !== 'gameover' && (
          <span className="game__stat">
            Round {round}/{TOTAL_ROUNDS}
          </span>
        )}
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('bird-watching', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Bird Watching</h1>
            <p className="panel__text">
              A flock of birds will flash on screen. Count them, then pick the
              right number. {TOTAL_ROUNDS} rounds — can you keep up as the
              flocks grow?
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'flash' || phase === 'guess') && (
          <div className="panel panel--wide">
            {phase === 'flash' && (
              <>
                <p className="panel__label">Count the flock</p>
                <div className="bw-arena" aria-label="Flock of birds">
                  {positions.map((pos, i) => (
                    <span
                      key={i}
                      className="bw-bird"
                      style={{ top: pos.top, left: pos.left }}
                    >
                      🐦
                    </span>
                  ))}
                </div>
              </>
            )}

            {phase === 'guess' && (
              <>
                <p className="panel__label">How many birds?</p>
                <div className="bw-choices">
                  {choices.map((choice) => (
                    <button
                      key={choice}
                      className="btn btn--primary bw-choice"
                      onClick={() => handleChoice(choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Flock Flown!</div>

            <div className="bw-summary">
              <div className="bw-summary__row">
                <span>Final score</span>
                <span>
                  {score}/{TOTAL_ROUNDS}
                </span>
              </div>
            </div>

            {isRecord && (
              <div className="badge badge--record">New Best!</div>
            )}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('bird-watching', best)}
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
