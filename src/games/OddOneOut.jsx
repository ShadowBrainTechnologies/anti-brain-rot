import { useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  PUZZLE_COUNT,
  FEEDBACK_MS,
  DIFFICULTY,
  generateSession,
  SHAPE_DEFS,
  SIZE_RADIUS,
  DOT_POSITIONS,
} from './OddOneOut.logic.js'
import './OddOneOut.css'

function ObjectSVG({ object, state }) {
  const shape = SHAPE_DEFS[object.shape]
  const r = SIZE_RADIUS[object.size]
  const strokeColor = object.fill === 'filled' ? '#1f2937' : object.color
  const fillColor = object.fill === 'filled' ? object.color : 'transparent'
  const strokeDash = object.border === 'dashed' ? '6 4' : undefined

  return (
    <svg
      viewBox="0 0 100 100"
      className={['odd-object', state && `odd-object--${state}`].filter(Boolean).join(' ')}
    >
      <g transform={`rotate(${object.rotation}, 50, 50)`}>
        <path
          d={shape.path(r)}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
      {object.dotCount > 0 && (
        <g>
          {DOT_POSITIONS[object.dotCount].map(([dx, dy], i) => (
            <circle
              key={i}
              cx={50 + dx}
              cy={50 + dy}
              r="4"
              fill="#ffffff"
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}
        </g>
      )}
    </svg>
  )
}

export default function OddOneOut() {
  const [phase, setPhase] = useState('idle')
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY)
  const [puzzles, setPuzzles] = useState([])
  const [round, setRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [responseTimes, setResponseTimes] = useState([])
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [answerFeedback, setAnswerFeedback] = useState(null)
  const [best, setBest] = useState(null)
  const [isRecord, setIsRecord] = useState(false)

  const phaseRef = useRef(phase)
  const puzzlesRef = useRef(puzzles)
  const roundRef = useRef(round)
  const answerFeedbackRef = useRef(answerFeedback)
  const startTimeRef = useRef(null)
  const correctCountRef = useRef(0)
  const streakRef = useRef(0)
  const longestStreakRef = useRef(0)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    puzzlesRef.current = puzzles
  }, [puzzles])
  useEffect(() => {
    roundRef.current = round
  }, [round])
  useEffect(() => {
    answerFeedbackRef.current = answerFeedback
  }, [answerFeedback])

  useEffect(() => {
    setBest(getBest('odd-one-out', difficulty))
    setIsRecord(false)
  }, [difficulty])

  useEffect(() => {
    if (phase === 'playing') {
      startTimeRef.current = performance.now()
    }
  }, [phase, round])

  const finishGame = () => {
    const final = correctCountRef.current
    const record = saveBest('odd-one-out', difficulty, final)
    recordResult('odd-one-out', final)
    feedback('win')
    setIsRecord(record)
    setBest(getBest('odd-one-out', difficulty))
    setPhase('gameover')
  }

  const startGame = () => {
    feedback('start')
    const seed = Math.floor(Math.random() * 0x7fffffff)
    const session = generateSession(difficulty, seed, PUZZLE_COUNT)

    setPuzzles(session)
    setRound(0)
    setCorrectCount(0)
    setResponseTimes([])
    setStreak(0)
    setLongestStreak(0)
    setAnswerFeedback(null)
    setIsRecord(false)
    setBest(getBest('odd-one-out', difficulty))

    correctCountRef.current = 0
    streakRef.current = 0
    longestStreakRef.current = 0

    setPhase('playing')
  }

  const handleAnswer = (index) => {
    if (phaseRef.current !== 'playing' || answerFeedbackRef.current) return

    const puzzle = puzzlesRef.current[roundRef.current]
    const isCorrect = index === puzzle.answerIndex
    const elapsed = performance.now() - startTimeRef.current

    setResponseTimes((prev) => [...prev, elapsed])

    if (isCorrect) {
      feedback('correct')
      const nextCorrect = correctCountRef.current + 1
      correctCountRef.current = nextCorrect
      setCorrectCount(nextCorrect)

      const nextStreak = streakRef.current + 1
      streakRef.current = nextStreak
      setStreak(nextStreak)

      if (nextStreak > longestStreakRef.current) {
        longestStreakRef.current = nextStreak
        setLongestStreak(nextStreak)
      }
    } else {
      feedback('wrong')
      streakRef.current = 0
      setStreak(0)
    }

    setAnswerFeedback({ selectedIndex: index, isCorrect, answerIndex: puzzle.answerIndex })
    setPhase('feedback')
  }

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      if (phaseRef.current !== 'feedback') return
      const nextRound = roundRef.current + 1
      if (nextRound >= PUZZLE_COUNT) {
        finishGame()
      } else {
        setRound(nextRound)
        setAnswerFeedback(null)
        setPhase('playing')
      }
    }, FEEDBACK_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (phaseRef.current !== 'playing') return
      if (e.key >= '1' && e.key <= '4') {
        handleAnswer(Number(e.key) - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const puzzle = phase === 'playing' || phase === 'feedback' ? puzzles[round] : null

  const accuracy =
    responseTimes.length > 0 ? Math.round((correctCount / responseTimes.length) * 100) : 100
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="game odd-one-out">
      {phase === 'idle' && (
        <div className="game__stage">
          <div className="panel">
            <h1 className="panel__title">Odd One Out</h1>
            <p className="panel__text">
              Three objects follow a hidden rule. One breaks it. Spot the odd one out.
            </p>

            <div className="odd-one-out__difficulty">
              {Object.values(DIFFICULTY).map((d) => (
                <button
                  key={d}
                  className={[
                    'btn',
                    'odd-one-out__difficulty-btn',
                    difficulty === d && 'odd-one-out__difficulty-btn--active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setDifficulty(d)}
                  aria-pressed={difficulty === d}
                >
                  {d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            {best !== null && (
              <p className="panel__text panel__text--muted">
                Best ({difficulty}): {formatBest('odd-one-out', best)}
              </p>
            )}

            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'feedback') && puzzle && (
        <>
          <header className="odd-one-out__hud">
            <span className="game__stat">
              Puzzle {round + 1}/{PUZZLE_COUNT}
            </span>
            <span className="game__stat">Correct {correctCount}</span>
            <span className="game__stat">Streak {streak}</span>
          </header>

          <div className="odd-one-out__stage">
            <div className="odd-one-out__grid">
              {puzzle.objects.map((object, index) => {
                let state = null
                if (answerFeedback) {
                  if (index === answerFeedback.answerIndex) state = 'correct'
                  else if (index === answerFeedback.selectedIndex && !answerFeedback.isCorrect) state = 'wrong'
                }
                return (
                  <button
                    key={index}
                    className={[
                      'odd-one-out__card',
                      state && `odd-one-out__card--${state}`,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleAnswer(index)}
                    disabled={!!answerFeedback}
                    aria-label={`Object ${index + 1}`}
                  >
                    <ObjectSVG object={object} state={state} />
                  </button>
                )
              })}
            </div>

            {answerFeedback && (
              <div
                className={[
                  'odd-one-out__feedback',
                  answerFeedback.isCorrect && 'odd-one-out__feedback--correct',
                  !answerFeedback.isCorrect && 'odd-one-out__feedback--wrong',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {answerFeedback.isCorrect
                  ? 'Correct!'
                  : `Incorrect — the odd one differs in ${puzzle.ruleName}.`}
              </div>
            )}
          </div>
        </>
      )}

      {phase === 'gameover' && (
        <div className="game__stage">
          <div className="panel">
            <h1 className="panel__title">Session Complete</h1>

            <div className="odd-one-out__summary">
              <div className="odd-one-out__summary-row">
                <span>Correct</span>
                <span>
                  {correctCount}/{PUZZLE_COUNT}
                </span>
              </div>
              <div className="odd-one-out__summary-row">
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <div className="odd-one-out__summary-row">
                <span>Avg Response Time</span>
                <span>{formatTime(avgResponseTime)}</span>
              </div>
              <div className="odd-one-out__summary-row">
                <span>Longest Streak</span>
                <span>{longestStreak}</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best ({difficulty}): {formatBest('odd-one-out', best)}
              </p>
            )}

            <button className="btn btn--primary" onClick={() => setPhase('idle')}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
