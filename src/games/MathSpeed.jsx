import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import './MathSpeed.css'

const QUESTION_COUNT = 10
const TIME_PER_QUESTION = 15

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Build a question object: { text, answer, options }
function generateQuestion() {
  const patterns = [
    // a + b * c
    () => {
      const a = rand(1, 20)
      const b = rand(2, 9)
      const c = rand(2, 9)
      return { text: `${a} + ${b} × ${c}`, answer: a + b * c }
    },
    // a * b + c
    () => {
      const a = rand(2, 9)
      const b = rand(2, 9)
      const c = rand(1, 20)
      return { text: `${a} × ${b} + ${c}`, answer: a * b + c }
    },
    // (a + b) * c
    () => {
      const a = rand(1, 12)
      const b = rand(1, 12)
      const c = rand(2, 6)
      return { text: `(${a} + ${b}) × ${c}`, answer: (a + b) * c }
    },
    // a * (b + c)
    () => {
      const a = rand(2, 6)
      const b = rand(1, 12)
      const c = rand(1, 12)
      return { text: `${a} × (${b} + ${c})`, answer: a * (b + c) }
    },
    // a - b * c (keep non-negative)
    () => {
      const b = rand(2, 9)
      const c = rand(2, 9)
      const a = rand(b * c, b * c + 20)
      return { text: `${a} - ${b} × ${c}`, answer: a - b * c }
    },
    // a * b - c (keep non-negative)
    () => {
      const a = rand(2, 9)
      const b = rand(2, 9)
      const c = rand(1, a * b)
      return { text: `${a} × ${b} - ${c}`, answer: a * b - c }
    },
    // (a - b) * c (a >= b)
    () => {
      const b = rand(1, 12)
      const a = rand(b, b + 12)
      const c = rand(2, 6)
      return { text: `(${a} - ${b}) × ${c}`, answer: (a - b) * c }
    },
    // (a + b) / c (divisible)
    () => {
      const c = rand(2, 9)
      const sum = rand(2, 12) * c
      const a = rand(1, sum - 1)
      const b = sum - a
      return { text: `(${a} + ${b}) ÷ ${c}`, answer: sum / c }
    },
    // a * b / c (divisible)
    () => {
      const c = rand(2, 9)
      const a = rand(2, 9)
      const b = (rand(1, 12) * c) / a
      if (!Number.isInteger(b) || b < 1) return null
      return { text: `${a} × ${b} ÷ ${c}`, answer: (a * b) / c }
    },
    // a + b / c (b divisible by c)
    () => {
      const c = rand(2, 9)
      const quotient = rand(1, 12)
      const b = quotient * c
      const a = rand(1, 30)
      return { text: `${a} + ${b} ÷ ${c}`, answer: a + quotient }
    },
    // a - b / c (b divisible by c, result non-negative)
    () => {
      const c = rand(2, 9)
      const quotient = rand(1, 12)
      const b = quotient * c
      const a = rand(quotient, quotient + 30)
      return { text: `${a} - ${b} ÷ ${c}`, answer: a - quotient }
    },
  ]

  let q = null
  let attempts = 0
  while (!q && attempts < 20) {
    q = pick(patterns)()
    attempts++
  }
  if (!q) {
    // Fallback to a simple guaranteed pattern.
    const a = rand(1, 20)
    const b = rand(2, 9)
    const c = rand(2, 9)
    q = { text: `${a} + ${b} × ${c}`, answer: a + b * c }
  }

  q.options = buildOptions(q)
  return q
}

function buildOptions(q) {
  const answer = q.answer
  const wrong = new Set()

  // Common BODMAS mistake: evaluate strictly left-to-right.
  const leftToRight = evaluateLeftToRight(q.text)
  if (Number.isFinite(leftToRight) && leftToRight !== answer) {
    wrong.add(leftToRight)
  }

  // Off-by small amounts.
  const deltas = [1, 2, -1, -2, answer > 10 ? 5 : 3, answer > 10 ? -5 : -3]
  for (const d of deltas) {
    const v = answer + d
    if (v >= 0) wrong.add(v)
  }

  // Small multiples / halves as distractors.
  for (const v of [answer * 2, Math.round(answer / 2)]) {
    if (v >= 0) wrong.add(v)
  }

  wrong.delete(answer)
  const wrongArr = Array.from(wrong)
    .filter((v) => Number.isFinite(v) && Number.isInteger(v) && v >= 0)
    .sort(() => Math.random() - 0.5)

  const options = [answer, ...wrongArr.slice(0, 3)]
  return options.sort(() => Math.random() - 0.5)
}

