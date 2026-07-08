import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { feedback } from '../lib/feedback.js'
import { recordResult } from '../data/calibration.js'
import {
  DIFFICULTY_SETTINGS,
  FEEDBACK_MS,
  ROUNDS,
  evaluateRound,
  generateSession,
} from './EstimateIt.logic.js'
import './EstimateIt.css'

function formatCategoryAccuracy(stats) {
  if (!stats || stats.count === 0) return '—'
  return `${Math.round(stats.score / stats.count)}%`
}

function AngleVisual({ angle }) {
  return (
    <svg className="estimate-it__angle" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="48" className="estimate-it__angle-ring" />
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="12"
        className="estimate-it__angle-base"
      />
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="12"
        className="estimate-it__angle-arm"
        transform={`rotate(${angle} 60 60)`}
      />
    </svg>
  )
}

function LengthVisual({ length }) {
  return (
    <svg
      className="estimate-it__length-target"
      viewBox={`0 0 ${length + 4} 20`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <line
        x1="2"
        y1="10"
        x2={length + 2}
        y2="10"
        className="estimate-it__line"
      />
    </svg>
  )
}

function BarVisual({ percent, label }) {
  return (
    <div className="estimate-it__bar" aria-label={label}>
      <div className="estimate-it__bar-track">
        <div
          className="estimate-it__bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function DotsVisual({ count, rngSeed }) {
  // Generate a stable pseudo-random layout from the seed.
  const cells = []
  const cols = 10
  const rows = 8
  const totalSlots = cols * rows
  let seed = rngSeed
  for (let i = 0; i < totalSlots; i++) {
    seed = (seed * 9301 + 49297) % 233280
    const r = seed / 233280
    if (r < count / totalSlots) {
      cells.push(i)
    }
  }
  // Trim/pad to exact count deterministically.
  while (cells.length > count) cells.pop()
  let fillSeed = rngSeed + 1
  while (cells.length < count) {
    fillSeed = (fillSeed * 9301 + 49297) % 233280
    const idx = Math.floor((fillSeed / 233280) * totalSlots)
    if (!cells.includes(idx)) cells.push(idx)
  }

  return (
    <div className="estimate-it__dots" aria-hidden="true">
      {Array.from({ length: totalSlots }).map((_, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        return (
          <div
            key={i}
            className={`estimate-it__dot ${cells.includes(i) ? 'estimate-it__dot--on' : ''}`}
            style={{ gridColumn: col + 1, gridRow: row + 1 }}
          />
        )
      })}
    </div>
  )
}

function SpeedTrack({ phase, durationMs }) {
  return (
    <div className="estimate-it__track">
      <div
        className={`estimate-it__dot estimate-it__speed-dot ${phase === 'moving' ? 'estimate-it__speed-dot--moving' : ''}`}
        style={{
          transitionDuration: phase === 'moving' ? `${durationMs}ms` : '0ms',
        }}
      />
    </div>
  )
}

export default function EstimateIt() {
  const [phase, setPhase] = useState('idle')
  const [difficultyIndex, setDifficultyIndex] = useState(0)
  const [rounds, setRounds] = useState([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState(null)
  const [sessionScore, setSessionScore] = useState(0)
  const [categoryStats, setCategoryStats] = useState({})
  const [best, setBest] = useState(() => getBest('estimate-it'))
  const [isRecord, setIsRecord] = useState(false)

  // Type-specific UI state.
  const [timeStartedAt, setTimeStartedAt] = useState(null)
  const [liveElapsed, setLiveElapsed] = useState(0)
  const [quantityVisible, setQuantityVisible] = useState(true)
  const [speedPhase, setSpeedPhase] = useState('ready')

  const sessionScoreRef = useRef(0)

  const challenge = rounds[roundIndex]

  const startGame = useCallback(() => {
    const seed = Date.now()
    const session = generateSession(difficultyIndex, seed, ROUNDS)
    setRounds(session.rounds)
    setRoundIndex(0)
    setInputValue('')
    setResult(null)
    setSessionScore(0)
    sessionScoreRef.current = 0
    setCategoryStats({})
    setIsRecord(false)
    setTimeStartedAt(null)
    setLiveElapsed(0)
    setQuantityVisible(true)
    setSpeedPhase('ready')
    setPhase('playing')
    feedback('start')
  }, [difficultyIndex])

  const submitAnswer = useCallback(
    (value) => {
      if (!challenge) return
      const res = evaluateRound(challenge, value)
      if (res.score >= 60) {
        feedback('correct')
      } else {
        feedback('wrong')
      }
      setResult(res)
      setSessionScore((prev) => {
        const next = prev + res.score
        sessionScoreRef.current = next
        return next
      })
      setCategoryStats((prev) => {
        const key = challenge.category
        const stat = prev[key] || { count: 0, score: 0 }
        return {
          ...prev,
          [key]: { count: stat.count + 1, score: stat.score + res.score },
        }
      })
      setPhase('feedback')
    },
    [challenge],
  )

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      if (roundIndex + 1 >= ROUNDS) {
        const record = saveBest('estimate-it', null, sessionScoreRef.current)
        recordResult('estimate-it', sessionScoreRef.current)
        setIsRecord(record)
        setBest(getBest('estimate-it'))
        setPhase('finished')
        feedback('win')
      } else {
        setRoundIndex((i) => i + 1)
        setInputValue('')
        setResult(null)
        setTimeStartedAt(null)
        setLiveElapsed(0)
        setQuantityVisible(true)
        setSpeedPhase('ready')
        setPhase('playing')
      }
    }, FEEDBACK_MS)
    return () => clearTimeout(id)
  }, [phase, roundIndex])

  useEffect(() => {
    if (phase !== 'playing' || !challenge) return
    setInputValue('')
    setTimeStartedAt(null)
    setLiveElapsed(0)
    setQuantityVisible(true)
    setSpeedPhase('ready')
  }, [phase, challenge])

  useEffect(() => {
    if (phase !== 'playing' || challenge?.type !== 'quantity') return
    setQuantityVisible(true)
    const id = setTimeout(() => setQuantityVisible(false), challenge.displayMs)
    return () => clearTimeout(id)
  }, [phase, challenge])

  useEffect(() => {
    if (timeStartedAt === null) return
    setLiveElapsed(0)
    const id = setInterval(() => {
      setLiveElapsed(Date.now() - timeStartedAt)
    }, 50)
    return () => clearInterval(id)
  }, [timeStartedAt])

  useEffect(() => {
    if (speedPhase !== 'moving') return
    const id = setTimeout(() => setSpeedPhase('done'), challenge.durationMs)
    return () => clearTimeout(id)
  }, [speedPhase, challenge])

  const handleNumericSubmit = (e) => {
    e.preventDefault()
    if (inputValue === '') return
    const num = Number(inputValue)
    if (!Number.isFinite(num)) return
    submitAnswer(num)
  }

  const handleTimeStart = () => {
    setTimeStartedAt(Date.now())
  }

  const handleTimeStop = () => {
    if (timeStartedAt === null) return
    submitAnswer(Date.now() - timeStartedAt)
  }

  const handleSpeedStart = () => {
    setSpeedPhase('moving')
  }

  const renderInput = () => {
    if (!challenge) return null

    switch (challenge.type) {
      case 'time': {
        if (timeStartedAt === null) {
          return (
            <button type="button" className="btn btn--primary estimate-it__big-btn" onClick={handleTimeStart}>
              Start
            </button>
          )
        }
        return (
          <div className="estimate-it__time-live">
            <div className="estimate-it__live-readout">{(liveElapsed / 1000).toFixed(2)}s</div>
            <button type="button" className="btn btn--primary estimate-it__big-btn" onClick={handleTimeStop}>
              Stop
            </button>
          </div>
        )
      }
      case 'probability': {
        return (
          <div className="estimate-it__options">
            {challenge.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                className="estimate-it__option"
                onClick={() => submitAnswer(idx)}
              >
                {option.text}
              </button>
            ))}
          </div>
        )
      }
      case 'quantity': {
        if (quantityVisible) {
          return <DotsVisual count={challenge.answer} rngSeed={challenge.answer + roundIndex} />
        }
        return (
          <form className="estimate-it__form" onSubmit={handleNumericSubmit}>
            <input
              className="guess"
              type="number"
              inputMode="numeric"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="How many?"
            />
            <button type="submit" className="btn btn--primary" disabled={inputValue === ''}>
              Submit
            </button>
          </form>
        )
      }
      case 'speed': {
        if (speedPhase !== 'done') {
          return (
            <div className="estimate-it__speed">
              <SpeedTrack phase={speedPhase} durationMs={challenge.durationMs} />
              <button
                type="button"
                className="btn btn--primary estimate-it__big-btn"
                onClick={handleSpeedStart}
                disabled={speedPhase === 'moving'}
              >
                {speedPhase === 'ready' ? 'Start' : 'Moving\u2026'}
              </button>
            </div>
          )
        }
        return (
          <form className="estimate-it__form" onSubmit={handleNumericSubmit}>
            <input
              className="guess"
              type="number"
              inputMode="numeric"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Speed in px/s"
            />
            <button type="submit" className="btn btn--primary" disabled={inputValue === ''}>
              Submit
            </button>
          </form>
        )
      }
      case 'length': {
        return (
          <form className="estimate-it__form" onSubmit={handleNumericSubmit}>
            <input
              className="estimate-it__slider"
              type="range"
              min={0}
              max={challenge.max}
              step={1}
              value={inputValue === '' ? Math.round(challenge.max / 2) : Number(inputValue)}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="estimate-it__slider-value">
              {inputValue === '' ? Math.round(challenge.max / 2) : Math.round(Number(inputValue))} px
            </div>
            <button type="submit" className="btn btn--primary">
              Submit
            </button>
          </form>
        )
      }
      case 'scalar':
      case 'angle':
      case 'area':
      case 'percentage': {
        const unitLabel = challenge.unit || ''
        return (
          <form className="estimate-it__form" onSubmit={handleNumericSubmit}>
            <div className="estimate-it__input-wrap">
              <input
                className="guess"
                type="number"
                inputMode="decimal"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={unitLabel}
              />
              {unitLabel && <span className="estimate-it__unit">{unitLabel}</span>}
            </div>
            <button type="submit" className="btn btn--primary" disabled={inputValue === ''}>
              Submit
            </button>
          </form>
        )
      }
      default:
        return null
    }
  }

  const renderVisual = () => {
    if (!challenge) return null
    switch (challenge.type) {
      case 'angle':
        return <AngleVisual angle={challenge.answer} />
      case 'length':
        return <LengthVisual length={challenge.answer} />
      case 'area':
        return <BarVisual percent={challenge.answer} label={`${challenge.answer}% filled`} />
      case 'percentage':
        return <BarVisual percent={challenge.answer} label={`${challenge.answer}%`} />
      default:
        return null
    }
  }

  const categoryOrder = Object.keys(categoryStats).sort()

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {sessionScore}</span>
        <span className="game__stat">
          Round {Math.min(roundIndex + 1, ROUNDS)}/{ROUNDS}
        </span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('estimate-it', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Estimate It</h1>
            <p className="panel__text">
              Test your intuition across {ROUNDS} quick estimation challenges. No calculators —
              just your gut.
            </p>
            <p className="panel__text panel__text--muted">Choose a difficulty</p>
            <div className="estimate-it__difficulty">
              {DIFFICULTY_SETTINGS.map((d, idx) => (
                <button
                  key={d.label}
                  type="button"
                  className={`btn ${idx === difficultyIndex ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => setDifficultyIndex(idx)}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && challenge && (
          <div className="panel panel--wide">
            <span className="panel__label">{challenge.category}</span>
            <p className="estimate-it__prompt">{challenge.prompt}</p>
            {renderVisual()}
            {phase === 'playing' && renderInput()}

            {phase === 'feedback' && result && (
              <div className="estimate-it__feedback">
                <div className="estimate-it__feedback-row">
                  <span>Your estimate</span>
                  <span className="estimate-it__feedback-value">
                    {challenge.format(result.guess ?? inputValue)}
                  </span>
                </div>
                <div className="estimate-it__feedback-row">
                  <span>Actual</span>
                  <span className="estimate-it__feedback-value estimate-it__feedback-value--actual">
                    {challenge.format(challenge.answer)}
                  </span>
                </div>
                <div className="estimate-it__feedback-row">
                  <span>Error</span>
                  <span className="estimate-it__feedback-value">
                    {Math.round(result.error)}%
                  </span>
                </div>
                <div className="estimate-it__feedback-row estimate-it__feedback-row--score">
                  <span>Points</span>
                  <span className="estimate-it__feedback-value">+{result.score}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'finished' && (
          <div className="panel panel--wide">
            <div className="badge badge--ok">Finished!</div>
            <p className="panel__text">
              You scored <strong>{sessionScore}</strong> out of {ROUNDS * 100}
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('estimate-it', best)}
              </p>
            )}

            {categoryOrder.length > 0 && (
              <div className="estimate-it__summary">
                <h2 className="estimate-it__summary-title">Category Breakdown</h2>
                {categoryOrder.map((key) => {
                  const stat = categoryStats[key]
                  return (
                    <div key={key} className="estimate-it__summary-row">
                      <span>{key}</span>
                      <span className="estimate-it__summary-value">
                        {formatCategoryAccuracy(stat)}
                      </span>
                    </div>
                  )
                })}
              </div>
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
