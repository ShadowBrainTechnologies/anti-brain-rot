import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  SESSION_SECONDS,
  randomFactors,
  buildChoices,
  isCorrect,
} from './RapidMultiplication.logic.js'
import './RapidMultiplication.css'

export default function RapidMultiplication() {
  const [phase, setPhase] = useState('idle')
  const [problem, setProblem] = useState(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS)
  const [best, setBest] = useState(() => getBest('rapid-multiplication'))
  const [isRecord, setIsRecord] = useState(false)
  const [selected, setSelected] = useState(null)
  const [wasCorrect, setWasCorrect] = useState(null)

  const scoreRef = useRef(0)
  const elapsedRef = useRef(0)
  const timerIdRef = useRef(null)
  const answerTimeoutRef = useRef(null)

  const nextProblem = useCallback(() => {
    const factors = randomFactors()
    const choices = buildChoices(factors.product)
    setProblem({ ...factors, choices })
  }, [])

  const endGame = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current)
      timerIdRef.current = null
    }
    const finalScore = scoreRef.current
    feedback('win')
    const record = saveBest('rapid-multiplication', null, finalScore)
    setIsRecord(record)
    setBest(getBest('rapid-multiplication'))
    recordResult('rapid-multiplication', finalScore)
    setPhase('gameover')
  }, [])

  const startGame = useCallback(() => {
    scoreRef.current = 0
    setScore(0)
    elapsedRef.current = 0
    setTimeLeft(SESSION_SECONDS)
    setSelected(null)
    setWasCorrect(null)
    setIsRecord(false)
    nextProblem()
    setPhase('playing')
    feedback('start')
  }, [nextProblem])

  useEffect(() => {
    if (phase !== 'playing') return
    setTimeLeft(SESSION_SECONDS)
    timerIdRef.current = setInterval(() => {
      elapsedRef.current += 1
      const remaining = SESSION_SECONDS - elapsedRef.current
      setTimeLeft(remaining)
      if (remaining <= 0) {
        endGame()
      }
    }, 1000)
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current)
        timerIdRef.current = null
      }
    }
  }, [phase, endGame])

  useEffect(() => {
    return () => {
      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current)
      }
    }
  }, [])

  const advance = useCallback(() => {
    setSelected(null)
    setWasCorrect(null)
    nextProblem()
  }, [nextProblem])

  const handleChoice = useCallback(
    (choice) => {
      if (phase !== 'playing' || selected !== null || !problem) return
      const correct = isCorrect(problem.product, choice)
      setSelected(choice)
      setWasCorrect(correct)
      if (correct) {
        scoreRef.current += 1
        setScore(scoreRef.current)
        feedback('correct')
      } else {
        feedback('wrong')
      }
      answerTimeoutRef.current = setTimeout(advance, 500)
    },
    [phase, selected, problem, advance],
  )

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Time {timeLeft}s</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('rapid-multiplication', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Rapid Multiplication</h1>
            <p className="panel__text">
              Solve as many multiplication problems as you can in {SESSION_SECONDS}{' '}
              seconds. Tap the correct answer to keep the rush going!
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && problem && (
          <div className="panel panel--wide">
            <p className="panel__label">What is</p>
            <div className="rm-problem">
              {problem.a} × {problem.b}
            </div>

            <div className="rm-choices">
              {problem.choices.map((choice) => {
                let btnClass = 'rm-choice'
                if (selected !== null) {
                  if (choice === problem.product) btnClass += ' rm-choice--correct'
                  else if (choice === selected) btnClass += ' rm-choice--wrong'
                  else btnClass += ' rm-choice--faded'
                }
                return (
                  <button
                    key={choice}
                    className={btnClass}
                    onClick={() => handleChoice(choice)}
                    disabled={selected !== null}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <div className={`badge ${wasCorrect ? 'badge--ok' : 'badge--bad'}`}>
                {wasCorrect ? 'Correct!' : 'Wrong'}
              </div>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className="badge badge--ok">Time's Up!</div>
            <p className="panel__text">
              Final score: <strong>{score}</strong>
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('rapid-multiplication', best)}
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
