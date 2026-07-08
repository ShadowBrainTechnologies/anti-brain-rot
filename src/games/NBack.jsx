import { useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import {
  START_N,
  ROUND_MS,
  COUNTDOWN_SECONDS,
  generateSequence,
  computeStats,
  nextDifficulty,
  roundsForN,
  isMatchRound,
} from './NBack.logic.js'
import './NBack.css'

export default function NBack() {
  const [phase, setPhase] = useState('idle') // idle | countdown | playing | results
  const [n, setN] = useState(START_N)
  const [length, setLength] = useState(roundsForN(START_N))
  const [highestN, setHighestN] = useState(START_N)
  const [sequence, setSequence] = useState([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [countdownLeft, setCountdownLeft] = useState(COUNTDOWN_SECONDS)
  const [roundProgress, setRoundProgress] = useState(0)
  const [tappedThisRound, setTappedThisRound] = useState(false)
  const [runStats, setRunStats] = useState(null)
  const [nextN, setNextN] = useState(START_N)
  const [nextLength, setNextLength] = useState(roundsForN(START_N))
  const [best, setBest] = useState(() => getBest('n-back'))
  const [isRecord, setIsRecord] = useState(false)
  const [tapFeedback, setTapFeedback] = useState(null) // null | 'correct' | 'wrong'

  const responsesRef = useRef([])
  const reactionTimesRef = useRef([])
  const hasTappedRef = useRef(false)
  const roundStartRef = useRef(0)
  const startRef = useRef(0)
  const roundIndexRef = useRef(0)

  const prepareGame = (startN, startLength = roundsForN(startN)) => {
    const { sequence: seq } = generateSequence(startLength, startN)
    setN(startN)
    setLength(startLength)
    setSequence(seq)
    setRoundIndex(0)
    setRoundProgress(0)
    setTappedThisRound(false)
    setTapFeedback(null)
    responsesRef.current = new Array(startLength).fill(false)
    reactionTimesRef.current = new Array(startLength).fill(null)
    hasTappedRef.current = false
    roundStartRef.current = 0
    startRef.current = 0
    roundIndexRef.current = 0
  }

  const startGame = () => {
    prepareGame(START_N)
    setHighestN(START_N)
    setCountdownLeft(COUNTDOWN_SECONDS)
    setPhase('countdown')
    feedback('start')
  }

  const continueGame = () => {
    prepareGame(nextN, nextLength)
    setCountdownLeft(COUNTDOWN_SECONDS)
    setPhase('countdown')
    feedback('start')
  }

  const retryGame = () => {
    prepareGame(n, length)
    setCountdownLeft(COUNTDOWN_SECONDS)
    setPhase('countdown')
    feedback('start')
  }

  // Countdown phase.
  useEffect(() => {
    if (phase !== 'countdown') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = COUNTDOWN_SECONDS * 1000 - (Date.now() - start)
      setCountdownLeft(Math.max(0, Math.ceil(remaining / 1000)))
      if (remaining <= 0) {
        clearInterval(id)
        setPhase('playing')
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  // Playing phase: frame-rate-independent timer and round advancement.
  useEffect(() => {
    if (phase !== 'playing') return
    startRef.current = Date.now()
    roundIndexRef.current = 0
    roundStartRef.current = startRef.current
    hasTappedRef.current = false
    setTappedThisRound(false)
    setTapFeedback(null)
    setRoundIndex(0)

    const id = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const idx = Math.floor(elapsed / ROUND_MS)
      const localProgress = (elapsed % ROUND_MS) / ROUND_MS
      setRoundProgress(localProgress)

      if (idx > roundIndexRef.current) {
        const end = Math.min(idx, sequence.length)
        for (let r = roundIndexRef.current; r < end; r++) {
          if (!hasTappedRef.current) {
            responsesRef.current[r] = false
          }
          hasTappedRef.current = false
        }

        if (idx >= sequence.length) {
          clearInterval(id)
          setPhase('results')
          return
        }

        roundIndexRef.current = idx
        setRoundIndex(idx)
        roundStartRef.current = startRef.current + idx * ROUND_MS
        setTappedThisRound(false)
        setTapFeedback(null)
      }
    }, 50)

    return () => clearInterval(id)
  }, [phase, sequence.length])

  const handleMatch = () => {
    if (phase !== 'playing' || hasTappedRef.current) return
    const rt = Date.now() - roundStartRef.current
    const expected = isMatchRound(roundIndexRef.current, sequence, n)
    hasTappedRef.current = true
    responsesRef.current[roundIndexRef.current] = true
    reactionTimesRef.current[roundIndexRef.current] = rt
    setTappedThisRound(true)
    setTapFeedback(expected ? 'correct' : 'wrong')
    feedback(expected ? 'correct' : 'wrong')
  }

  // Compute results when the run ends.
  useEffect(() => {
    if (phase !== 'results') return
    const stats = computeStats(responsesRef.current, reactionTimesRef.current, sequence, n)
    setRunStats(stats)

    const upcoming = nextDifficulty(stats.accuracy, n, length)
    setNextN(upcoming.n)
    setNextLength(upcoming.length)

    const newHighest = Math.max(highestN, upcoming.n)
    setHighestN(newHighest)
    const record = saveBest('n-back', null, newHighest)
    recordResult('n-back', newHighest)
    setIsRecord(record)
    setBest(getBest('n-back'))
    feedback(stats.accuracy >= 80 ? 'win' : 'lose')
  }, [phase, sequence, n, length, highestN])

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">N = {n}</span>
        <span className="game__stat">
          Round {Math.min(roundIndex + 1, length)}/{length}
        </span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('n-back', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">N-Back</h1>
            <p className="panel__text">
              A tile flashes in one of nine positions every {ROUND_MS / 1000}s. Tap
              <strong> Match</strong> when the current position matches the position from{' '}
              <strong>N turns ago</strong>. Starts at 1-Back; reach 80% accuracy to level up.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="nback-countdown">{countdownLeft}</div>
            <p className="panel__text">N = {n}</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            <p className="panel__label">N = {n}</p>
            <div className="nback-grid">
              {Array.from({ length: 9 }, (_, pos) => {
                const isActive = sequence[roundIndex] === pos
                const showFeedback = tapFeedback && isActive
                let cellClass = 'nback-cell'
                if (isActive) cellClass += ' nback-cell--active'
                if (showFeedback) cellClass += ` nback-cell--${tapFeedback}`
                return (
                  <div
                    key={`${roundIndex}-${pos}`}
                    className={cellClass}
                  />
                )
              })}
            </div>
            <div className="timer">
              <div className="timer__bar" style={{ width: `${roundProgress * 100}%` }} />
            </div>
            <button
              className="btn btn--primary nback-match"
              onClick={handleMatch}
              disabled={tappedThisRound}
            >
              Match
            </button>
          </div>
        )}

        {phase === 'results' && runStats && (
          <div className="panel">
            <h1 className="panel__title">Results</h1>
            <div className="nback-stats">
              <div className="nback-stat">
                <span className="nback-stat__value">{Math.round(runStats.accuracy)}%</span>
                <span className="nback-stat__label">Accuracy</span>
              </div>
              <div className="nback-stat">
                <span className="nback-stat__value">
                  {runStats.avgReactionMs != null ? `${runStats.avgReactionMs}ms` : '—'}
                </span>
                <span className="nback-stat__label">Avg Reaction</span>
              </div>
              <div className="nback-stat">
                <span className="nback-stat__value">{highestN}</span>
                <span className="nback-stat__label">Highest N</span>
              </div>
            </div>
            {runStats.accuracy >= 80 ? (
              <div className="badge badge--ok">Level up!</div>
            ) : (
              <div className="badge badge--bad">Keep practicing</div>
            )}
            {isRecord && <div className="badge badge--record">New Best!</div>}
            <div className="nback-actions">
              <button className="btn btn--primary" onClick={continueGame}>
                Continue
              </button>
              <button className="btn btn--secondary" onClick={retryGame}>
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