// Naive left-to-right evaluation ignoring precedence and parentheses.
function evaluateLeftToRight(text) {
  const sanitized = text
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[()]/g, '')
  const tokens = sanitized.split(' ').filter(Boolean)
  let result = Number(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const val = Number(tokens[i + 1])
    if (op === '+') result += val
    else if (op === '-') result -= val
    else if (op === '*') result *= val
    else if (op === '/') result /= val
  }
  return result
}

export default function MathSpeed() {
  const [phase, setPhase] = useState('idle') // idle | playing | feedback | finished
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [selected, setSelected] = useState(null)
  const [wasCorrect, setWasCorrect] = useState(null)
  const [best, setBest] = useState(() => getBest('math-speed'))
  const [isRecord, setIsRecord] = useState(false)

  const startGame = () => {
    const qs = Array.from({ length: QUESTION_COUNT }, generateQuestion)
    setQuestions(qs)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setWasCorrect(null)
    setIsRecord(false)
    setTimeLeft(TIME_PER_QUESTION)
    setPhase('playing')
  }

  const finishGame = useCallback((finalScore) => {
    const record = saveBest('math-speed', null, finalScore)
    setIsRecord(record)
    setBest(getBest('math-speed'))
    setPhase('finished')
  }, [])

  const advance = useCallback(() => {
    setSelected(null)
    setWasCorrect(null)
    if (index + 1 >= QUESTION_COUNT) {
      finishGame(score)
    } else {
      setIndex((i) => i + 1)
      setTimeLeft(TIME_PER_QUESTION)
      setPhase('playing')
    }
  }, [index, score, finishGame])

  const handleAnswer = useCallback(
    (option) => {
      if (phase !== 'playing') return
      const correct = option === questions[index].answer
      setSelected(option)
      setWasCorrect(correct)
      if (correct) setScore((s) => s + 1)
      setPhase('feedback')
      setTimeout(advance, 900)
    },
    [phase, questions, index, advance],
  )

  const handleTimeout = useCallback(() => {
    if (phase !== 'playing') return
    setSelected(null)
    setWasCorrect(false)
    setPhase('feedback')
    setTimeout(advance, 900)
  }, [phase, advance])

  useEffect(() => {
    if (phase !== 'playing') return
    setTimeLeft(TIME_PER_QUESTION)
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, TIME_PER_QUESTION - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        handleTimeout()
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, index, handleTimeout])

  const question = questions[index]
  const progress = timeLeft / TIME_PER_QUESTION

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Q {Math.min(index + 1, QUESTION_COUNT)}/{QUESTION_COUNT}</span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('math-speed', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Math Speed</h1>
            <p className="panel__text">
              Solve BODMAS equations as fast as you can. You have {TIME_PER_QUESTION} seconds per
              question. {QUESTION_COUNT} questions total.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && question && (
          <div className="panel panel--wide">
            <p className="panel__label">Solve</p>
            <div className="equation">{question.text}</div>

            <div className="timer">
              <div
                className={`timer__bar ${progress <= 0.25 ? 'timer__bar--urgent' : ''}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="timer__text">{Math.ceil(timeLeft)}s</p>

            <div className="options">
              {question.options.map((opt) => {
                const isSelected = selected === opt
                const isAnswer = opt === question.answer
                let btnClass = 'option'
                if (phase === 'feedback') {
                  if (isAnswer) btnClass += ' option--correct'
                  else if (isSelected) btnClass += ' option--wrong'
                  else btnClass += ' option--faded'
                }
                return (
                  <button
                    key={opt}
                    className={btnClass}
                    onClick={() => handleAnswer(opt)}
                    disabled={phase === 'feedback'}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {phase === 'feedback' && (
              <div className={`badge ${wasCorrect ? 'badge--ok' : 'badge--bad'}`}>
                {wasCorrect ? 'Correct!' : 'Time’s up / Wrong'}
              </div>
            )}
          </div>
        )}

        {phase === 'finished' && (
          <div className="panel">
            <div className="badge badge--ok">Finished!</div>
            <p className="panel__text">
              You scored <strong>{score}/{QUESTION_COUNT}</strong>
            </p>
            {isRecord && (
              <div className="badge badge--record">New Best!</div>
            )}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('math-speed', best)}
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
