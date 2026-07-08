import { useCallback, useEffect, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import {
  MEMORIZE_MS_PER_FACE,
  NEXT_ROUND_DELAY_MS,
  memorizeMsFor,
  generateRound,
  evaluateRound,
} from './FaceIdentify.logic.js'
import './FaceIdentify.css'

export default function FaceIdentify() {
  const [phase, setPhase] = useState('idle') // idle | memorize | quiz | roundover | gameover
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => getBest('face-identify'))
  const [isRecord, setIsRecord] = useState(false)

  const timerRef = useRef(null)

  const beginRound = useCallback((lvl) => {
    const r = generateRound(lvl, Date.now())
    setRound(r)
    setLevel(lvl)
    setAnswers(new Array(r.faces.length).fill(null))
    setQuizIndex(0)
    setTimeLeft(memorizeMsFor(r.faces.length))
    setPhase('memorize')
  }, [])

  const startGame = useCallback(() => {
    setLevel(1)
    setScore(0)
    setIsRecord(false)
    setLastResult(null)
    feedback('start')
    beginRound(1)
  }, [beginRound])

  const nextLevel = useCallback(() => {
    beginRound(level + 1)
  }, [beginRound, level])

  useEffect(() => {
    if (phase !== 'memorize' || !round) return
    const total = memorizeMsFor(round.faces.length)
    const start = Date.now()
    setTimeLeft(total)
    timerRef.current = setInterval(() => {
      const remaining = total - (Date.now() - start)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setTimeLeft(0)
        setPhase('quiz')
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
    return () => clearInterval(timerRef.current)
  }, [phase, round])

  useEffect(() => {
    if (phase !== 'roundover') return
    const id = setTimeout(() => {
      if (lastResult?.perfect) {
        nextLevel()
      }
    }, NEXT_ROUND_DELAY_MS)
    return () => clearTimeout(id)
  }, [phase, lastResult, nextLevel])

  const handleNameClick = (name) => {
    if (phase !== 'quiz' || !round) return
    const nextAnswers = answers.slice()
    nextAnswers[round.quizOrder[quizIndex]] = name
    setAnswers(nextAnswers)

    if (quizIndex + 1 >= round.faces.length) {
      const result = evaluateRound(round, nextAnswers)
      setLastResult(result)
      const newScore = score + result.correct
      setScore(newScore)
      if (result.perfect) {
        setPhase('roundover')
        feedback('correct')
      } else {
        feedback('wrong')
        const record = saveBest('face-identify', null, newScore)
        recordResult('face-identify', newScore)
        setIsRecord(record)
        setBest(getBest('face-identify'))
        feedback('lose')
        setPhase('gameover')
      }
    } else {
      setQuizIndex((i) => i + 1)
    }
  }

  const progress =
    phase === 'memorize' && round
      ? Math.max(0, timeLeft / memorizeMsFor(round.faces.length))
      : 0
  const currentFace = round && phase === 'quiz' ? round.faces[round.quizOrder[quizIndex]] : null

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">Level {level}</span>
        <span className="game__stat">{score} faces</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('face-identify', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Face Identify</h1>
            <p className="panel__text">
              Study a group of faces and their names, then match each face to the
              right name from memory. You get {MEMORIZE_MS_PER_FACE / 1000} seconds
              per face. How many people can you remember?
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'memorize' && round && (
          <div className="face-identify__arena">
            <p className="panel__label">Memorize these faces</p>
            <div className="face-identify__grid" style={{ '--count': round.count }}>
              {round.faces.map((face) => (
                <div key={face.name} className="face-identify__card">
                  <FaceAvatar face={face} />
                  <span className="face-identify__name">{face.name}</span>
                </div>
              ))}
            </div>
            <div className="progress">
              <div className="progress__bar" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}

        {phase === 'quiz' && currentFace && round && (
          <div className="face-identify__arena">
            <p className="panel__label">
              Who is this? ({quizIndex + 1}/{round.faces.length})
            </p>
            <div className="face-identify__quiz-face">
              <FaceAvatar face={currentFace} />
            </div>
            <div className="face-identify__options">
              {round.faces.map((face) => {
                const answered = answers[round.quizOrder[quizIndex]]
                const isSelected = answered === face.name
                return (
                  <button
                    key={face.name}
                    className={[
                      'btn',
                      'face-identify__option',
                      isSelected && 'face-identify__option--selected',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleNameClick(face.name)}
                    disabled={answered !== null}
                    aria-pressed={isSelected}
                  >
                    {face.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'roundover' && lastResult && (
          <div className="panel">
            <div className="badge badge--ok">Perfect!</div>
            <p className="panel__text">
              You identified all {lastResult.total} faces. Next level: {level + 1}{' '}
              faces.
            </p>
          </div>
        )}

        {phase === 'gameover' && lastResult && round && (
          <div className="panel">
            <div className="badge badge--bad">Game Over</div>
            <p className="panel__text">
              You got {lastResult.correct} of {lastResult.total} right on level{' '}
              {level}.
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('face-identify', best)}
              </p>
            )}
            <div className="reveal">
              {round.faces.map((face, i) => {
                const given = answers[i]
                const ok = given === face.name
                return (
                  <div key={face.name} className="reveal__row">
                    <span className={ok ? 'reveal__value reveal__value--ok' : 'reveal__value reveal__value--bad'}>
                      {face.name}
                    </span>
                    <span>{ok ? '✓' : given ?? '—'}</span>
                  </div>
                )
              })}
            </div>
            <button className="btn btn--primary" onClick={startGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FaceAvatar({ face }) {
  const hairPaths = [
    // short
    'M10,40 Q10,10 50,10 Q90,10 90,40 L90,55 Q90,35 50,35 Q10,35 10,55 Z',
    // long
    'M10,45 Q5,10 50,8 Q95,10 90,45 L95,85 Q85,95 80,80 L80,50 Q50,40 20,50 L20,80 Q15,95 5,85 Z',
    // bun
    'M25,30 Q25,5 50,5 Q75,5 75,30 Q90,35 90,55 L90,60 Q90,40 50,40 Q10,40 10,60 L10,55 Q10,35 25,30 Z',
    // spiky
    'M10,55 L15,25 L30,45 L40,15 L55,40 L70,12 L80,45 L95,28 L90,55 Q90,35 50,35 Q10,35 10,55 Z',
    // bob
    'M15,45 Q10,15 50,12 Q90,15 85,45 L90,75 Q80,85 75,70 L75,50 Q50,40 25,50 L25,70 Q20,85 10,75 Z',
  ]

  const mouthPaths = [
    'M35,72 Q50,80 65,72',
    'M40,75 Q50,75 60,75',
    'M38,72 Q50,85 62,72',
  ]

  const eyeSet = [
    // round
    { left: <circle cx="36" cy="58" r="5" fill="#1f1f1f" />, right: <circle cx="64" cy="58" r="5" fill="#1f1f1f" /> },
    // oval
    { left: <ellipse cx="36" cy="58" rx="5" ry="7" fill="#1f1f1f" />, right: <ellipse cx="64" cy="58" rx="5" ry="7" fill="#1f1f1f" /> },
    // smiling
    { left: <path d="M31,58 Q36,53 41,58" stroke="#1f1f1f" strokeWidth="3" fill="none" />, right: <path d="M59,58 Q64,53 69,58" stroke="#1f1f1f" strokeWidth="3" fill="none" /> },
  ]

  const hair = hairPaths[face.hairStyle % hairPaths.length]
  const mouth = mouthPaths[face.mouthStyle % mouthPaths.length]
  const eyes = eyeSet[face.eyeStyle % eyeSet.length]
  const hasGlasses = face.accessory === 1
  const hasFreckles = face.accessory === 2
  const hasBlush = face.accessory === 3

  return (
    <svg
      className="face-identify__avatar"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Face"
    >
      <circle cx="50" cy="55" r="38" fill={face.skin} />
      <path d={hair} fill={face.hairColor} />
      {eyes.left}
      {eyes.right}
      <path d={mouth} stroke="#1f1f1f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {hasGlasses && (
        <>
          <circle cx="36" cy="58" r="9" stroke="#333" strokeWidth="2" fill="none" />
          <circle cx="64" cy="58" r="9" stroke="#333" strokeWidth="2" fill="none" />
          <line x1="45" y1="58" x2="55" y2="58" stroke="#333" strokeWidth="2" />
        </>
      )}
      {hasFreckles && (
        <>
          <circle cx="32" cy="66" r="1.2" fill="#a67c52" />
          <circle cx="38" cy="69" r="1.2" fill="#a67c52" />
          <circle cx="62" cy="69" r="1.2" fill="#a67c52" />
          <circle cx="68" cy="66" r="1.2" fill="#a67c52" />
        </>
      )}
      {hasBlush && (
        <>
          <ellipse cx="30" cy="68" rx="7" ry="4" fill="#e57373" opacity="0.35" />
          <ellipse cx="70" cy="68" rx="7" ry="4" fill="#e57373" opacity="0.35" />
        </>
      )}
    </svg>
  )
}
