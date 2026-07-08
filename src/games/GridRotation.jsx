import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import {
  ROUND_COUNT,
  MEMORIZE_TIME,
  RECALL_TIME,
  ROTATE_DURATION,
  DIRECTIONS,
  shuffle,
  pick,
  sizeForWins,
  blueCountForSize,
  rotateIndex,
  buildRotatedOrder,
  rotationLabel,
  rotationDeg,
  setsEqual,
} from './GridRotation.logic.js'
import './GridRotation.css'

export default function GridRotation() {
  const [phase, setPhase] = useState('idle') // idle | memorize | rotate | recall | feedback | finished
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [size, setSize] = useState(3)
  const [direction, setDirection] = useState('cw')
  const [original, setOriginal] = useState(new Set())
  const [expected, setExpected] = useState(new Set())
  const [rotatedOrder, setRotatedOrder] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCorrect, setIsCorrect] = useState(null)
  const [best, setBest] = useState(() => getBest('grid-rotation'))
  const [isRecord, setIsRecord] = useState(false)

  const generateRound = useCallback((roundIndex, currentScore = score) => {
    const nextSize = sizeForWins(currentScore)
    const nextBlue = blueCountForSize(nextSize)
    const nextDirection = pick(DIRECTIONS)
    const degrees = nextDirection === 'cw' ? 90 : 270
    const all = Array.from({ length: nextSize * nextSize }, (_, i) => i)
    const blues = new Set(shuffle(all).slice(0, nextBlue))
    const exp = new Set([...blues].map((i) => rotateIndex(i, nextSize, degrees)))
    setSize(nextSize)
    setDirection(nextDirection)
    setOriginal(blues)
    setExpected(exp)
    setRotatedOrder(buildRotatedOrder(nextSize, degrees))
    setSelected(new Set())
    setIsCorrect(null)
    setRound(roundIndex)
    setTimeLeft(MEMORIZE_TIME)
    setPhase('memorize')
  }, [score])

  const startGame = useCallback(() => {
    setScore(0)
    setIsRecord(false)
    feedback('start')
    generateRound(0, 0)
  }, [generateRound])

  const startRotation = useCallback(() => {
    setPhase('rotate')
  }, [])

  const startRecall = useCallback(() => {
    setPhase('recall')
    setTimeLeft(RECALL_TIME)
  }, [])

  const finishGame = useCallback((finalScore) => {
    const record = saveBest('grid-rotation', null, finalScore)
    recordResult('grid-rotation', finalScore)
    feedback('win')
    setIsRecord(record)
    setBest(getBest('grid-rotation'))
    setPhase('finished')
  }, [])

  const advance = useCallback(() => {
    if (round + 1 >= ROUND_COUNT) {
      finishGame(score)
    } else {
      generateRound(round + 1, score)
    }
  }, [round, score, finishGame, generateRound])

  const toggleSelected = useCallback(
    (index) => {
      if (phase !== 'recall') return
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(index)) next.delete(index)
        else next.add(index)
        return next
      })
    },
    [phase],
  )

  const handleSubmit = useCallback(() => {
    if (phase !== 'recall') return
    const correct = setsEqual(selected, expected)
    setIsCorrect(correct)
    if (correct) {
      setScore((s) => s + 1)
      feedback('correct')
    } else {
      feedback('wrong')
    }
    setPhase('feedback')
  }, [phase, selected, expected])

  useEffect(() => {
    if (phase !== 'memorize') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, MEMORIZE_TIME - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        startRotation()
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, startRotation])

  useEffect(() => {
    if (phase !== 'rotate') return
    const id = setTimeout(() => {
      startRecall()
    }, ROTATE_DURATION)
    return () => clearTimeout(id)
  }, [phase, startRecall])

  useEffect(() => {
    if (phase !== 'recall') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, RECALL_TIME - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        setIsCorrect(false)
        feedback('wrong')
        setPhase('feedback')
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(advance, 1400)
    return () => clearTimeout(id)
  }, [phase, advance])

  const memorizeProgress = phase === 'memorize' ? Math.max(0, timeLeft / MEMORIZE_TIME) : 0
  const recallProgress = phase === 'recall' ? Math.max(0, timeLeft / RECALL_TIME) : 0

  const isOriginalLayout = phase === 'memorize' || phase === 'rotate'
  const layout = isOriginalLayout
    ? Array.from({ length: size * size }, (_, i) => i)
    : rotatedOrder
  const gridStyle = {
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    transform: phase === 'rotate' ? `rotate(${rotationDeg(direction)}deg)` : 'rotate(0deg)',
  }

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          Q {Math.min(round + 1, ROUND_COUNT)}/{ROUND_COUNT}
        </span>
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Grid {size}×{size}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('grid-rotation', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Grid Rotation</h1>
            <p className="panel__text">
              Memorize the blue squares. The grid will then rotate slowly 90° left or right while
              the colors are hidden. After it stops, select every square that is blue in the
              rotated position. The grid grows after every 3 correct rounds: 3×3 → 4×4 → 5×5.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'memorize' || phase === 'rotate' || phase === 'recall' || phase === 'feedback') && (
          <div className="panel panel--wide">
            {phase === 'memorize' && (
              <p className="panel__label">Memorize the blue squares</p>
            )}
            {(phase === 'rotate' || phase === 'recall' || phase === 'feedback') && (
              <p className="panel__label">Rotated {rotationLabel(direction)}</p>
            )}

            <div
              className={`matrix-grid ${phase === 'rotate' ? 'matrix-grid--animate' : ''}`}
              style={gridStyle}
            >
              {layout.map((originalIndex, pos) => {
                const isExpected = expected.has(pos)
                const isSelected = selected.has(pos)
                let cellClass = 'matrix-cell'

                if (phase === 'memorize' && original.has(originalIndex)) {
                  cellClass += ' matrix-cell--blue'
                } else if (phase === 'recall' && isSelected) {
                  cellClass += ' matrix-cell--selected'
                } else if (phase === 'feedback') {
                  if (isExpected && isSelected) {
                    cellClass += ' matrix-cell--expected matrix-cell--correct'
                  } else if (isExpected && !isSelected) {
                    cellClass += ' matrix-cell--expected'
                  } else if (!isExpected && isSelected) {
                    cellClass += ' matrix-cell--wrong'
                  }
                }

                return (
                  <button
                    key={`${round}-${pos}-${originalIndex}`}
                    className={cellClass}
                    onClick={() => toggleSelected(pos)}
                    disabled={phase !== 'recall'}
                    aria-label={`Cell ${pos + 1}`}
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
                <button className="btn btn--primary" onClick={startRotation}>
                  Memorized
                </button>
              </>
            )}

            {phase === 'rotate' && (
              <p className="panel__text panel__text--muted">Rotating… colors hidden</p>
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
                <div className="matrix-actions">
                  <button
                    className="btn btn--secondary"
                    onClick={() => setSelected(new Set())}
                  >
                    Clear
                  </button>
                  <button className="btn btn--primary" onClick={handleSubmit}>
                    Submit
                  </button>
                </div>
              </>
            )}

            {phase === 'feedback' && (
              <div className={`badge ${isCorrect ? 'badge--ok' : 'badge--bad'}`}>
                {isCorrect ? 'Correct!' : 'Wrong'}
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
                Best: {formatBest('grid-rotation', best)}
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
