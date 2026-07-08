import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import './ColorDeception.css'

const ROUND_COUNT = 10
const TIME_PER_ROUND = 10

const COLORS = [
  { name: 'Red', value: '#dc2626' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Yellow', value: '#ca8a04' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Cyan', value: '#0891b2' },
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRound() {
  const displayColors = shuffle(COLORS).slice(0, 4)
  const deceptionIndex = Math.floor(Math.random() * 4)

  const boxes = displayColors.map((color, i) => {
    if (i === deceptionIndex) {
      const textColor = pick(displayColors.filter((c) => c.name !== color.name))
      return {
        name: color.name,
        textColor: textColor.value,
        isDeception: true,
      }
    }
    return {
      name: color.name,
      textColor: color.value,
      isDeception: false,
    }
  })

  return { boxes, deceptionIndex }
}

export default function ColorDeception() {
  const [phase, setPhase] = useState('idle') // idle | playing | feedback | finished
  const [rounds, setRounds] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND)
  const [selected, setSelected] = useState(null)
  const [wasCorrect, setWasCorrect] = useState(null)
  const [best, setBest] = useState(() => getBest('color-deception'))
  const [isRecord, setIsRecord] = useState(false)

  const startGame = () => {
    const rs = Array.from({ length: ROUND_COUNT }, generateRound)
    setRounds(rs)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setWasCorrect(null)
    setIsRecord(false)
    setTimeLeft(TIME_PER_ROUND)
    setPhase('playing')
    feedback('start')
  }

  const finishGame = useCallback((finalScore) => {
    const record = saveBest('color-deception', null, finalScore)
    recordResult('color-deception', finalScore)
    setIsRecord(record)
    setBest(getBest('color-deception'))
    setPhase('finished')
    feedback('win')
  }, [])

  const advance = useCallback(() => {
    setSelected(null)
    setWasCorrect(null)
    if (index + 1 >= ROUND_COUNT) {
      finishGame(score)
    } else {
      setIndex((i) => i + 1)
      setTimeLeft(TIME_PER_ROUND)
      setPhase('playing')
    }
  }, [index, score, finishGame])

  const handleClick = useCallback(
    (boxIndex) => {
      if (phase !== 'playing') return
      const correct = rounds[index].boxes[boxIndex].isDeception
      setSelected(boxIndex)
      setWasCorrect(correct)
      if (correct) {
        setScore((s) => s + 1)
        feedback('correct')
      } else {
        feedback('wrong')
      }
      setPhase('feedback')
      setTimeout(advance, 900)
    },
    [phase, rounds, index, advance],
  )

  const handleTimeout = useCallback(() => {
    if (phase !== 'playing') return
    setSelected(null)
    setWasCorrect(false)
    feedback('wrong')
    setPhase('feedback')
    setTimeout(advance, 900)
  }, [phase, advance])

  useEffect(() => {
    if (phase !== 'playing') return
    setTimeLeft(TIME_PER_ROUND)
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, TIME_PER_ROUND - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        handleTimeout()
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, index, handleTimeout])

  const round = rounds[index]
  const progress = timeLeft / TIME_PER_ROUND

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          Q {Math.min(index + 1, ROUND_COUNT)}/{ROUND_COUNT}
        </span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('color-deception', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Color of Deception</h1>
            <p className="panel__text">
              Four color names appear. Three match the ink they are written in. One is lying.
              Click the imposter before time runs out.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && round && (
          <div className="panel panel--wide">
            <p className="panel__label">Find the mismatch</p>

            <div className="color-grid">
              {round.boxes.map((box, i) => {
                let boxClass = 'color-box'
                if (phase === 'feedback') {
                  if (box.isDeception) boxClass += ' color-box--correct'
                  else if (selected === i) boxClass += ' color-box--wrong'
                  else boxClass += ' color-box--faded'
                }
                return (
                  <button
                    key={`${box.name}-${i}`}
                    className={boxClass}
                    style={{ color: box.textColor }}
                    onClick={() => handleClick(i)}
                    disabled={phase === 'feedback'}
                  >
                    {box.name}
                  </button>
                )
              })}
            </div>

            <div className="timer">
              <div
                className={`timer__bar ${progress <= 0.25 ? 'timer__bar--urgent' : ''}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="timer__text">{Math.ceil(timeLeft)}s</p>

            {phase === 'feedback' && (
              <div className={`badge ${wasCorrect ? 'badge--ok' : 'badge--bad'}`}>
                {wasCorrect ? 'Correct!' : 'Wrong / Time’s up'}
              </div>
            )}
          </div>
        )}

        {phase === 'finished' && (
          <div className="panel">
            <div className="badge badge--ok">Finished!</div>
            <p className="panel__text">
              You scored <strong>{score}/{ROUND_COUNT}</strong>
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('color-deception', best)}
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
