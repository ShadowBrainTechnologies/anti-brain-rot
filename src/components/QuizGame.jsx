import { useCallback, useMemo, useState } from 'react'
import { feedback } from '../lib/feedback.js'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { createRng } from '../lib/quiz.js'
import './QuizGame.css'

// Reusable shell for the IndiaBix question-bank games. A game supplies a pure
// `generate(rng)` that returns one MCQ question; this shell runs `rounds` of
// them, scores one point per correct answer, reveals the explanation after each
// answer, and handles best-score persistence + calibration.
//
// Props:
//   gameId       — kebab id, matches games.js / scores.js / calibration.js
//   title        — display title on the idle screen
//   instructions — one or two sentences shown before Start
//   generate     — (rng) => { prompt, options, correctIndex, explanation, topic }
//   rounds       — number of questions per session (default 10)
//   promptClass  — optional extra class on the prompt element (for game-specific
//                  formatting, e.g. monospace series). Optional.
//   renderPrompt — optional (question) => ReactNode to fully control the prompt
//                  body (e.g. Data Detective's chart). Falls back to text.
export default function QuizGame({
  gameId,
  title,
  instructions,
  generate,
  rounds = 10,
  promptClass = '',
  renderPrompt,
}) {
  const [phase, setPhase] = useState('idle')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [picked, setPicked] = useState(null) // index the player chose, or null
  const [best, setBest] = useState(() => getBest(gameId))
  const [isRecord, setIsRecord] = useState(false)

  // Fresh seed per session so questions differ run to run but a session is
  // internally reproducible.
  const nextQuestion = useCallback(() => {
    const rng = createRng((Date.now() ^ (Math.random() * 1e9)) >>> 0)
    return generate(rng)
  }, [generate])

  const start = useCallback(() => {
    setScore(0)
    setRound(0)
    setPicked(null)
    setIsRecord(false)
    setQuestion(nextQuestion())
    setPhase('playing')
    feedback('start')
  }, [nextQuestion])

  const choose = useCallback(
    (index) => {
      if (phase !== 'playing' || picked !== null) return
      setPicked(index)
      if (index === question.correctIndex) {
        setScore((s) => s + 1)
        feedback('correct')
      } else {
        feedback('wrong')
      }
    },
    [phase, picked, question],
  )

  const advance = useCallback(() => {
    const nextRound = round + 1
    if (nextRound >= rounds) {
      const finalScore = score
      const record = saveBest(gameId, null, finalScore)
      setIsRecord(record)
      setBest(getBest(gameId))
      recordResult(gameId, finalScore)
      if (finalScore > rounds / 2) feedback('win')
      else feedback('lose')
      setPhase('gameover')
      return
    }
    setRound(nextRound)
    setPicked(null)
    setQuestion(nextQuestion())
  }, [round, rounds, score, gameId, nextQuestion])

  const promptLines = useMemo(
    () => (question ? question.prompt.split('\n') : []),
    [question],
  )

  const answered = picked !== null
  const isLast = round + 1 >= rounds

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          {phase === 'playing' ? `Q ${round + 1}/${rounds}` : `${rounds} questions`}
        </span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">Best {formatBest(gameId, best)}</span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">{title}</h1>
            <p className="panel__text">{instructions}</p>
            <button className="btn btn--primary" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && question && (
          <div className="panel panel--wide quiz">
            {question.topic && <p className="panel__label">{question.topic}</p>}

            <div className={`quiz__prompt ${promptClass}`.trim()}>
              {renderPrompt
                ? renderPrompt(question)
                : promptLines.map((line, i) => <p key={i}>{line}</p>)}
            </div>

            <div className="quiz__options">
              {question.options.map((opt, i) => {
                let state = ''
                if (answered) {
                  if (i === question.correctIndex) state = 'quiz__option--correct'
                  else if (i === picked) state = 'quiz__option--wrong'
                  else state = 'quiz__option--dim'
                }
                return (
                  <button
                    key={i}
                    className={`quiz__option ${state}`.trim()}
                    onClick={() => choose(i)}
                    disabled={answered}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className="quiz__reveal">
                {question.explanation && (
                  <p className="quiz__explanation">{question.explanation}</p>
                )}
                <button className="btn btn--primary" onClick={advance}>
                  {isLast ? 'See results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="panel">
            <div className={`badge ${score > rounds / 2 ? 'badge--ok' : 'badge--bad'}`}>
              {score}/{rounds}
            </div>
            <p className="panel__text">
              You answered {score} of {rounds} correctly.
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest(gameId, best)}
              </p>
            )}
            <button className="btn btn--primary" onClick={start}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
