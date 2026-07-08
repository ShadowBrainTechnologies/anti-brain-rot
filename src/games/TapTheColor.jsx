import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import './TapTheColor.css'

const MAX_LEVEL = 10
const MEMORIZE_TIME = 10
const RECALL_TIME = 10

const COLORS = [
  { name: 'Red', value: '#dc2626' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Lime', value: '#65a30d' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Sky', value: '#0ea5e9' },
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function colorCountForLevel(lvl) {
  if (lvl <= 3) return 4
  if (lvl <= 6) return 6
  return 8
}

function gridClassForCount(count) {
  if (count <= 4) return 'color-grid--2'
  if (count <= 6) return 'color-grid--3'
  return 'color-grid--4'
}

export default function TapTheColor() {
  const [phase, setPhase] = useState('idle') // idle | memorize | recall | correct | wrong | gameover | finished
  const [level, setLevel] = useState(1)
  const [grid, setGrid] = useState([])
  const [sequence, setSequence] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [wrongIndex, setWrongIndex] = useState(null)
  const [revealed, setRevealed] = useState(new Set())
  const [best, setBest] = useState(() => getBest('tap-the-color'))
  const [isRecord, setIsRecord] = useState(false)

  const handleGameOver = useCallback(() => {
    const record = saveBest('tap-the-color', null, level)
    recordResult('tap-the-color', level)
    feedback('lose')
    setIsRecord(record)
    setBest(getBest('tap-the-color'))
    setPhase('gameover')
  }, [level])

  const startRecall = useCallback(() => {
    setRevealed(new Set())
    setPhase('recall')
    setTimeLeft(RECALL_TIME)
  }, [])

  const startLevel = useCallback((lvl) => {
    const count = colorCountForLevel(lvl)
    const roundColors = shuffle(COLORS).slice(0, count)
    const positions = shuffle([...Array(count).keys()])
    setGrid(roundColors)
    setSequence(positions)
    setCurrentStep(0)
    setWrongIndex(null)
    setRevealed(new Set())
    setLevel(lvl)
    setTimeLeft(MEMORIZE_TIME)
    setPhase('memorize')
    feedback('start')
  }, [])

  const startGame = useCallback(() => {
    setIsRecord(false)
    startLevel(1)
  }, [startLevel])

  const handleGridClick = useCallback(
    (idx) => {
      if (phase !== 'recall') return
      setRevealed((prev) => new Set(prev).add(idx))
      if (idx === sequence[currentStep]) {
        feedback('correct')
        const nextStep = currentStep + 1
        if (nextStep >= sequence.length) {
          setPhase('correct')
        } else {
          setCurrentStep(nextStep)
        }
      } else {
        feedback('wrong')
        setWrongIndex(idx)
        setPhase('wrong')
      }
    },
    [phase, sequence, currentStep],
  )

  useEffect(() => {
    if (phase !== 'memorize') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, MEMORIZE_TIME - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        startRecall()
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, startRecall])

  useEffect(() => {
    if (phase !== 'recall') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, RECALL_TIME - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        handleGameOver()
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, handleGameOver])

  useEffect(() => {
    if (phase !== 'correct') return
    const id = setTimeout(() => {
      if (level >= MAX_LEVEL) {
        const record = saveBest('tap-the-color', null, level)
        recordResult('tap-the-color', level)
        feedback('win')
        setIsRecord(record)
        setBest(getBest('tap-the-color'))
        setPhase('finished')
      } else {
        startLevel(level + 1)
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [phase, level, startLevel])

  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => {
      handleGameOver()
    }, 1200)
    return () => clearTimeout(id)
  }, [phase, handleGameOver])

  const memorizeProgress = phase === 'memorize' ? Math.max(0, timeLeft / MEMORIZE_TIME) : 0
  const recallProgress = phase === 'recall' ? Math.max(0, timeLeft / RECALL_TIME) : 0

  const isColorVisible = (i) =>
    phase === 'memorize' || phase === 'correct' || phase === 'wrong' || revealed.has(i)

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Level {level}</span>
        <span className="game__stat">{sequence.length} colors</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('tap-the-color', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Tap the Color</h1>
            <p className="panel__text">
              Memorize the colored squares. When you are ready, click{' '}
              <strong>Memorized</strong>. The colors will hide, the target order will appear at the
              top, and you must tap the squares in that order. Each tap reveals the square&apos;s
              color. The count grows every 3 levels: 4 → 6 → 8.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'memorize' || phase === 'recall' || phase === 'correct' || phase === 'wrong') && (
          <div className="panel panel--wide">
            {phase === 'memorize' && <p className="panel__label">Memorize the colors</p>}
            {phase === 'recall' && <p className="panel__label">Tap in this order</p>}
            {phase === 'correct' && <p className="panel__label">Correct!</p>}
            {phase === 'wrong' && <p className="panel__label">Wrong square</p>}

            {(phase === 'recall' || phase === 'correct' || phase === 'wrong') && (
              <div className="sequence">
                {sequence.map((pos, i) => (
                  <div
                    key={`${pos}-${i}`}
                    className={`sequence__dot ${i === currentStep && phase === 'recall' ? 'sequence__dot--active' : ''}`}
                    style={{ background: grid[pos]?.value }}
                    aria-label={`Step ${i + 1}: ${grid[pos]?.name}`}
                  />
                ))}
              </div>
            )}

            <div className={`color-grid ${gridClassForCount(grid.length)}`}>
              {grid.map((color, i) => {
                const isCorrect = phase === 'wrong' && i === sequence[currentStep]
                const isWrong = phase === 'wrong' && i === wrongIndex
                let boxClass = 'color-tile'
                if (isCorrect) boxClass += ' color-tile--correct'
                if (isWrong) boxClass += ' color-tile--wrong'

                return (
                  <button
                    key={color.name}
                    className={boxClass}
                    style={{ background: isColorVisible(i) ? color.value : undefined }}
                    onClick={() => handleGridClick(i)}
                    disabled={phase !== 'recall'}
                    aria-label={color.name}
                  />
                )
              })}
            </div>

            {phase === 'memorize' && (
              <>
                <div className="timer">
                  <div
                    className={`timer__bar ${memorizeProgress <= 0.25 ? 'timer__bar--urgent' : ''}`}
                    style={{ width: `${memorizeProgress * 100}%` }}
                  />
                </div>
                <p className="timer__text">{Math.ceil(timeLeft)}s</p>
                <button className="btn btn--primary" onClick={startRecall}>
                  Memorized
                </button>
              </>
            )}

            {phase === 'recall' && (
              <>
                <div className="timer">
                  <div
                    className={`timer__bar ${recallProgress <= 0.25 ? 'timer__bar--urgent' : ''}`}
                    style={{ width: `${recallProgress * 100}%` }}
                  />
                </div>
                <p className="timer__text">{Math.ceil(timeLeft)}s</p>
              </>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Game Over</div>
            <p className="panel__text">You reached level {level}.</p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('tap-the-color', best)}
              </p>
            )}
            <button className="btn btn--primary" onClick={startGame}>
              Play Again
            </button>
          </div>
        )}

        {phase === 'finished' && (
          <div className="panel">
            <div className="badge badge--ok">You Won!</div>
            <p className="panel__text">You completed all {MAX_LEVEL} levels.</p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('tap-the-color', best)}
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
