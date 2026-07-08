import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  TOTAL_TRIALS,
  FIXATION_MS,
  FEEDBACK_MS,
  COUNTDOWN_SECONDS,
  DIFFICULTY_LEVELS,
  generateTrials,
  scoreTrial,
  computeStats,
} from './GoNoGo.logic.js'
import './GoNoGo.css'

export default function GoNoGo() {
  const [phase, setPhase] = useState('idle')
  const [trials, setTrials] = useState([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [countdownLeft, setCountdownLeft] = useState(COUNTDOWN_SECONDS)
  const [liveScore, setLiveScore] = useState(0)
  const [lastOutcome, setLastOutcome] = useState(null)
  const [stats, setStats] = useState(null)
  const [best, setBest] = useState(() => getBest('go-no-go'))
  const [isRecord, setIsRecord] = useState(false)

  const resultsRef = useRef([])
  const tappedRef = useRef(false)
  const stimulusStartRef = useRef(0)
  const liveScoreRef = useRef(0)

  const trial = trials[trialIndex]

  const startGame = useCallback(() => {
    feedback('start')
    const seed = Date.now()
    const newTrials = generateTrials(seed)
    setTrials(newTrials)
    setTrialIndex(0)
    setLiveScore(0)
    liveScoreRef.current = 0
    setLastOutcome(null)
    setStats(null)
    setIsRecord(false)
    resultsRef.current = []
    tappedRef.current = false
    setCountdownLeft(COUNTDOWN_SECONDS)
    setPhase('countdown')
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = COUNTDOWN_SECONDS - Math.floor(elapsed / 1000)
      if (remaining <= 0) {
        clearInterval(id)
        setPhase('fixation')
      } else {
        setCountdownLeft(remaining)
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'fixation') return
    tappedRef.current = false
    const id = setTimeout(() => {
      stimulusStartRef.current = performance.now()
      setPhase('stimulus')
    }, FIXATION_MS)
    return () => clearTimeout(id)
  }, [phase, trialIndex])

  const finishTrial = useCallback(
    (tapped, reactionMs) => {
      if (!trial) return
      const result = scoreTrial(trial, tapped, reactionMs)
      const entry = {
        trialType: trial.type,
        outcome: result.outcome,
        delta: result.delta,
        reactionMs: result.reactionMs,
      }
      resultsRef.current.push(entry)
      const newScore = liveScoreRef.current + result.delta
      liveScoreRef.current = newScore
      setLiveScore(newScore)
      setLastOutcome(result.outcome)
      if (result.outcome === 'hit' || result.outcome === 'correctReject') {
        feedback('correct')
      } else {
        feedback('wrong')
      }
      setPhase('feedback')
    },
    [trial],
  )

  useEffect(() => {
    if (phase !== 'stimulus' || !trial) return
    const id = setTimeout(() => {
      finishTrial(false, null)
    }, trial.stimulusMs)
    return () => clearTimeout(id)
  }, [phase, trial, finishTrial])

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      if (trialIndex + 1 >= TOTAL_TRIALS) {
        const finalStats = computeStats(resultsRef.current)
        setStats(finalStats)
        const record = saveBest('go-no-go', null, finalStats.score)
        recordResult('go-no-go', finalStats.score)
        feedback('win')
        setIsRecord(record)
        setBest(getBest('go-no-go'))
        setPhase('finished')
      } else {
        setTrialIndex((i) => i + 1)
        setLastOutcome(null)
        tappedRef.current = false
        setPhase('fixation')
      }
    }, FEEDBACK_MS)
    return () => clearTimeout(id)
  }, [phase, trialIndex])

  const handleTap = useCallback(() => {
    if (phase !== 'stimulus' || tappedRef.current) return
    tappedRef.current = true
    const reactionMs = Math.round(performance.now() - stimulusStartRef.current)
    finishTrial(true, reactionMs)
  }, [phase, finishTrial])

  const difficultyLabel = trial ? DIFFICULTY_LEVELS[trial.difficultyIndex].label : ''
  const stimSize = trial ? DIFFICULTY_LEVELS[trial.difficultyIndex].size : 'large'

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Score {liveScore}</span>
        <span className="game__stat">
          Trial {Math.min(trialIndex + 1, TOTAL_TRIALS)}/{TOTAL_TRIALS}
        </span>
        {phase !== 'idle' && phase !== 'finished' && (
          <span className="game__stat">{difficultyLabel}</span>
        )}
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('go-no-go', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Go / No-Go</h1>
            <p className="panel__text">
              Tap when you see a <strong className="gng-go-text">green circle</strong>.
              Do <strong>not</strong> tap when you see a <strong className="gng-nogo-text">red circle</strong>.
            </p>
            <p className="panel__text panel__text--muted">
              {TOTAL_TRIALS} trials across 3 difficulty levels. Stay sharp.
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="panel">
            <p className="panel__label">Get ready</p>
            <div className="gng-countdown">{countdownLeft}</div>
          </div>
        )}

        {phase === 'fixation' && (
          <div className="gng-arena" onPointerDown={handleTap}>
            <div className="gng-fixation" />
          </div>
        )}

        {phase === 'stimulus' && trial && (
          <div className="gng-arena" onPointerDown={handleTap}>
            <div
              className={`gng-stimulus gng-stimulus--${trial.type} gng-stimulus--${stimSize}`}
            />
          </div>
        )}

        {phase === 'feedback' && (
          <div className="gng-arena">
            <div
              className={`gng-feedback gng-feedback--${lastOutcome}`}
            >
              {lastOutcome === 'hit' && '+1'}
              {lastOutcome === 'correctReject' && '+1'}
              {lastOutcome === 'falseAlarm' && '-1'}
              {lastOutcome === 'miss' && 'Miss'}
            </div>
          </div>
        )}

        {phase === 'finished' && stats && (
          <div className="panel">
            <h1 className="panel__title">Results</h1>
            <div className="gng-stats">
              <div className="gng-stat">
                <span className="gng-stat__value">{stats.score}</span>
                <span className="gng-stat__label">Score</span>
              </div>
              <div className="gng-stat">
                <span className="gng-stat__value">{stats.accuracy}%</span>
                <span className="gng-stat__label">Accuracy</span>
              </div>
              <div className="gng-stat">
                <span className="gng-stat__value">{stats.goAccuracy}%</span>
                <span className="gng-stat__label">Go Accuracy</span>
              </div>
              <div className="gng-stat">
                <span className="gng-stat__value">{stats.nogoAccuracy}%</span>
                <span className="gng-stat__label">No-Go Accuracy</span>
              </div>
              <div className="gng-stat">
                <span className="gng-stat__value">
                  {stats.avgReactionMs != null ? `${stats.avgReactionMs}ms` : '\u2014'}
                </span>
                <span className="gng-stat__label">Avg Reaction</span>
              </div>
            </div>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('go-no-go', best)}
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
