import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import {
  COLORS,
  SESSION_SECONDS,
  CATCHER_Y,
  scoreForCatch,
  toggleColor,
  randomColor,
  fallSpeedFor,
} from './ColorSwitch.logic.js'
import './ColorSwitch.css'

const SPAWN_INTERVAL_MS = 1200
const TICK_MS = 16

export default function ColorSwitch() {
  const [phase, setPhase] = useState('idle')
  const [catcherColors, setCatcherColors] = useState([COLORS[0], COLORS[0]])
  const [balls, setBalls] = useState([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS)
  const [best, setBest] = useState(() => getBest('color-switch'))
  const [isRecord, setIsRecord] = useState(false)
  const [flashes, setFlashes] = useState([])

  const ballsRef = useRef([])
  const scoreRef = useRef(0)
  const catcherRef = useRef([COLORS[0], COLORS[0]])
  const elapsedRef = useRef(0)
  const spawnTimerRef = useRef(0)
  const flashIdRef = useRef(0)

  useEffect(() => {
    ballsRef.current = balls
  }, [balls])

  useEffect(() => {
    catcherRef.current = catcherColors
  }, [catcherColors])

  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(SESSION_SECONDS)
    setCatcherColors([COLORS[0], COLORS[0]])
    catcherRef.current = [COLORS[0], COLORS[0]]
    setBalls([])
    ballsRef.current = []
    setFlashes([])
    elapsedRef.current = 0
    spawnTimerRef.current = 0
    setIsRecord(false)
    setPhase('countdown')
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return
    let count = 3
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

    const timerId = setInterval(() => {
      elapsedRef.current += 1
      const remaining = SESSION_SECONDS - elapsedRef.current
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timerId)
        const finalScore = scoreRef.current
        const record = saveBest('color-switch', null, finalScore)
        setIsRecord(record)
        setBest(getBest('color-switch'))
        setPhase('gameover')
      }
    }, 1000)

    return () => clearInterval(timerId)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return

    const tickId = setInterval(() => {
      spawnTimerRef.current += TICK_MS
      if (spawnTimerRef.current >= SPAWN_INTERVAL_MS) {
        spawnTimerRef.current = 0
        const lane = Math.random() < 0.5 ? 0 : 1
        const color = randomColor()
        const newBall = { id: Date.now() + Math.random(), lane, color, y: 0 }
        ballsRef.current = [...ballsRef.current, newBall]
        setBalls(ballsRef.current)
      }

      const speed = fallSpeedFor(elapsedRef.current)
      const updated = []
      const caught = []

      for (const ball of ballsRef.current) {
        const newY = ball.y + speed
        if (newY >= CATCHER_Y) {
          const catcherColor = catcherRef.current[ball.lane]
          const delta = scoreForCatch(catcherColor, ball.color)
          scoreRef.current += delta
          caught.push({
            id: flashIdRef.current++,
            lane: ball.lane,
            delta,
          })
        } else {
          updated.push({ ...ball, y: newY })
        }
      }

      ballsRef.current = updated
      setBalls(updated)

      if (caught.length > 0) {
        setScore(scoreRef.current)
        setFlashes((prev) => [...prev, ...caught])
        setTimeout(() => {
          setFlashes((prev) =>
            prev.filter((f) => !caught.some((c) => c.id === f.id)),
          )
        }, 400)
      }
    }, TICK_MS)

    return () => clearInterval(tickId)
  }, [phase])

  const handleLaneClick = (lane) => {
    if (phase !== 'playing') return
    setCatcherColors((prev) => {
      const next = [...prev]
      next[lane] = toggleColor(next[lane])
      catcherRef.current = next
      return next
    })
  }

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Time {timeLeft}s</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('color-switch', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Color Switch</h1>
            <p className="panel__text">
              Two lanes, two colors. Tap a lane to toggle its catcher color.
              Match falling circles to score points — mismatches lose points.
              Survive {SESSION_SECONDS} seconds!
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="cs-countdown">{timeLeft}</div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            <div className="cs-arena">
              {[0, 1].map((lane) => (
                <div
                  key={lane}
                  className="cs-lane"
                  onClick={() => handleLaneClick(lane)}
                >
                  {balls
                    .filter((b) => b.lane === lane)
                    .map((ball) => (
                      <div
                        key={ball.id}
                        className={`cs-ball cs-ball--${ball.color}`}
                        style={{ top: `${ball.y}px` }}
                      />
                    ))}
                  <div
                    className={`cs-catcher cs-catcher--${catcherColors[lane]}`}
                  />
                  {flashes
                    .filter((f) => f.lane === lane)
                    .map((f) => (
                      <div
                        key={f.id}
                        className={`cs-flash ${f.delta > 0 ? 'cs-flash--ok' : 'cs-flash--bad'}`}
                      >
                        {f.delta > 0 ? '+1' : '-1'}
                      </div>
                    ))}
                </div>
              ))}
            </div>
            <div className="cs-timer">{timeLeft}s</div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Time's Up!</div>

            <div className="cs-summary">
              <div className="cs-summary__row">
                <span>Final score</span>
                <span>{score} pts</span>
              </div>
              <div className="cs-summary__row">
                <span>Duration</span>
                <span>{SESSION_SECONDS}s</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('color-switch', best)}
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
