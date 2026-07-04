import { useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import {
  RULE_LABELS,
  DIFFICULTY,
  SESSION_SECONDS,
  optionsForRule,
  answerFor,
  pickRule,
  switchThreshold,
  generateObject,
  objectClasses,
} from './RuleSwitch.logic.js'
import './RuleSwitch.css'

const COUNTDOWN_SECONDS = 3

export default function RuleSwitch() {
  const [phase, setPhase] = useState('idle') // idle | countdown | playing | feedback | gameover
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY)
  const [rule, setRule] = useState(null)
  const [object, setObject] = useState(null)
  const [options, setOptions] = useState([])
  const [correctAnswer, setCorrectAnswer] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [ruleSwitches, setRuleSwitches] = useState(0)
  const [questionsSinceSwitch, setQuestionsSinceSwitch] = useState(0)
  const [nextSwitch, setNextSwitch] = useState(null)
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [feedback, setFeedback] = useState(null) // 'success' | 'error'
  const [answered, setAnswered] = useState(false)
  const [ruleVisible, setRuleVisible] = useState(true)
  const [switchAnim, setSwitchAnim] = useState(false)
  const [responseTimes, setResponseTimes] = useState([])
  const [best, setBest] = useState(null)
  const [isRecord, setIsRecord] = useState(false)
  const [history, setHistory] = useState([])
  const [roundStartTime, setRoundStartTime] = useState(null)

  // Refs that callbacks and effects read to avoid stale closures.
  const phaseRef = useRef(phase)
  const timeLeftRef = useRef(timeLeft)
  const scoreRef = useRef(score)
  const difficultyRef = useRef(difficulty)
  const totalRef = useRef(total)
  const correctCountRef = useRef(correctCount)
  const ruleSwitchesRef = useRef(ruleSwitches)
  const responseTimesRef = useRef(responseTimes)
  const ruleRef = useRef(rule)
  const questionsSinceSwitchRef = useRef(questionsSinceSwitch)
  const nextSwitchRef = useRef(nextSwitch)
  const historyRef = useRef(history)
  const answeredRef = useRef(answered)
  const correctAnswerRef = useRef(correctAnswer)
  const optionsRef = useRef(options)
  const roundStartTimeRef = useRef(roundStartTime)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { difficultyRef.current = difficulty }, [difficulty])
  useEffect(() => { totalRef.current = total }, [total])
  useEffect(() => { correctCountRef.current = correctCount }, [correctCount])
  useEffect(() => { ruleSwitchesRef.current = ruleSwitches }, [ruleSwitches])
  useEffect(() => { responseTimesRef.current = responseTimes }, [responseTimes])
  useEffect(() => { ruleRef.current = rule }, [rule])
  useEffect(() => { questionsSinceSwitchRef.current = questionsSinceSwitch }, [questionsSinceSwitch])
  useEffect(() => { nextSwitchRef.current = nextSwitch }, [nextSwitch])
  useEffect(() => { historyRef.current = history }, [history])
  useEffect(() => { answeredRef.current = answered }, [answered])
  useEffect(() => { correctAnswerRef.current = correctAnswer }, [correctAnswer])
  useEffect(() => { optionsRef.current = options }, [options])
  useEffect(() => { roundStartTimeRef.current = roundStartTime }, [roundStartTime])

  useEffect(() => {
    setBest(getBest('rule-switch', difficulty))
    setIsRecord(false)
  }, [difficulty])

  const endGame = () => {
    if (phaseRef.current === 'gameover') return
    const record = saveBest('rule-switch', difficultyRef.current, scoreRef.current)
    setIsRecord(record)
    setBest(getBest('rule-switch', difficultyRef.current))
    setPhase('gameover')
  }

  const startGame = () => {
    const initialRule = pickRule(difficulty, null)
    setScore(0)
    setTotal(0)
    setCorrectCount(0)
    setRuleSwitches(0)
    setQuestionsSinceSwitch(0)
    setNextSwitch(switchThreshold(difficulty))
    setResponseTimes([])
    setHistory([])
    setFeedback(null)
    setAnswered(false)
    setSelectedAnswer(null)
    setRuleVisible(true)
    setSwitchAnim(false)
    setTimeLeft(SESSION_SECONDS)
    setCountdown(COUNTDOWN_SECONDS)
    setRule(initialRule)
    setObject(null)
    setOptions(optionsForRule(initialRule))
    setCorrectAnswer(null)
    setIsRecord(false)
    setBest(getBest('rule-switch', difficulty))
    setPhase('countdown')
  }

  const startRound = (isFirst = false) => {
    if (phaseRef.current !== 'playing') return

    let nextRule = ruleRef.current
    let switched = false

    if (!isFirst && questionsSinceSwitchRef.current >= nextSwitchRef.current) {
      nextRule = pickRule(difficultyRef.current, nextRule)
      switched = true
      setRule(nextRule)
      setRuleSwitches((s) => s + 1)
      setQuestionsSinceSwitch(0)
      setNextSwitch(switchThreshold(difficultyRef.current))
      if (difficultyRef.current !== DIFFICULTY.HARD) {
        setSwitchAnim(true)
        setTimeout(() => setSwitchAnim(false), 900)
      }
    }

    const nextObject = generateObject(historyRef.current)
    const nextOptions = optionsForRule(nextRule)
    const nextAnswer = answerFor(nextObject, nextRule)

    setObject(nextObject)
    setHistory((prev) => {
      const nextHistory = [...prev, nextObject]
      if (nextHistory.length > 2) nextHistory.shift()
      return nextHistory
    })
    setOptions(nextOptions)
    setCorrectAnswer(nextAnswer)
    setSelectedAnswer(null)
    setAnswered(false)
    setFeedback(null)
    setRuleVisible(true)

    if (difficultyRef.current === DIFFICULTY.HARD) {
      setTimeout(() => {
        if (phaseRef.current === 'playing') setRuleVisible(false)
      }, 2000)
    }

    const animDelay = switched && difficultyRef.current !== DIFFICULTY.HARD ? 900 : 0
    setTimeout(() => {
      if (phaseRef.current === 'playing') {
        setRoundStartTime(performance.now())
      }
    }, animDelay)
  }

  const handleAnswer = (label) => {
    if (phaseRef.current !== 'playing' || answeredRef.current) return
    setAnswered(true)
    setSelectedAnswer(label)
    setTotal((t) => t + 1)
    setResponseTimes((prev) => [
      ...prev,
      performance.now() - roundStartTimeRef.current,
    ])

    const isCorrect = label === correctAnswerRef.current
    if (isCorrect) {
      setScore((s) => s + 1)
      setCorrectCount((c) => c + 1)
      setFeedback('success')
    } else {
      setFeedback('error')
    }
    setQuestionsSinceSwitch((q) => q + 1)
    setPhase('feedback')
  }

  // Countdown before the timed session begins.
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('playing')
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 800)
    return () => clearTimeout(id)
  }, [phase, countdown])

  // Start the first round once the countdown finishes.
  useEffect(() => {
    if (phase !== 'playing' || object !== null) return
    startRound(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, object])

  // Session timer.
  useEffect(() => {
    if (phaseRef.current !== 'playing' && phaseRef.current !== 'feedback') return
    const id = setInterval(() => {
      const next = Math.max(0, timeLeftRef.current - 0.1)
      timeLeftRef.current = next
      setTimeLeft(next)
      if (next <= 0) {
        clearInterval(id)
        endGame()
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Move to the next round after feedback.
  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      if (timeLeftRef.current <= 0) {
        endGame()
      } else {
        setPhase('playing')
        startRound()
      }
    }, 500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Keyboard support: 1-4 map to the visible answer buttons.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (phaseRef.current !== 'playing') return
      if (e.key >= '1' && e.key <= '4') {
        const index = Number(e.key) - 1
        const opts = optionsRef.current
        if (index < opts.length) {
          handleAnswer(opts[index])
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="game">
      {phase === 'idle' && (
        <div className="panel">
          <h1 className="panel__title">Rule Switch</h1>
          <p className="panel__text">
            Train cognitive flexibility. Sort each object by the active rule, and
            stay ready — the rule will change without warning.
          </p>

          <div className="rule-switch__difficulty">
            {Object.values(DIFFICULTY).map((d) => (
              <button
                key={d}
                className={[
                  'btn',
                  'rule-switch__difficulty-btn',
                  difficulty === d && 'rule-switch__difficulty-btn--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
              >
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          {best !== null && (
            <p className="panel__text panel__text--muted">
              Best ({difficulty}): {formatBest('rule-switch', best)}
            </p>
          )}

          <button className="btn btn--primary" onClick={startGame}>
            Start
          </button>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="panel">
          <p className="panel__label">Get ready</p>
          <div className="reverse-countdown">{countdown || 'Go!'}</div>
        </div>
      )}

      {(phase === 'playing' || phase === 'feedback') && (
        <>
          <header className="rule-switch__hud">
            <div className="rule-switch__hud-left">
              <span
                className={[
                  'rule-banner',
                  !ruleVisible && 'rule-banner--hidden',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {rule ? RULE_LABELS[rule] : ''}
              </span>
            </div>
            <div className="rule-switch__hud-right">
              <span className="game__stat">Score {score}</span>
              <span className="game__stat rule-switch__timer">
                {timeLeft.toFixed(1)}s
              </span>
            </div>
          </header>

          <div className="rule-switch__stage">
            {switchAnim && (
              <div className="rule-switch__switch-anim">
                <span>Rule Changed!</span>
              </div>
            )}

            <div className="rule-object">
              {object && (
                <div
                  className={objectClasses(object)}
                  aria-label={`A ${object.size} ${object.color} ${object.shape}`}
                />
              )}
            </div>

            <div
              className={[
                'rule-options',
                options.length === 2 && 'rule-options--2',
                options.length === 4 && 'rule-options--4',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {options.map((label, index) => {
                let className = 'btn rule-option'
                if (answered) {
                  if (label === correctAnswer) className += ' rule-option--correct'
                  if (label === selectedAnswer && feedback === 'error') {
                    className += ' rule-option--error'
                  }
                }
                return (
                  <button
                    key={label}
                    className={className}
                    onClick={() => handleAnswer(label)}
                    disabled={answered}
                    aria-label={`Answer ${index + 1}: ${label}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div
              className={[
                'rule-switch__feedback',
                feedback === 'success' && 'rule-switch__feedback--success',
                feedback === 'error' && 'rule-switch__feedback--error',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {feedback === 'success' && 'Correct!'}
              {feedback === 'error' && `Incorrect — it was ${correctAnswer}`}
            </div>
          </div>
        </>
      )}

      {phase === 'gameover' && (
        <div className="panel">
          <div className="badge badge--bad">Time's Up</div>

          <div className="rule-switch__summary">
            <div className="rule-switch__summary-row">
              <span>Final Score</span>
              <span>{score}</span>
            </div>
            <div className="rule-switch__summary-row">
              <span>Accuracy</span>
              <span>{accuracy}%</span>
            </div>
            <div className="rule-switch__summary-row">
              <span>Avg Response Time</span>
              <span>{formatTime(avgResponseTime)}</span>
            </div>
            <div className="rule-switch__summary-row">
              <span>Rule Switches</span>
              <span>{ruleSwitches}</span>
            </div>
          </div>

          {isRecord && <div className="badge badge--record">New Best!</div>}
          {best !== null && !isRecord && (
            <p className="panel__text panel__text--muted">
              Best ({difficulty}): {formatBest('rule-switch', best)}
            </p>
          )}

          <button className="btn btn--primary" onClick={() => setPhase('idle')}>
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
