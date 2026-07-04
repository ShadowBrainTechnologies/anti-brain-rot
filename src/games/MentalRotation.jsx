import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import {
  DIFFICULTY_SETTINGS,
  FEEDBACK_MS,
  SESSION_TIME_MS,
  TOTAL_PUZZLES,
  centerCells,
  generatePuzzle,
} from './MentalRotation.logic.js'
import './MentalRotation.css'

const SHAPE_SCALE = 3.2

function ShapeSvg({ cells, angle, scaleX, scaleY, className }) {
  const centered = centerCells(cells)
  return (
    <svg viewBox="-32 -32 64 64" className={className} aria-hidden="true">
      <g
        transform={`rotate(${angle}) scale(${scaleX * SHAPE_SCALE}, ${scaleY * SHAPE_SCALE})`}
      >
        {centered.map(([x, y], i) => (
          <rect
            key={i}
            x={x - 0.5}
            y={y - 0.5}
            width={1}
            height={1}
            rx={0.15}
            className="mental-rotation__block"
          />
        ))}
      </g>
    </svg>
  )
}

function formatTime(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MentalRotation() {
  const [phase, setPhase] = useState('idle')
  const [puzzleNumber, setPuzzleNumber] = useState(1)
  const [difficultyIndex, setDifficultyIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SESSION_TIME_MS)
  const [puzzle, setPuzzle] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isRecord, setIsRecord] = useState(false)
  const [best, setBest] = useState(() => getBest('mental-rotation'))

  const sessionStartRef = useRef(0)
  const puzzleStartRef = useRef(0)
  const feedbackTimerRef = useRef(null)
  const statsRef = useRef({
    score: 0,
    correctCount: 0,
    answeredCount: 0,
    totalTimeMs: 0,
    bestStreak: 0,
    puzzleNumber: 1,
  })

  const endGameFromStats = useCallback((stats) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
    const record = saveBest('mental-rotation', null, stats.score)
    setBest(getBest('mental-rotation'))
    setIsRecord(record)
    setPhase('gameover')
  }, [])

  const nextPuzzle = useCallback(
    (stats) => {
      if (stats.puzzleNumber >= TOTAL_PUZZLES) {
        endGameFromStats(stats)
        return
      }
      const newDifficulty = Math.min(2, Math.floor(stats.correctCount / 5))
      const nextP = generatePuzzle(newDifficulty)
      const newStats = { ...stats, puzzleNumber: stats.puzzleNumber + 1 }
      statsRef.current = newStats
      setDifficultyIndex(newDifficulty)
      setPuzzle(nextP)
      setPuzzleNumber(newStats.puzzleNumber)
      setSelectedIndex(null)
      setPhase('playing')
      puzzleStartRef.current = Date.now()
    },
    [endGameFromStats],
  )

  const startGame = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
    const firstPuzzle = generatePuzzle(0)
    const now = Date.now()
    sessionStartRef.current = now
    puzzleStartRef.current = now
    const resetStats = {
      score: 0,
      correctCount: 0,
      answeredCount: 0,
      totalTimeMs: 0,
      bestStreak: 0,
      puzzleNumber: 1,
    }
    statsRef.current = resetStats
    setPhase('playing')
    setPuzzleNumber(1)
    setDifficultyIndex(0)
    setScore(0)
    setCorrectCount(0)
    setAnsweredCount(0)
    setStreak(0)
    setBestStreak(0)
    setTotalTimeMs(0)
    setTimeLeft(SESSION_TIME_MS)
    setPuzzle(firstPuzzle)
    setSelectedIndex(null)
    setIsRecord(false)
  }, [])

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'feedback') return
    const id = setInterval(() => {
      const remaining = SESSION_TIME_MS - (Date.now() - sessionStartRef.current)
      if (remaining <= 0) {
        clearInterval(id)
        setTimeLeft(0)
        endGameFromStats(statsRef.current)
      } else {
        setTimeLeft(remaining)
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, endGameFromStats])

  const handleSelect = useCallback(
    (index) => {
      if (phase !== 'playing' || !puzzle) return
      const elapsed = Date.now() - puzzleStartRef.current
      const isCorrect = index === puzzle.correctIndex
      const newScore = isCorrect ? score + 1 : score
      const newCorrectCount = isCorrect ? correctCount + 1 : correctCount
      const newAnsweredCount = answeredCount + 1
      const newStreak = isCorrect ? streak + 1 : 0
      const newBestStreak = Math.max(bestStreak, newStreak)
      const newTotalTime = totalTimeMs + elapsed
      const newStats = {
        score: newScore,
        correctCount: newCorrectCount,
        answeredCount: newAnsweredCount,
        totalTimeMs: newTotalTime,
        bestStreak: newBestStreak,
        puzzleNumber,
      }
      statsRef.current = newStats
      setScore(newScore)
      setCorrectCount(newCorrectCount)
      setAnsweredCount(newAnsweredCount)
      setStreak(newStreak)
      setBestStreak(newBestStreak)
      setTotalTimeMs(newTotalTime)
      setSelectedIndex(index)
      setPhase('feedback')
      feedbackTimerRef.current = setTimeout(() => {
        nextPuzzle(newStats)
      }, FEEDBACK_MS)
    },
    [phase, puzzle, score, correctCount, answeredCount, streak, bestStreak, totalTimeMs, puzzleNumber, nextPuzzle],
  )

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
  const avgTime = answeredCount > 0 ? (totalTimeMs / answeredCount / 1000).toFixed(2) : '0.00'

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">
          Puzzle {puzzleNumber}/{TOTAL_PUZZLES}
        </span>
        <span className="game__stat">{formatTime(timeLeft)}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('mental-rotation', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Mental Rotation</h1>
            <p className="panel__text">
              You have <strong>20 puzzles</strong> or <strong>90 seconds</strong>. Pick the
              answer that shows the target shape rotated — not mirrored or changed.
            </p>
            <p className="panel__text panel__text--muted">
              Difficulty rises every 5 correct answers.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && puzzle && (
          <div className="mental-rotation__board">
            <div className="mental-rotation__target-wrap">
              <span className="panel__label">Target</span>
              <span className="mental-rotation__difficulty">
                {DIFFICULTY_SETTINGS[difficultyIndex].label}
              </span>
              <ShapeSvg
                cells={puzzle.canonical}
                angle={0}
                scaleX={1}
                scaleY={1}
                className="mental-rotation__target"
              />
            </div>

            <div className="mental-rotation__options">
              {puzzle.options.map((option, index) => {
                const isSelected = selectedIndex === index
                const isCorrect = index === puzzle.correctIndex
                const className = [
                  'mental-rotation__option',
                  isSelected && isCorrect ? 'mental-rotation__option--correct' : '',
                  isSelected && !isCorrect ? 'mental-rotation__option--incorrect' : '',
                  selectedIndex !== null && isCorrect && !isSelected
                    ? 'mental-rotation__option--revealed'
                    : '',
                  selectedIndex !== null ? 'mental-rotation__option--disabled' : '',
                ]
                  .join(' ')
                  .trim()
                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => handleSelect(index)}
                    disabled={selectedIndex !== null}
                    aria-label={`Option ${index + 1}`}
                  >
                    <ShapeSvg
                      cells={option.cells}
                      angle={option.angle}
                      scaleX={option.scaleX}
                      scaleY={option.scaleY}
                      className="mental-rotation__option-shape"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Session Complete</div>
            <div className="mental-rotation__summary">
              <div className="mental-rotation__summary-row">
                <span>Score</span>
                <span className="mental-rotation__summary-value">{score}</span>
              </div>
              <div className="mental-rotation__summary-row">
                <span>Accuracy</span>
                <span className="mental-rotation__summary-value">{accuracy}%</span>
              </div>
              <div className="mental-rotation__summary-row">
                <span>Avg response time</span>
                <span className="mental-rotation__summary-value">{avgTime}s</span>
              </div>
              <div className="mental-rotation__summary-row">
                <span>Longest streak</span>
                <span className="mental-rotation__summary-value">{bestStreak}</span>
              </div>
            </div>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('mental-rotation', best)}
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
