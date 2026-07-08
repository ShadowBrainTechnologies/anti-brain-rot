import { useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import './NumberMemory.css'

const START_DIGITS = 3
const BASE_SHOW_MS = 1500
const PER_DIGIT_MS = 800

const showMsFor = (d) => BASE_SHOW_MS + d * PER_DIGIT_MS

function generateNumber(digits) {
  let num = ''
  for (let i = 0; i < digits; i++) {
    num += Math.floor(Math.random() * 10)
  }
  return num
}

export default function NumberMemory() {
  const [phase, setPhase] = useState('idle') // idle | showing | input | correct | gameover
  const [level, setLevel] = useState(1)
  const [digits, setDigits] = useState(START_DIGITS)
  const [target, setTarget] = useState('')
  const [guess, setGuess] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRecord, setIsRecord] = useState(false)
  const [best, setBest] = useState(() => getBest('number-memory'))
  const inputRef = useRef(null)

  const beginRound = (lvl, d) => {
    feedback('start')
    setLevel(lvl)
    setDigits(d)
    setTarget(generateNumber(d))
    setGuess('')
    setTimeLeft(showMsFor(d))
    setPhase('showing')
  }

  const startGame = () => beginRound(1, START_DIGITS)
  const nextLevel = () => beginRound(level + 1, digits + 1)

  // Countdown during the memorize phase.
  useEffect(() => {
    if (phase !== 'showing') return
    const total = showMsFor(digits)
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = total - (Date.now() - start)
      if (remaining <= 0) {
        clearInterval(id)
        setTimeLeft(0)
        setPhase('input')
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
    return () => clearInterval(id)
  }, [phase, digits])

  // Focus the input when it appears.
  useEffect(() => {
    if (phase === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [phase])

  // Auto-advance after a correct answer.
  useEffect(() => {
    if (phase !== 'correct') return
    const id = setTimeout(nextLevel, 1100)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const submitGuess = () => {
    if (guess.length === 0) return
    if (guess === target) {
      feedback('correct')
      setPhase('correct')
    } else {
      feedback('wrong')
      feedback('lose')
      const record = saveBest('number-memory', null, level)
      recordResult('number-memory', level)
      setIsRecord(record)
      setBest(getBest('number-memory'))
      setPhase('gameover')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitGuess()
  }

  const progress = phase === 'showing' ? Math.max(0, timeLeft / showMsFor(digits)) : 0
  const digitStyle = { '--digits': digits }

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Level {level}</span>
        <span className="game__stat">{digits} digits</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('number-memory', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Number Memory</h1>
            <p className="panel__text">
              A number flashes on screen for a few seconds. Memorize it, then type
              it back. Each correct answer adds a digit. How far can you go?
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'showing' && (
          <div className="panel">
            <p className="panel__label">Memorize</p>
            <div className="number" style={digitStyle}>{target}</div>
            <div className="progress">
              <div className="progress__bar" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}

        {phase === 'input' && (
          <div className="panel">
            <p className="panel__label">Type the number</p>
            <input
              ref={inputRef}
              className="guess"
              style={digitStyle}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={guess}
              onChange={(e) => setGuess(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={handleKeyDown}
              maxLength={digits}
            />
            <button className="btn btn--primary" onClick={submitGuess} disabled={!guess}>
              Submit
            </button>
          </div>
        )}

        {phase === 'correct' && (
          <div className="panel">
            <div className="badge badge--ok">Correct!</div>
            <p className="panel__text">Get ready for level {level + 1}…</p>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Game Over</div>
            <p className="panel__text">You reached level {level}.</p>
            {isRecord && (
              <div className="badge badge--record">New Best!</div>
            )}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('number-memory', best)}
              </p>
            )}
            <div className="reveal">
              <div className="reveal__row">
                <span>Your answer</span>
                <span className="reveal__value reveal__value--bad">{guess || '—'}</span>
              </div>
              <div className="reveal__row">
                <span>Correct</span>
                <span className="reveal__value reveal__value--ok">{target}</span>
              </div>
            </div>
            <button className="btn btn--primary" onClick={startGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
