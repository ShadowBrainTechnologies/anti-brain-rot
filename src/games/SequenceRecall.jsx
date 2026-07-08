import { useEffect, useState } from 'react'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import {
  START_LENGTH,
  GRID_SIZE,
  highlightMsFor,
  gapMsFor,
  generateSequence,
  highestSequenceLength,
} from './SequenceRecall.logic.js'
import './SequenceRecall.css'

export default function SequenceRecall() {
  const [phase, setPhase] = useState('idle') // idle | countdown | show | input | roundResult | gameover
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [activeTile, setActiveTile] = useState(null)
  const [tileFlash, setTileFlash] = useState(null) // { index, type: 'ok' | 'bad' }
  const [countdown, setCountdown] = useState(0)
  const [roundsCompleted, setRoundsCompleted] = useState(0)
  const [correctTaps, setCorrectTaps] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const [best, setBest] = useState(() => getBest('sequence-recall'))
  const [isRecord, setIsRecord] = useState(false)

  const currentLength = START_LENGTH + level - 1

  const startRound = (nextLevel) => {
    feedback('start')
    setLevel(nextLevel)
    setSequence(generateSequence(START_LENGTH + nextLevel - 1))
    setPlayerIndex(0)
    setActiveTile(null)
    setTileFlash(null)
    setCountdown(3)
    setPhase('countdown')
  }

  const startGame = () => {
    setRoundsCompleted(0)
    setCorrectTaps(0)
    setTotalTaps(0)
    setIsRecord(false)
    startRound(1)
  }

  const endGame = () => {
    const record = saveBest(
      'sequence-recall',
      null,
      highestSequenceLength(roundsCompleted),
    )
    recordResult('sequence-recall', highestSequenceLength(roundsCompleted))
    feedback('lose')
    setIsRecord(record)
    setBest(getBest('sequence-recall'))
    setPhase('gameover')
  }

  // Countdown before showing the sequence.
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('show')
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 800)
    return () => clearTimeout(id)
  }, [phase, countdown])

  // Play the sequence one tile at a time.
  useEffect(() => {
    if (phase !== 'show') return
    let cancelled = false

    const play = async () => {
      for (let i = 0; i < sequence.length; i++) {
        if (cancelled) break
        setActiveTile(sequence[i])
        await new Promise((resolve) =>
          setTimeout(resolve, highlightMsFor(level)),
        )
        if (cancelled) break
        setActiveTile(null)
        if (i < sequence.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, gapMsFor(level)))
        }
      }
      if (!cancelled) {
        setPhase('input')
      }
    }

    play()
    return () => {
      cancelled = true
      setActiveTile(null)
    }
  }, [phase, sequence, level])

  // Advance to the next round after a successful completion.
  useEffect(() => {
    if (phase !== 'roundResult') return
    const id = setTimeout(() => {
      setRoundsCompleted((r) => r + 1)
      startRound(level + 1)
    }, 700)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, level])

  const handleTileClick = (index) => {
    if (phase !== 'input' || tileFlash) return

    setTotalTaps((t) => t + 1)

    if (index === sequence[playerIndex]) {
      feedback('correct')
      setCorrectTaps((t) => t + 1)
      setTileFlash({ index, type: 'ok' })
      setActiveTile(index)

      setTimeout(() => {
        setTileFlash(null)
        setActiveTile(null)
        setPlayerIndex((prev) => {
          const next = prev + 1
          if (next >= sequence.length) {
            setPhase('roundResult')
          }
          return next
        })
      }, 250)
    } else {
      feedback('wrong')
      setTileFlash({ index, type: 'bad' })
      setActiveTile(index)
      setTimeout(() => endGame(), 500)
    }
  }

  const accuracy =
    totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 100

  const tiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i)

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Level {level}</span>
        <span className="game__stat">{currentLength} tiles</span>
        <span className="game__stat">Rounds {roundsCompleted}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('sequence-recall', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Sequence Recall</h1>
            <p className="panel__text">
              Watch the grid. A sequence of tiles will light up. Tap them back
              in the same order. Each round adds one more tile and speeds up
              slightly.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="sequence-countdown">{countdown || 'Go!'}</div>
          </div>
        )}

        {(phase === 'show' || phase === 'input' || phase === 'roundResult') && (
          <div className="panel panel--wide">
            {phase === 'show' && (
              <p className="panel__label">Watch the sequence</p>
            )}
            {phase === 'input' && (
              <p className="panel__label">Repeat the sequence</p>
            )}
            {phase === 'roundResult' && (
              <div className="badge badge--ok">Round complete!</div>
            )}

            <div
              className="sequence-grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {tiles.map((index) => {
                let tileClass = 'sequence-tile'
                const isActive = activeTile === index
                const flash = tileFlash?.index === index ? tileFlash.type : null

                if (flash === 'bad') {
                  tileClass += ' sequence-tile--bad'
                } else if (flash === 'ok' || isActive) {
                  tileClass += ' sequence-tile--active'
                }

                return (
                  <button
                    key={index}
                    className={tileClass}
                    onClick={() => handleTileClick(index)}
                    disabled={phase !== 'input' || Boolean(tileFlash)}
                    aria-label={`Tile ${index + 1}`}
                  />
                )
              })}
            </div>

            <div className="sequence-stats">
              <span>Correct: {correctTaps}</span>
              <span>Accuracy: {accuracy}%</span>
              <span>Taps: {totalTaps}</span>
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Game Over</div>

            <div className="sequence-summary">
              <div className="sequence-summary__row">
                <span>Longest sequence</span>
                <span>{highestSequenceLength(roundsCompleted)} tiles</span>
              </div>
              <div className="sequence-summary__row">
                <span>Total correct taps</span>
                <span>{correctTaps}</span>
              </div>
              <div className="sequence-summary__row">
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <div className="sequence-summary__row">
                <span>Rounds completed</span>
                <span>{roundsCompleted}</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('sequence-recall', best)}
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
