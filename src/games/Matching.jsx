import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import { buildDeck, isMatch } from './Matching.logic.js'
import './Matching.css'

const PAIR_COUNT = 8
const FLIP_BACK_MS = 800
const SYMBOLS = ['🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐯', '🐷']

export default function Matching() {
  const [phase, setPhase] = useState('idle')
  const [deck, setDeck] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(new Set())
  const [pairs, setPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [best, setBest] = useState(() => getBest('matching'))
  const [isRecord, setIsRecord] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const startGame = useCallback(() => {
    setDeck(buildDeck(PAIR_COUNT, SYMBOLS))
    setFlipped([])
    setMatched(new Set())
    setPairs(0)
    setMoves(0)
    setIsRecord(false)
    setBest(getBest('matching'))
    setIsBusy(false)
    setPhase('playing')
    feedback('start')
  }, [])

  const handleCardClick = useCallback(
    (index) => {
      if (phase !== 'playing' || isBusy) return
      if (flipped.includes(index) || matched.has(index)) return

      const nextFlipped = [...flipped, index]
      setFlipped(nextFlipped)

      if (nextFlipped.length < 2) return

      setMoves((m) => m + 1)
      setIsBusy(true)

      const [first, second] = nextFlipped

      if (isMatch(deck[first], deck[second])) {
        feedback('correct')
        const nextMatched = new Set(matched)
        nextMatched.add(first)
        nextMatched.add(second)
        setMatched(nextMatched)
        setPairs((p) => p + 1)
        setFlipped([])
        setIsBusy(false)

        if (nextMatched.size === deck.length) {
          feedback('win')
          const finalScore = PAIR_COUNT
          const record = saveBest('matching', null, finalScore)
          setIsRecord(record)
          setBest(getBest('matching'))
          recordResult('matching', finalScore)
          setPhase('gameover')
        }
      } else {
        feedback('wrong')
        timeoutRef.current = setTimeout(() => {
          setFlipped([])
          setIsBusy(false)
        }, FLIP_BACK_MS)
      }
    },
    [phase, isBusy, flipped, matched, deck],
  )

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          Pairs {pairs}/{PAIR_COUNT}
        </span>
        <span className="game__stat">Moves {moves}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('matching', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Matching</h1>
            <p className="panel__text">
              Flip cards two at a time to find all {PAIR_COUNT} matching pairs.
              Match every pair to win.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel panel--wide">
            <div className="mt-board">
              {deck.map((symbol, index) => {
                const isFlipped = flipped.includes(index) || matched.has(index)
                const isMatched = matched.has(index)
                return (
                  <button
                    key={index}
                    className={`mt-card ${isFlipped ? 'mt-card--flipped' : ''} ${isMatched ? 'mt-card--matched' : ''}`}
                    onClick={() => handleCardClick(index)}
                    disabled={isBusy || isFlipped}
                    aria-label={isFlipped ? `Card ${symbol}` : 'Hidden card'}
                  >
                    {isFlipped ? symbol : '?'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--ok">Board Cleared!</div>

            <div className="mt-summary">
              <div className="mt-summary__row">
                <span>Final score</span>
                <span>{pairs} pairs</span>
              </div>
              <div className="mt-summary__row">
                <span>Moves</span>
                <span>{moves}</span>
              </div>
            </div>

            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('matching', best)}
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
