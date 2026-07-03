import { useCallback, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import './FirstFailure.css'

const LEVELS = [8, 12, 16, 20, 24, 30, 36, 44, 52, 64, 80, 100]

function optimalSteps(n) {
  let steps = 0
  let bound = 1
  while (bound < n + 1) {
    bound *= 2
    steps++
  }
  return steps
}

function generateLevel(levelIndex) {
  const n = LEVELS[Math.min(levelIndex, LEVELS.length - 1)]
  // firstFailure can be 0..n (n means every box is correct)
  const firstFailure = Math.floor(Math.random() * (n + 1))
  return { n, firstFailure }
}

export default function FirstFailure() {
  const [phase, setPhase] = useState('idle') // idle | playing | solved | too-many | wrong
  const [levelIndex, setLevelIndex] = useState(0)
  const [n, setN] = useState(0)
  const [firstFailure, setFirstFailure] = useState(0)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(0)
  const [queries, setQueries] = useState(new Set())
  const [results, setResults] = useState(new Map())
  const [steps, setSteps] = useState(0)
  const [best, setBest] = useState(() => getBest('first-failure'))
  const [isRecord, setIsRecord] = useState(false)
  const [message, setMessage] = useState('')

  const startLevel = useCallback((idx) => {
    const { n: nextN, firstFailure: ff } = generateLevel(idx)
    setN(nextN)
    setFirstFailure(ff)
    setLow(0)
    setHigh(nextN)
    setQueries(new Set())
    setResults(new Map())
    setSteps(0)
    setIsRecord(false)
    setMessage('')
    setPhase('playing')
  }, [])

  const startGame = useCallback(() => {
    setLevelIndex(0)
    startLevel(0)
  }, [startLevel])

  const nextLevel = useCallback(() => {
    const next = levelIndex + 1
    setLevelIndex(next)
    startLevel(next)
  }, [levelIndex, startLevel])

  const queryBox = useCallback(
    (i) => {
      if (phase !== 'playing') return
      if (i < low || i >= high) return
      if (queries.has(i)) return

      const isPass = i < firstFailure
      setResults((prev) => new Map(prev).set(i, isPass))
      setQueries((prev) => new Set(prev).add(i))
      setSteps((s) => s + 1)

      if (isPass) {
        setLow(i + 1)
      } else {
        setHigh(i)
      }
    },
    [phase, low, high, queries, firstFailure],
  )

  const submitAnswer = useCallback(
    (answer) => {
      if (phase !== 'playing') return

      if (answer !== firstFailure) {
        const record = saveBest('first-failure', null, levelIndex + 1)
        setIsRecord(record)
        setBest(getBest('first-failure'))
        setMessage(
          firstFailure === n
            ? 'The first failure was: none — every box was correct.'
            : `The first failure was box ${firstFailure + 1}.`,
        )
        setPhase('wrong')
        return
      }

      const optimal = optimalSteps(n)
      if (steps > optimal) {
        const record = saveBest('first-failure', null, levelIndex + 1)
        setIsRecord(record)
        setBest(getBest('first-failure'))
        setMessage(
          `Correct, but you used ${steps} steps. The optimal binary-search count for ${n} boxes is ${optimal}.`,
        )
        setPhase('too-many')
        return
      }

      const record = saveBest('first-failure', null, levelIndex + 2)
      setIsRecord(record)
      setBest(getBest('first-failure'))
      setPhase('solved')
    },
    [phase, firstFailure, n, steps, levelIndex],
  )

  const recommended = low < high ? Math.floor((low + high) / 2) : -1
  const optimal = n > 0 ? optimalSteps(n) : 0
  const isComplete = levelIndex + 1 >= LEVELS.length

  return (
    <div className="game first-failure">
      <header className="game__hud">
        <span className="game__stat">Level {levelIndex + 1}</span>
        <span className="game__stat">{n} boxes</span>
        <span className="game__stat">
          {steps}/{optimal} steps
        </span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('first-failure', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel first-failure__panel">
            <h1 className="panel__title">First Failure</h1>
            <p className="panel__text">
              A row of black boxes starts with correct ones, then every box after
              the first failure is broken. Find that first failure using as few
              checks as binary search would need.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="panel first-failure__panel">
            <p className="panel__label">Binary Search Hunt</p>

            <p className="first-failure__status">
              {low === high ? (
                low === n ? (
                  <>Every box is correct. Submit your answer below.</>
                ) : (
                  <>
                    The interval is narrowed down to box{' '}
                    <strong>{low + 1}</strong>. Submit your answer below.
                  </>
                )
              ) : (
                <>
                  First failure is somewhere in boxes{' '}
                  <strong>{low + 1}</strong>–<strong>{high}</strong>{' '}
                  {high === n && "(or 'all correct')"}.
                </>
              )}
            </p>

            <div className="first-failure__boxes">
              {Array.from({ length: n }, (_, i) => {
                const queried = queries.has(i)
                const passed = queried && results.get(i)
                const failed = queried && !results.get(i)
                const candidate = low <= i && i < high
                const isRecommended = i === recommended

                let modifier = ''
                if (failed) modifier = 'first-failure__box--fail'
                else if (passed) modifier = 'first-failure__box--pass'
                else if (isRecommended) modifier = 'first-failure__box--recommended'
                else if (candidate) modifier = 'first-failure__box--candidate'
                else modifier = 'first-failure__box--excluded'

                return (
                  <button
                    key={i}
                    className={`first-failure__box ${modifier}`}
                    onClick={() => queryBox(i)}
                    disabled={!candidate || queried}
                    aria-label={`box ${i + 1}${failed ? ' failure' : passed ? ' correct' : ''}`}
                  >
                    <span className="first-failure__box-index">{i + 1}</span>
                    <span className="first-failure__box-icon" aria-hidden="true">
                      {failed ? '✕' : passed ? '✓' : '?'}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="first-failure__controls">
              <button
                className="btn btn--secondary"
                onClick={() => submitAnswer(n)}
                disabled={phase !== 'playing'}
              >
                All Correct
              </button>
              {low === high && low < n && (
                <button
                  className="btn btn--primary"
                  onClick={() => submitAnswer(low)}
                  disabled={phase !== 'playing'}
                >
                  First Failure is Box {low + 1}
                </button>
              )}
            </div>

            <p className="panel__text panel__text--muted">
              Click the highlighted middle box to halve the search space. Solve in
              ≤ {optimal} steps to advance.
            </p>
          </div>
        )}

        {phase === 'solved' && (
          <div className="panel first-failure__panel">
            <div className="badge badge--ok">Found in {steps} steps!</div>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {isComplete ? (
              <>
                <p className="panel__text">
                  You cleared every level using binary-search efficiency.
                </p>
                <button className="btn btn--primary" onClick={startGame}>
                  Play Again
                </button>
              </>
            ) : (
              <>
                <p className="panel__text">
                  Ready for level {levelIndex + 2} with {LEVELS[levelIndex + 1]} boxes.
                </p>
                <button className="btn btn--primary" onClick={nextLevel}>
                  Next Level
                </button>
              </>
            )}
          </div>
        )}

        {(phase === 'too-many' || phase === 'wrong') && (
          <div className="panel first-failure__panel">
            <div className={`badge ${phase === 'wrong' ? 'badge--bad' : 'badge--bad'}`}>
              {phase === 'wrong' ? 'Wrong Answer' : 'Too Many Steps'}
            </div>
            <p className="panel__text">{message}</p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('first-failure', best)}
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
