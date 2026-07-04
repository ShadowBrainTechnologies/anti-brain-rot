import { useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import {
  BASE_HEALTH,
  ASTEROID_HEIGHT,
  GAME_DURATION,
  CONFIG,
  DIFFICULTY,
  createRng,
  pickWord,
  makeAsteroid,
  getTarget,
} from './TypingAsteroids.logic.js'
import './TypingAsteroids.css'

export default function TypingAsteroids() {
  const [status, setStatus] = useState('idle') // idle | playing | gameover
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM)
  const [input, setInput] = useState('')
  const [isRecord, setIsRecord] = useState(false)
  const [best, setBest] = useState(() => getBest('typing-asteroids', DIFFICULTY.MEDIUM))
  const [shake, setShake] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [, setTick] = useState(0)

  const fieldRef = useRef(null)
  const inputRef = useRef(null)
  const gameRef = useRef({ asteroids: [], health: BASE_HEALTH, score: 0, destroyed: 0 })
  const statusRef = useRef(status)
  const idRef = useRef(0)
  const nextSpawnRef = useRef(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    if (status === 'idle') {
      setBest(getBest('typing-asteroids', difficulty))
    }
  }, [difficulty, status])

  useEffect(() => {
    if (status === 'playing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  const startGame = () => {
    gameRef.current = { asteroids: [], health: BASE_HEALTH, score: 0, destroyed: 0, timeLeft: GAME_DURATION }
    idRef.current = 0
    setInput('')
    setIsRecord(false)
    setTimeLeft(GAME_DURATION)
    setStatus('playing')
  }

  useEffect(() => {
    if (status !== 'playing') return

    let rafId
    const cfg = CONFIG[difficulty]

    const loop = (now) => {
      if (statusRef.current !== 'playing') return

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = now

      const field = fieldRef.current
      const height = field ? field.clientHeight : 0
      const width = field ? field.clientWidth : 0

      const game = gameRef.current
      let nextAsteroids = game.asteroids.map((a) => ({ ...a, y: a.y + a.speed * dt }))
      let damage = 0

      nextAsteroids = nextAsteroids.filter((a) => {
        if (a.y >= height - ASTEROID_HEIGHT) {
          damage += cfg.collisionDamage
          return false
        }
        return true
      })

      if (now >= nextSpawnRef.current && width > 0) {
        const rng = createRng(now + idRef.current)
        const word = pickWord(rng, difficulty)
        const asteroid = makeAsteroid(++idRef.current, word, width, difficulty, rng)
        nextAsteroids.push(asteroid)
        nextSpawnRef.current = now + cfg.spawnMs
      }

      game.asteroids = nextAsteroids
      if (damage > 0) {
        game.health = Math.max(0, game.health - damage)
      }

      game.timeLeft = Math.max(0, game.timeLeft - dt)
      setTimeLeft(game.timeLeft)
      setTick((t) => t + 1)

      if (game.health <= 0 || game.timeLeft <= 0) {
        const record = saveBest('typing-asteroids', difficulty, game.score)
        setIsRecord(record)
        setBest(getBest('typing-asteroids', difficulty))
        setStatus('gameover')
        return
      }

      rafId = requestAnimationFrame(loop)
    }

    lastTimeRef.current = performance.now()
    nextSpawnRef.current = performance.now() + cfg.spawnMs
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [status, difficulty])

  const submitInput = () => {
    const word = input.trim()
    if (!word) return

    const game = gameRef.current
    const target = getTarget(game.asteroids)
    if (!target) {
      setInput('')
      return
    }

    const cfg = CONFIG[difficulty]
    if (target.word.toLowerCase() === word.toLowerCase()) {
      game.asteroids = game.asteroids.filter((a) => a.id !== target.id)
      game.score += cfg.score
      game.destroyed += 1
      setInput('')
      setTick((t) => t + 1)
    } else {
      game.health = Math.max(0, game.health - cfg.wrongDamage)
      setInput('')
      setTick((t) => t + 1)
      setShake(true)
      setTimeout(() => setShake(false), 220)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitInput()
  }

  const health = Math.max(0, Math.min(100, gameRef.current.health))
  const target = getTarget(gameRef.current.asteroids)
  const healthColor = health > 60 ? '#16a34a' : health > 30 ? '#eab308' : '#dc2626'

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {gameRef.current.score}</span>
        <span className="game__stat">Destroyed {gameRef.current.destroyed}</span>
        {status === 'playing' && (
          <span className="game__stat">Time {Math.ceil(timeLeft)}s</span>
        )}
        {best !== null && status === 'idle' && (
          <span className="game__stat game__stat--best">
            Best {formatBest('typing-asteroids', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {status === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Typing Asteroids</h1>
            <p className="panel__text">
              Words fall from the sky. Type the word on the asteroid closest to your base
              and press Enter to destroy it. Wrong words and collisions damage your base.
            </p>
            <p className="panel__text panel__text--muted">Choose a difficulty</p>
            <div className="typing-asteroids__difficulty">
              {Object.values(DIFFICULTY).map((d) => (
                <button
                  key={d}
                  className={`btn ${difficulty === d ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => setDifficulty(d)}
                  aria-pressed={difficulty === d}
                >
                  {d}
                </button>
              ))}
            </div>
            {best !== null && (
              <p className="panel__text panel__text--muted">
                Best ({difficulty}): {formatBest('typing-asteroids', best)}
              </p>
            )}
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {status === 'playing' && (
          <div className="typing-asteroids__field" ref={fieldRef}>
            <div className="typing-asteroids__health">
              <div
                className="typing-asteroids__health-bar"
                style={{ width: `${health}%`, backgroundColor: healthColor }}
              />
              <span className="typing-asteroids__health-text">{health} HP</span>
            </div>

            {gameRef.current.asteroids.map((asteroid) => {
              const isTarget = target && target.id === asteroid.id
              return (
                <div
                  key={asteroid.id}
                  className={`typing-asteroids__asteroid ${
                    isTarget ? 'typing-asteroids__asteroid--target' : ''
                  }`}
                  style={{ left: `${asteroid.xPercent * 100}%`, top: `${asteroid.y}px` }}
                >
                  <span className="typing-asteroids__asteroid-word">{asteroid.word}</span>
                  {isTarget && (
                    <span className="typing-asteroids__target-indicator" aria-hidden="true">
                      ▼
                    </span>
                  )}
                </div>
              )
            })}

            <div
              className={`typing-asteroids__input-wrap ${shake ? 'typing-asteroids__input-wrap--shake' : ''}`}
            >
              <input
                ref={inputRef}
                className="typing-asteroids__input"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Type the closest word…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => inputRef.current?.focus()}
              />
              <button className="btn btn--primary" onClick={submitInput}>
                Fire
              </button>
            </div>
          </div>
        )}

        {status === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">
              {gameRef.current.health <= 0 ? 'Base Destroyed' : 'Time Up'}
            </div>
            <p className="panel__text">
              You destroyed {gameRef.current.destroyed} asteroids and scored{' '}
              {gameRef.current.score} points.
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {!isRecord && best !== null && (
              <p className="panel__text panel__text--muted">
                Best ({difficulty}): {formatBest('typing-asteroids', best)}
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
