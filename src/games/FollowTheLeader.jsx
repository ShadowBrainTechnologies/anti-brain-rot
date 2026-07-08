import { useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  TILE_COUNT,
  START_LENGTH,
  GRID_SIZE,
  generateSequence,
  isCorrectSoFar,
} from './FollowTheLeader.logic.js'
import './FollowTheLeader.css'

const SHOW_MS = 500
const GAP_MS = 250
const COUNTDOWN_MS = 800

export default function FollowTheLeader() {
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(START_LENGTH)
  const [sequence, setSequence] = useState([])
  const [inputIndex, setInputIndex] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [activeTile, setActiveTile] = useState(null)
  const [tileFlash, setTileFlash] = useState(null)
  const [showing, setShowing] = useState(false)
  const [best, setBest] = useState(() => getBest('follow-the-leader'))
  const [isRecord, setIsRecord] = useState(false)

  const startGame = () => {
    setScore(0)
    setLevel(START_LENGTH)
    setSequence([])
    setInputIndex(0)
    setActiveTile(null)
    setTileFlash(null)
    setShowing(false)
    setIsRecord(false)
    feedback('start')
    setPhase('countdown')
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    let count = 3
    setCountdown(count)
    const id = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(id)
        setSequence(generateSequence(START_LENGTH))
        setInputIndex(0)
        setShowing(true)
        setPhase('playing')
      } else {
        setCountdown(count)
      }
    }, COUNTDOWN_MS)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing' || !showing || sequence.length === 0) return
    let cancelled = false

    const play = async () => {
      for (let i = 0; i < sequence.length; i++) {
        if (cancelled) break
        setActiveTile(sequence[i])
        await new Promise((resolve) => setTimeout(resolve, SHOW_MS))
        if (cancelled) break
        setActiveTile(null)
        if (i < sequence.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, GAP_MS))
        }
      }
      if (!cancelled) {
        setShowing(false)
      }
    }

    play()
    return () => {
      cancelled = true
      setActiveTile(null)
    }
  }, [phase, showing, sequence])

  const handleTileClick = (index) => {
    if (phase !== 'playing' || showing || tileFlash) return

    const nextInput = [...sequence.slice(0, inputIndex), index]
    if (!isCorrectSoFar(sequence, nextInput)) {
      setTileFlash({ index, type: 'bad' })
      setActiveTile(index)
      feedback('wrong')
      setTimeout(() => {
        const finalScore = score
        const record = saveBest('follow-the-leader', null, finalScore)
        setIsRecord(record)
        setBest(getBest('follow-the-leader'))
        recordResult('follow-the-leader', finalScore)
        feedback('lose')
        setPhase('gameover')
      }, 500)
      return
    }

    setTileFlash({ index, type: 'ok' })
    setActiveTile(index)
    const nextIndex = inputIndex + 1
    const complete = nextIndex === sequence.length
    if (complete) {
      feedback('win')
    } else {
      feedback('correct')
    }

    setTimeout(() => {
      setTileFlash(null)
      setActiveTile(null)
      if (complete) {
        const nextScore = score + 1
        const nextLevel = level + 1
        setScore(nextScore)
        setLevel(nextLevel)
        setInputIndex(0)
        setSequence(generateSequence(nextLevel))
        setShowing(true)
      } else {
        setInputIndex(nextIndex)
      }
    }, 250)
  }

  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => i)

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Level {level}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('follow-the-leader', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Follow the Leader</h1>
            <p className="panel__text">
              Watch the tiles light up, then tap them back in the same order.
              The sequence grows by one tile each round. How long can you follow
              the leader?
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="ftl-countdown">{countdown}</div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            {showing && (
              <p className="panel__label">Watch the sequence</p>
            )}
            {!showing && (
              <p className="panel__label">Repeat the sequence</p>
            )}

            <div
              className="ftl-grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {tiles.map((index) => {
                let tileClass = 'ftl-tile'
                const isActive = activeTile === index
                const flash = tileFlash?.index === index ? tileFlash.type : null

                if (flash === 'bad') {
                  tileClass += ' ftl-tile--bad'
                } else if (flash === 'ok' || isActive) {
                  tileClass += ' ftl-tile--active'
                }

                return (
                  <button
                    key={index}
                    className={tileClass}
                    onClick={() => handleTileClick(index)}
                    disabled={phase !== 'playing' || showing || Boolean(tileFlash)}
                    aria-label={`Tile ${index + 1}`}
                  />
                )
              })}
            </div>

            <p className="panel__text">
              {showing ? 'Memorize the pattern...' : `Tap tile ${inputIndex + 1} of ${sequence.length}`}
            </p>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--bad">Game Over</div>

            <div className="ftl-summary">
              <div className="ftl-summary__row">
                <span>Longest sequence</span>
                <span>{score} tiles</span>
              </div>
              <div className="ftl-summary__row">
                <span>Level reached</span>
                <span>{level}</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('follow-the-leader', best)}
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
