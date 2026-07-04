import { useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import {
  START_LENGTH,
  GAP_MS,
  PAUSE_BEFORE_KEYPAD_MS,
  displayTimeFor,
  sequenceLengthFor,
  generateSequence,
  reverseSequence,
} from './ReverseRecall.logic.js'
import './ReverseRecall.css'

const COUNTDOWN_SECONDS = 3

export default function ReverseRecall() {
  const [phase, setPhase] = useState('idle') // idle | countdown | display | recall | feedback | gameover
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [roundsCompleted, setRoundsCompleted] = useState(0)
  const [submissions, setSubmissions] = useState(0)
  const [maxLengthReached, setMaxLengthReached] = useState(START_LENGTH)
  const [sequence, setSequence] = useState([])
  const [expected, setExpected] = useState([])
  const [displayIndex, setDisplayIndex] = useState(0)
  const [shownDigit, setShownDigit] = useState(null)
  const [input, setInput] = useState([])
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [flash, setFlash] = useState(null) // 'success' | 'error'
  const [isCorrect, setIsCorrect] = useState(false)
  const [best, setBest] = useState(() => getBest('reverse-recall'))
  const [isRecord, setIsRecord] = useState(false)

  const phaseRef = useRef(phase)
  const inputRef = useRef(input)
  const expectedRef = useRef(expected)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    inputRef.current = input
  }, [input])

  useEffect(() => {
    expectedRef.current = expected
  }, [expected])

  const currentLength = sequenceLengthFor(level)

  const startRound = (nextLevel) => {
    const len = sequenceLengthFor(nextLevel)
    const nextSequence = generateSequence(len)
    setLevel(nextLevel)
    setMaxLengthReached(len)
    setSequence(nextSequence)
    setExpected(reverseSequence(nextSequence))
    setInput([])
    setDisplayIndex(0)
    setShownDigit(null)
    setFlash(null)
    setIsCorrect(false)
    setCountdown(COUNTDOWN_SECONDS)
    setPhase('countdown')
  }

  const startGame = () => {
    setScore(0)
    setRoundsCompleted(0)
    setSubmissions(0)
    setIsRecord(false)
    startRound(1)
  }

  const endGame = () => {
    const record = saveBest('reverse-recall', null, maxLengthReached)
    setIsRecord(record)
    setBest(getBest('reverse-recall'))
    setPhase('gameover')
  }

  // Countdown before displaying the sequence.
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('display')
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 800)
    return () => clearTimeout(id)
  }, [phase, countdown])

  // Display digits one at a time, then pause before the keypad appears.
  useEffect(() => {
    if (phase !== 'display') return
    let cancelled = false

    const run = async () => {
      for (let i = 0; i < sequence.length; i++) {
        if (cancelled) break
        setDisplayIndex(i)
        setShownDigit(sequence[i])
        await new Promise((resolve) =>
          setTimeout(resolve, displayTimeFor(level)),
        )
        if (cancelled) break
        setShownDigit(null)
        if (i < sequence.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, GAP_MS))
        }
      }
      if (!cancelled) {
        setDisplayIndex(sequence.length)
        await new Promise((resolve) =>
          setTimeout(resolve, PAUSE_BEFORE_KEYPAD_MS),
        )
        if (!cancelled) {
          setPhase('recall')
        }
      }
    }

    run()
    return () => {
      cancelled = true
      setShownDigit(null)
    }
  }, [phase, sequence, level])

  // Handle success / failure animation before moving on.
  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      if (isCorrect) {
        setScore((s) => s + 1)
        setRoundsCompleted((r) => r + 1)
        startRound(level + 1)
      } else {
        endGame()
      }
    }, 900)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isCorrect, level])

  // Keyboard input support.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (phaseRef.current !== 'recall') return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        if (inputRef.current.length >= expectedRef.current.length) return
        setInput((prev) => [...prev, Number(e.key)])
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        setInput((prev) => prev.slice(0, -1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (inputRef.current.length !== expectedRef.current.length) return
        const correct = inputRef.current.every(
          (d, i) => d === expectedRef.current[i],
        )
        setIsCorrect(correct)
        setSubmissions((s) => s + 1)
        setFlash(correct ? 'success' : 'error')
        setPhase('feedback')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const enterDigit = (digit) => {
    if (phase !== 'recall' || input.length >= expected.length || flash) return
    setInput((prev) => [...prev, digit])
  }

  const handleBackspace = () => {
    if (phase !== 'recall' || flash) return
    setInput((prev) => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    if (
      phase !== 'recall' ||
      input.length !== expected.length ||
      flash
    ) {
      return
    }

    const correct = input.every((d, i) => d === expected[i])
    setIsCorrect(correct)
    setSubmissions((s) => s + 1)
    setFlash(correct ? 'success' : 'error')
    setPhase('feedback')
  }

  const accuracy =
    submissions > 0
      ? Math.round((roundsCompleted / submissions) * 100)
      : 100

  const canSubmit = phase === 'recall' && input.length === expected.length

  const keypad = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Level {level}</span>
        <span className="game__stat">{currentLength} digits</span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('reverse-recall', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Reverse Recall</h1>
            <p className="panel__text">
              Watch a sequence of digits, then type them back in reverse order.
              Each correct round adds another digit and eventually speeds up the
              display.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="reverse-countdown">{countdown || 'Go!'}</div>
          </div>
        )}

        {phase === 'display' && (
          <div className="panel panel--wide reverse-display">
            <div className="reverse-display__digit">
              {shownDigit !== null ? shownDigit : ''}
            </div>
            <div className="reverse-display__progress">
              {displayIndex < sequence.length
                ? `Digit ${displayIndex + 1} of ${sequence.length}`
                : 'Memorize…'}
            </div>
          </div>
        )}

        {(phase === 'recall' || phase === 'feedback') && (
          <div className="panel panel--wide reverse-recall">
            <div
              className={[
                'reverse-input',
                flash === 'success' && 'reverse-input--success',
                flash === 'error' && 'reverse-input--error',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {input.length > 0 ? input.join(' ') : '—'}
            </div>

            {phase === 'recall' && input.length < expected.length && (
              <p className="reverse-hint">
                Enter {expected.length - input.length} more digit
                {expected.length - input.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="reverse-keypad">
              {keypad.flat().map((digit) => (
                <button
                  key={digit}
                  className="btn reverse-key"
                  onClick={() => enterDigit(digit)}
                  disabled={
                    phase !== 'recall' || input.length >= expected.length
                  }
                  aria-label={`Digit ${digit}`}
                >
                  {digit}
                </button>
              ))}
              <button
                className="btn reverse-key reverse-key--backspace"
                onClick={handleBackspace}
                disabled={phase !== 'recall' || input.length === 0}
                aria-label="Backspace"
              >
                ⌫
              </button>
              <button
                className="btn reverse-key"
                onClick={() => enterDigit(0)}
                disabled={phase !== 'recall' || input.length >= expected.length}
                aria-label="Digit 0"
              >
                0
              </button>
              <button
                className="btn reverse-key reverse-key--submit"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label="Submit answer"
              >
                ✓
              </button>
            </div>

            {phase === 'recall' && (
              <p className="reverse-tip">
                Tip: you can also use your keyboard numbers, Backspace, and Enter.
              </p>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Game Over</div>

            <div className="reverse-summary">
              <div className="reverse-summary__row">
                <span>Highest sequence length</span>
                <span>{maxLengthReached} digits</span>
              </div>
              <div className="reverse-summary__row">
                <span>Total rounds completed</span>
                <span>{roundsCompleted}</span>
              </div>
              <div className="reverse-summary__row">
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <div className="reverse-summary__row">
                <span>Longest correct streak</span>
                <span>{roundsCompleted}</span>
              </div>
              <div className="reverse-summary__row reverse-summary__row--stack">
                <span>Original sequence</span>
                <span>{sequence.join(' ')}</span>
              </div>
              <div className="reverse-summary__row reverse-summary__row--stack">
                <span>Correct reverse</span>
                <span>{expected.join(' ')}</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('reverse-recall', best)}
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
