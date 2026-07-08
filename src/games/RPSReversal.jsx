import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import './RPSReversal.css'

const HANDS = ['rock', 'paper', 'scissors']
const ROUND_COUNT = 15
const TIME_PER_ROUND = 4

const HAND_META = {
  rock: { label: 'Rock', emoji: '✊' },
  paper: { label: 'Paper', emoji: '✋' },
  scissors: { label: 'Scissors', emoji: '✌️' },
}

// The hand that beats the given hand.
const TO_BEAT = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
}

// The hand that loses to the given hand.
const TO_LOSE_TO = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRound() {
  const hand = pick(HANDS)
  const mode = Math.random() < 0.5 ? 'blue' : 'red'
  return { hand, mode }
}

export default function RPSReversal() {
  const [phase, setPhase] = useState('idle') // idle | playing | feedback | finished
  const [rounds, setRounds] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND)
  const [selected, setSelected] = useState(null)
  const [wasCorrect, setWasCorrect] = useState(null)
  const [best, setBest] = useState(() => getBest('rps-reversal'))
  const [isRecord, setIsRecord] = useState(false)

  const startGame = () => {
    feedback('start')
    const rs = Array.from({ length: ROUND_COUNT }, generateRound)
    setRounds(rs)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setWasCorrect(null)
    setIsRecord(false)
    setTimeLeft(TIME_PER_ROUND)
    setPhase('playing')
  }

  const finishGame = useCallback((finalScore) => {
    const record = saveBest('rps-reversal', null, finalScore)
    recordResult('rps-reversal', finalScore)
    feedback('win')
    setIsRecord(record)
    setBest(getBest('rps-reversal'))
    setPhase('finished')
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
    (hand) => {
      if (phase !== 'playing') return
      const round = rounds[index]
      const target = round.mode === 'blue' ? TO_BEAT[round.hand] : TO_LOSE_TO[round.hand]
      const correct = hand === target
      setSelected(hand)
      setWasCorrect(correct)
      if (correct) {
        feedback('correct')
        setScore((s) => s + 1)
      } else {
        feedback('wrong')
      }
      setPhase('feedback')
      setTimeout(advance, 700)
    },
    [phase, rounds, index, advance],
  )

  const handleTimeout = useCallback(() => {
    if (phase !== 'playing') return
    setSelected(null)
    setWasCorrect(false)
    setPhase('feedback')
    setTimeout(advance, 700)
  }, [phase, advance])

  useEffect(() => {
    if (phase !== 'playing') return
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
          {Math.min(index + 1, ROUND_COUNT)}/{ROUND_COUNT}
        </span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('rps-reversal', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">RPS Reversal</h1>
            <p className="panel__text">
              A colored hand appears. <strong>Blue</strong> means you must <strong>win</strong>{' '}
              against it. <strong>Red</strong> means you must <strong>lose</strong> against it. Tap
              the correct hand before time runs out.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && round && (
          <div className="panel panel--wide">
            <div className={`rps-prompt rps-prompt--${round.mode}`}>
              <span className="rps-prompt__emoji">{HAND_META[round.hand].emoji}</span>
              <span className="rps-prompt__label">{HAND_META[round.hand].label}</span>
              <span className="rps-prompt__instruction">
                {round.mode === 'blue' ? 'Win against this' : 'Lose against this'}
              </span>
            </div>

            <div className="rps-options">
              {HANDS.map((hand) => {
                let btnClass = 'rps-option'
                if (phase === 'feedback') {
                  const target =
                    round.mode === 'blue' ? TO_BEAT[round.hand] : TO_LOSE_TO[round.hand]
                  if (hand === target) btnClass += ' rps-option--correct'
                  else if (hand === selected) btnClass += ' rps-option--wrong'
                  else btnClass += ' rps-option--faded'
                }
                return (
                  <button
                    key={hand}
                    className={btnClass}
                    onClick={() => handleClick(hand)}
                    disabled={phase === 'feedback'}
                    aria-label={HAND_META[hand].label}
                  >
                    <span className="rps-option__emoji">{HAND_META[hand].emoji}</span>
                    <span className="rps-option__label">{HAND_META[hand].label}</span>
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
                Best: {formatBest('rps-reversal', best)}
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
