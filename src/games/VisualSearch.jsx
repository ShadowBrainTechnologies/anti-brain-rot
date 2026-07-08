import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback as playFeedback } from '../lib/feedback.js'
import {
  DIFFICULTY,
  ROUNDS,
  COUNTDOWN_SECONDS,
  PUZZLE_TYPE_LABELS,
  gridSizeFor,
  maxTimeFor,
  scoreForTime,
  generateRounds,
  computeStats,
  formatTime,
} from './VisualSearch.logic.js'
import './VisualSearch.css'

const FEEDBACK_MS = 700

export default function VisualSearch() {
  const [phase, setPhase] = useState('idle') // idle | countdown | playing | feedback | finished
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY)
  const [rounds, setRounds] = useState([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null) // 'hit' | 'miss' | null
  const [feedbackPoints, setFeedbackPoints] = useState(0)
  const [timeLeftMs, setTimeLeftMs] = useState(0)
  const [stats, setStats] = useState(null)
  const [best, setBest] = useState(() => getBest('visual-search', DIFFICULTY.EASY))
  const [isRecord, setIsRecord] = useState(false)

  const resultsRef = useRef([])
  const answeredRef = useRef(false)
  const roundStartRef = useRef(0)
  const scoreRef = useRef(0)
  const timeoutRef = useRef(null)
  const timerIntervalRef = useRef(null)

  const round = rounds[roundIndex]

  useEffect(() => {
    setBest(getBest('visual-search', difficulty))
  }, [difficulty])

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
  }, [])

  const startGame = useCallback(() => {
    const newRounds = generateRounds(difficulty, Date.now())
    setRounds(newRounds)
    setRoundIndex(0)
    setScore(0)
    scoreRef.current = 0
    resultsRef.current = []
    setFeedback(null)
    setFeedbackPoints(0)
    setStats(null)
    setIsRecord(false)
    setCountdown(COUNTDOWN_SECONDS)
    setPhase('countdown')
    playFeedback('start')
  }, [difficulty])

  useEffect(() => {
    if (phase !== 'countdown') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = COUNTDOWN_SECONDS - Math.floor((Date.now() - start) / 1000)
      if (remaining <= 0) {
        clearInterval(id)
        setPhase('playing')
      } else {
        setCountdown(remaining)
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  const finishRound = useCallback(
    (hit, reactionMs) => {
      if (answeredRef.current) return
      answeredRef.current = true
      clearTimers()

      const points = scoreForTime(reactionMs, hit)
      const result = { hit, reactionMs, score: points }
      resultsRef.current.push(result)
      const newScore = scoreRef.current + points
      scoreRef.current = newScore
      setScore(newScore)
      setFeedback(hit ? 'hit' : 'miss')
      setFeedbackPoints(points)
      setPhase('feedback')
      playFeedback(hit ? 'correct' : 'wrong')
    },
    [clearTimers],
  )

  useEffect(() => {
    if (phase !== 'playing' || !round) return
    answeredRef.current = false
    roundStartRef.current = performance.now()
    const limit = maxTimeFor(difficulty)
    setTimeLeftMs(limit)

    timerIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - roundStartRef.current
      const remaining = Math.max(0, limit - elapsed)
      setTimeLeftMs(remaining)
      if (remaining <= 0) clearInterval(timerIntervalRef.current)
    }, 50)

    timeoutRef.current = setTimeout(() => {
      finishRound(false, null)
    }, limit)

    return () => clearTimers()
  }, [phase, round, difficulty, clearTimers, finishRound])

  const handleCellClick = useCallback(
    (index) => {
      if (phase !== 'playing' || answeredRef.current || !round) return
      const reactionMs = Math.round(performance.now() - roundStartRef.current)
      finishRound(index === round.targetIndex, reactionMs)
    },
    [phase, round, finishRound],
  )

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      if (roundIndex + 1 >= ROUNDS) {
        const finalStats = computeStats(resultsRef.current)
        setStats(finalStats)
        const record = saveBest('visual-search', difficulty, finalStats.score)
        recordResult('visual-search', finalStats.score)
        setIsRecord(record)
        setBest(getBest('visual-search', difficulty))
        setPhase('finished')
        playFeedback('win')
      } else {
        setRoundIndex((i) => i + 1)
        setFeedback(null)
        setPhase('playing')
      }
    }, FEEDBACK_MS)
    return () => clearTimeout(id)
  }, [phase, roundIndex, difficulty])

  const difficultyButton = (d) => {
    const active = difficulty === d
    return (
      <button
        key={d}
        className={[
          'btn',
          'visual-search__difficulty-btn',
          active && 'visual-search__difficulty-btn--active',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setDifficulty(d)}
        aria-pressed={active}
      >
        {d[0].toUpperCase() + d.slice(1)}
      </button>
    )
  }

  const maxTime = maxTimeFor(difficulty)
  const progress = round ? Math.max(0, Math.min(1, timeLeftMs / maxTime)) : 0

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          Round {Math.min(roundIndex + 1, ROUNDS)}/{ROUNDS}
        </span>
        <span className="game__stat">Score {score}</span>
        {phase === 'playing' && round && (
          <span className="game__stat">{PUZZLE_TYPE_LABELS[round.type]}</span>
        )}
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('visual-search', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Visual Search</h1>
            <p className="panel__text">
              Find the target symbol hidden among similar distractors. Be fast —
              your score depends on speed.
            </p>

            <div className="visual-search__difficulty">
              {Object.values(DIFFICULTY).map(difficultyButton)}
            </div>

            <p className="panel__text panel__text--muted">
              {gridSizeFor(difficulty)}×{gridSizeFor(difficulty)} grid ·{' '}
              {maxTime / 1000}s per round · {ROUNDS} rounds
            </p>

            {best !== null && (
              <p className="panel__text panel__text--muted">
                Best ({difficulty}): {formatBest('visual-search', best)}
              </p>
            )}

            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="visual-search__countdown">{countdown || 'Go!'}</div>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && round && (
          <div className="visual-search__arena">
            <div className="visual-search__target">
              <span className="visual-search__target-label">Find:</span>
              <Cell content={round.target} />
            </div>

            <div
              className="visual-search__grid"
              style={{
                gridTemplateColumns: `repeat(${round.size}, 1fr)`,
                gridTemplateRows: `repeat(${round.size}, 1fr)`,
              }}
              role="group"
              aria-label="Search grid"
            >
              {round.cells.map((cell, i) => (
                <button
                  key={i}
                  className={[
                    'visual-search__cell',
                    phase === 'feedback' && cell.isTarget && 'visual-search__cell--target',
                    phase === 'feedback' &&
                      !cell.isTarget &&
                      'visual-search__cell--distractor',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleCellClick(i)}
                  aria-label={`cell ${i + 1}`}
                >
                  <Cell content={cell} />
                </button>
              ))}
            </div>

            <div className="progress">
              <div
                className="progress__bar"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {phase === 'feedback' && (
              <div
                className={[
                  'visual-search__feedback',
                  feedback === 'hit'
                    ? 'visual-search__feedback--hit'
                    : 'visual-search__feedback--miss',
                ].join(' ')}
              >
                {feedback === 'hit' ? `+${feedbackPoints}` : 'Miss'}
              </div>
            )}
          </div>
        )}

        {phase === 'finished' && stats && (
          <div className="panel">
            <h1 className="panel__title">Results</h1>

            <div className="visual-search__stats">
              <div className="visual-search__stat">
                <span className="visual-search__stat-value">{stats.score}</span>
                <span className="visual-search__stat-label">Score</span>
              </div>
              <div className="visual-search__stat">
                <span className="visual-search__stat-value">{stats.accuracy}%</span>
                <span className="visual-search__stat-label">Accuracy</span>
              </div>
              <div className="visual-search__stat">
                <span className="visual-search__stat-value">
                  {formatTime(stats.avgTime)}
                </span>
                <span className="visual-search__stat-label">Avg Time</span>
              </div>
              <div className="visual-search__stat">
                <span className="visual-search__stat-value">
                  {formatTime(stats.fastest)}
                </span>
                <span className="visual-search__stat-label">Fastest</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best ({difficulty}): {formatBest('visual-search', best)}
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

function Cell({ content }) {
  if (!content) return null
  if (content.kind === 'text') {
    return <span className="visual-search__text">{content.text}</span>
  }
  const style = {}
  if (content.color) style.backgroundColor = content.color
  const transform = []
  if (content.rotation) transform.push(`rotate(${content.rotation}deg)`)
  if (content.scale != null) transform.push(`scale(${content.scale})`)
  if (transform.length) style.transform = transform.join(' ')
  return (
    <div
      className={[
        'visual-search__shape',
        content.shape && `visual-search__shape--${content.shape}`,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    />
  )
}
