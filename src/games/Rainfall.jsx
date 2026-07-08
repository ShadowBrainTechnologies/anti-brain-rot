import { useCallback, useEffect, useRef, useState } from 'react'
import { feedback } from '../lib/feedback.js'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import {
  SESSION_SECONDS,
  TICK_MS,
  DROP_SIZE,
  ARENA_HEIGHT,
  fallSpeedFor,
  spawnIntervalFor,
  spawnDrop,
} from './Rainfall.logic.js'
import './Rainfall.css'

const DEFAULT_ARENA_WIDTH = 360
const MISS_Y = ARENA_HEIGHT - DROP_SIZE / 2

export default function Rainfall() {
  const [phase, setPhase] = useState('idle')
  const [drops, setDrops] = useState([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS)
  const [best, setBest] = useState(() => getBest('rainfall'))
  const [isRecord, setIsRecord] = useState(false)

  const dropsRef = useRef([])
  const scoreRef = useRef(0)
  const elapsedRef = useRef(0)
  const spawnTimerRef = useRef(0)
  const idRef = useRef(0)
  const arenaRef = useRef(null)
  const arenaWidthRef = useRef(DEFAULT_ARENA_WIDTH)

  useEffect(() => {
    dropsRef.current = drops
  }, [drops])

  useEffect(() => {
    if (phase !== 'playing') return
    const updateWidth = () => {
      if (arenaRef.current) {
        arenaWidthRef.current = arenaRef.current.clientWidth
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [phase])

  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(SESSION_SECONDS)
    setDrops([])
    dropsRef.current = []
    elapsedRef.current = 0
    spawnTimerRef.current = 0
    setIsRecord(false)
    setPhase('playing')
    feedback('start')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return

    const timerId = setInterval(() => {
      elapsedRef.current += 1
      const remaining = SESSION_SECONDS - elapsedRef.current
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timerId)
        const finalScore = scoreRef.current
        const record = saveBest('rainfall', null, finalScore)
        setIsRecord(record)
        setBest(getBest('rainfall'))
        recordResult('rainfall', finalScore)
        feedback(finalScore > 0 ? 'win' : 'lose')
        setPhase('gameover')
      }
    }, 1000)

    return () => clearInterval(timerId)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return

    const tickId = setInterval(() => {
      spawnTimerRef.current += TICK_MS
      let nextDrops = dropsRef.current

      if (spawnTimerRef.current >= spawnIntervalFor(elapsedRef.current)) {
        spawnTimerRef.current = 0
        const spawned = spawnDrop(arenaWidthRef.current)
        const newDrop = { ...spawned, id: idRef.current++ }
        nextDrops = [...nextDrops, newDrop]
      }

      const speed = fallSpeedFor(elapsedRef.current)
      const updated = []
      let missed = false

      for (const drop of nextDrops) {
        const newY = drop.y + speed
        if (newY >= MISS_Y) {
          missed = true
        } else {
          updated.push({ ...drop, y: newY })
        }
      }

      if (missed) {
        feedback('wrong')
      }

      dropsRef.current = updated
      setDrops(updated)
    }, TICK_MS)

    return () => clearInterval(tickId)
  }, [phase])

  const handleDropClick = (id) => {
    if (phase !== 'playing') return
    const index = dropsRef.current.findIndex((d) => d.id === id)
    if (index === -1) return
    const updated = dropsRef.current.filter((_, i) => i !== index)
    dropsRef.current = updated
    setDrops(updated)
    scoreRef.current += 1
    setScore(scoreRef.current)
    feedback('correct')
  }

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Time {timeLeft}s</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('rainfall', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Rainfall</h1>
            <p className="panel__text">
              Raindrops are falling! Tap each one before it reaches the bottom.
              Catch as many as you can in {SESSION_SECONDS} seconds.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            <div className="rf-arena" ref={arenaRef}>
              {drops.map((drop) => (
                <button
                  key={drop.id}
                  type="button"
                  className="rf-drop"
                  style={{ left: `${drop.x}px`, top: `${drop.y}px` }}
                  onClick={() => handleDropClick(drop.id)}
                  aria-label="Catch drop"
                >
                  💧
                </button>
              ))}
            </div>
            <div className="rf-timer">{timeLeft}s</div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Time's Up!</div>

            <div className="rf-summary">
              <div className="rf-summary__row">
                <span>Final score</span>
                <span>{score} pts</span>
              </div>
              <div className="rf-summary__row">
                <span>Duration</span>
                <span>{SESSION_SECONDS}s</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('rainfall', best)}
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
