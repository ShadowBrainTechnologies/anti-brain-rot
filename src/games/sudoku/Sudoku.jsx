import { useEffect, useMemo, useState } from 'react'
import { getPuzzle, primeAllPools } from './puzzlePool.js'
import { parseBoard, parseGivenMask, findConflicts, isSolved } from './board.js'
import { getBest, saveBest, formatBest } from '../../data/scores.js'
import { feedback } from '../../lib/feedback.js'
import { recordResult } from '../../data/calibration.js'
import './Sudoku.css'

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'expert', label: 'Expert' },
]

const fmtTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState('easy')
  const [values, setValues] = useState([])
  const [solution, setSolution] = useState([])
  const [given, setGiven] = useState([])
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('idle') // idle | playing | won
  const [seconds, setSeconds] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [isRecord, setIsRecord] = useState(false)
  const [best, setBest] = useState(() => getBest('sudoku', 'easy'))

  const newGame = (diff) => {
    const { puzzle, solution: solStr } = getPuzzle(diff)
    setValues(parseBoard(puzzle).flat())
    setSolution(parseBoard(solStr).flat())
    setGiven(parseGivenMask(puzzle).flat())
    setSelected(null)
    setStatus('playing')
    setSeconds(0)
    setShowErrors(false)
    setIsRecord(false)
    setBest(getBest('sudoku', diff))
    feedback('start')
  }

  const startGame = () => newGame(difficulty)

  useEffect(() => {
    primeAllPools()
  }, [])

  useEffect(() => {
    if (status !== 'playing') return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [status])

  const conflicts = useMemo(
    () => (values.length ? findConflicts(values) : []),
    [values],
  )

  const digitCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (const v of values) if (v >= 1 && v <= 9) counts[v]++
    return counts
  }, [values])

  // Win detection + save best time.
  useEffect(() => {
    if (status !== 'playing' || !values.length || !isSolved(values)) return
    setStatus('won')
    feedback('win')
    const record = saveBest('sudoku', difficulty, seconds)
    recordResult('sudoku', seconds)
    setIsRecord(record)
    setBest(getBest('sudoku', difficulty))
  }, [values, status, difficulty, seconds])

  const setValueAt = (i, val) => {
    if (given[i] || status === 'won') return
    const next = values.slice()
    next[i] = val
    setValues(next)
    if (val !== 0) {
      if (solution[i] === val) feedback('correct')
      else feedback('wrong')
    }
  }

  const onCellChange = (i, e) => {
    const raw = e.target.value
    const ch = raw.length ? raw[raw.length - 1] : ''
    if (ch >= '1' && ch <= '9') setValueAt(i, Number(ch))
    else if (ch === '' || ch === '0') setValueAt(i, 0)
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      setValueAt(i, 0)
      return
    }
    const map = {
      ArrowUp: i - 9,
      ArrowDown: i + 9,
      ArrowLeft: i - 1,
      ArrowRight: i + 1,
    }
    if (e.key in map) {
      const n = map[e.key]
      if (n >= 0 && n < 81) {
        e.preventDefault()
        setSelected(n)
        const el = document.querySelector(`[data-cell="${n}"]`)
        el?.focus()
      }
    }
  }

  const chooseDifficulty = (d) => {
    setDifficulty(d)
    setBest(getBest('sudoku', d))
    if (status === 'idle') return
    newGame(d)
  }

  const fillFromPad = (n) => {
    if (selected === null || given[selected] || status === 'won') return
    setValueAt(selected, n)
  }

  const selInfo = useMemo(() => {
    if (selected === null) return null
    const r = Math.floor(selected / 9)
    const c = selected % 9
    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3
    const selVal = values[selected] || 0
    return { r, c, br, bc, selVal }
  }, [selected, values])

  return (
    <div className="sudoku">
      {status === 'idle' ? (
        <div className="sudoku__start">
          <h1 className="sudoku__title">Sudoku</h1>
          <p className="sudoku__desc">
            Fill the 9×9 grid so every row, column, and 3×3 box contains 1–9.
            Pick a difficulty and go for a new best time.
          </p>
          <div className="sudoku__diff sudoku__diff--start" role="tablist" aria-label="Difficulty">
            {DIFFICULTIES.map((d) => {
              const b = getBest('sudoku', d.id)
              return (
                <button
                  key={d.id}
                  className={`chip ${difficulty === d.id ? 'chip--active' : ''}`}
                  onClick={() => chooseDifficulty(d.id)}
                  role="tab"
                  aria-selected={difficulty === d.id}
                >
                  {d.label}
                  {b !== null && (
                    <span className="chip__best">{formatBest('sudoku', b)}</span>
                  )}
                </button>
              )
            })}
          </div>
          <button className="btn btn--primary sudoku__start-btn" onClick={startGame}>
            Start
          </button>
        </div>
      ) : (
        <>
          <div className="sudoku__controls">
            <div className="sudoku__diff" role="tablist" aria-label="Difficulty">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={`chip ${difficulty === d.id ? 'chip--active' : ''}`}
                  onClick={() => chooseDifficulty(d.id)}
                  role="tab"
                  aria-selected={difficulty === d.id}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="sudoku__meta">
              <span className="sudoku__timer">⏱ {fmtTime(seconds)}</span>
              {best !== null && (
                <span className="sudoku__best">Best {formatBest('sudoku', best)}</span>
              )}
              <button
                className={`btn ${showErrors ? 'btn--active' : 'btn--ghost'}`}
                onClick={() => setShowErrors((v) => !v)}
                disabled={status === 'won'}
              >
                {showErrors ? 'Hide Errors' : 'Check Errors'}
              </button>
              <button className="btn btn--primary sudoku__new" onClick={() => newGame(difficulty)}>
                New Game
              </button>
            </div>
          </div>

          {status === 'won' && (
            <div className="sudoku__banner sudoku__banner--ok">
              Solved in {fmtTime(seconds)}! 🎉
              {isRecord && <span className="sudoku__record"> New Best!</span>}
              {best !== null && !isRecord && (
                <span className="sudoku__best-inline"> Best: {formatBest('sudoku', best)}</span>
              )}
            </div>
          )}

          <div className="sudoku__board" role="grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((box) => (
              <div className="sudoku__box" key={box}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => {
                  const br = Math.floor(box / 3) * 3 + Math.floor(cell / 3)
                  const bc = (box % 3) * 3 + (cell % 3)
                  const i = br * 9 + bc
                  const v = values[i]
                  const r = Math.floor(i / 9)
                  const c = i % 9
                  const isGiven = given[i]
                  const isConflict = conflicts[i]
                  const isSelected = selected === i
                  const isWrong =
                    showErrors && !isGiven && v !== 0 && solution[i] !== v
                  const isPeer =
                    selInfo &&
                    !isSelected &&
                    (selInfo.r === r ||
                      selInfo.c === c ||
                      (selInfo.br <= r &&
                        r < selInfo.br + 3 &&
                        selInfo.bc <= c &&
                        c < selInfo.bc + 3))
                  const isSame =
                    selInfo && !isSelected && selInfo.selVal !== 0 && v === selInfo.selVal

                  const classes = ['cell']
                  if (isGiven) classes.push('cell--given')
                  if (isConflict) classes.push('cell--conflict')
                  if (isPeer) classes.push('cell--peer')
                  if (isSame) classes.push('cell--same')
                  if (isSelected) classes.push('cell--sel')
                  if (isWrong) classes.push('cell--wrong')

                  return (
                    <input
                      key={i}
                      data-cell={i}
                      className={classes.join(' ')}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v === 0 ? '' : v}
                      readOnly={isGiven || status === 'won'}
                      onChange={(e) => onCellChange(i, e)}
                      onKeyDown={(e) => onKeyDown(i, e)}
                      onFocus={() => setSelected(i)}
                      aria-label={`Row ${r + 1} Column ${c + 1}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="numpad" role="group" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const count = digitCounts[n]
              const complete = count >= 9
              const disabled = complete || selected === null || status === 'won'
              return (
                <button
                  key={n}
                  className={`numpad__btn ${complete ? 'numpad__btn--done' : ''}`}
                  onClick={() => fillFromPad(n)}
                  disabled={disabled}
                  aria-label={`Place ${n}`}
                >
                  <span className="numpad__num">{n}</span>
                  <span className="numpad__count">{9 - count}</span>
                </button>
              )
            })}
          </div>

          <p className="sudoku__hint">
            Type 1–9 to fill, Backspace to clear, arrow keys to move. Tap a number
            below to fill the selected cell.
          </p>
        </>
      )}
    </div>
  )
}
