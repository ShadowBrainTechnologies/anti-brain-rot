import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  PIVOT,
  SESSION_SECONDS,
  randomItem,
  isCorrect,
} from './RapidSorting.logic.js'
import './RapidSorting.css'

export default function RapidSorting() {
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS)
  const [item, setItem] = useState(() => randomItem())
  const [best, setBest] = useState(() => getBest('rapid-sorting'))
  const [isRecord, setIsRecord] = useState(false)

  const scoreRef = useRef(0)

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current
    const record = saveBest('rapid-sorting', null, finalScore)
    setIsRecord(record)
    setBest(getBest('rapid-sorting'))
    recordResult('rapid-sorting', finalScore)
    feedback(finalScore > 0 ? 'win' : 'lose')
    setPhase('gameover')
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(SESSION_SECONDS)
    setItem(randomItem())
    setIsRecord(false)
    feedback('start')
    setPhase('countdown')
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return
    let count = 3
    setTimeLeft(count)
    const id = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(id)
        setPhase('playing')
      } else {
        setTimeLeft(count)
      }
    }, 800)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return
    setTimeLeft(SESSION_SECONDS)
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(id)
          endGame()
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, endGame])

  const handleSort = useCallback(
    (side) => {
      if (phase !== 'playing') return
      if (isCorrect(item, PIVOT, side)) {
        scoreRef.current += 1
        setScore(scoreRef.current)
        feedback('correct')
      } else {
        feedback('wrong')
      }
      setItem(randomItem())
    },
    [phase, item],
  )

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Time {timeLeft}s</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('rapid-sorting', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Rapid Sorting</h1>
            <p className="panel__text">
              Is each number smaller or larger/equal than {PIVOT}? Sort as many
              as you can in {SESSION_SECONDS} seconds.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="rs-countdown">{timeLeft}</div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            <div className="rs-pivot">
              <span className="rs-pivot__label">Pivot</span>
              <span className="rs-pivot__value">{PIVOT}</span>
            </div>
            <div className="rs-item">{item}</div>
            <div className="rs-controls">
              <button
                className="btn btn--primary rs-btn"
                onClick={() => handleSort('left')}
              >
                Smaller
              </button>
              <button
                className="btn btn--primary rs-btn"
                onClick={() => handleSort('right')}
              >
                Larger / Equal
              </button>
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Time's Up!</div>

            <div className="rs-summary">
              <div className="rs-summary__row">
                <span>Final score</span>
                <span>{score} pts</span>
              </div>
              <div className="rs-summary__row">
                <span>Duration</span>
                <span>{SESSION_SECONDS}s</span>
              </div>
            </div>

            {isRecord && (
              <div className="badge badge--record">New Best!</div>
            )}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('rapid-sorting', best)}
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
