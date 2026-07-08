import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import { recordResult } from '../data/calibration.js'
import { feedback } from '../lib/feedback.js'
import './PathToSafety.css'

const GRID_SIZE = 8
const INITIAL_BOMBS = 8
const BOMB_INCREMENT = 2
const LEVEL_SCORE = 100
const MOVE_BONUS_CAP = 50
const STAR_BONUS = 50
const MEMORIZE_TIME_MS = 5000

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

function key(r, c) {
  return `${r},${c}`
}

function neighbors(r, c) {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE)
}

function createGrid(level) {
  const grid = []
  const allCells = []
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = []
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = { bomb: false, start: false, end: false, star: false }
      allCells.push([r, c])
    }
  }

  shuffle(allCells)
  const bombCount = Math.min(INITIAL_BOMBS + (level - 1) * BOMB_INCREMENT, 28)
  for (let i = 0; i < bombCount; i++) {
    const [r, c] = allCells[i]
    grid[r][c].bomb = true
  }

  const freeCells = allCells.slice(bombCount)
  shuffle(freeCells)
  const [start, end, star] = freeCells

  grid[start[0]][start[1]].start = true
  grid[end[0]][end[1]].end = true
  grid[star[0]][star[1]].star = true

  return { grid, start, end, star }
}

function hasValidPath(grid, start, end) {
  const visited = new Set()
  const queue = [start]
  visited.add(key(start[0], start[1]))
  while (queue.length) {
    const [r, c] = queue.shift()
    if (r === end[0] && c === end[1]) return true
    for (const [nr, nc] of neighbors(r, c)) {
      const k = key(nr, nc)
      if (!visited.has(k) && !grid[nr][nc].bomb) {
        visited.add(k)
        queue.push([nr, nc])
      }
    }
  }
  return false
}

function generateLevel(level) {
  let result = createGrid(level)
  let attempts = 0
  while (!hasValidPath(result.grid, result.start, result.end) && attempts < 100) {
    result = createGrid(level)
    attempts++
  }
  return result
}

function isAdjacent(from, r, c) {
  const dr = Math.abs(r - from[0])
  const dc = Math.abs(c - from[1])
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

const initialLevel = generateLevel(1)

export default function PathToSafety() {
  const [phase, setPhase] = useState('idle') // idle | memorize | play | won | lost
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [grid, setGrid] = useState(initialLevel.grid)
  const [start, setStart] = useState(initialLevel.start)
  const [end, setEnd] = useState(initialLevel.end)
  const [star, setStar] = useState(initialLevel.star)
  const [current, setCurrent] = useState(initialLevel.start)
  const currentRef = useRef(initialLevel.start)
  const [path, setPath] = useState(() => new Set([key(initialLevel.start[0], initialLevel.start[1])]))
  const [starCollected, setStarCollected] = useState(false)
  const [best, setBest] = useState(() => getBest('path-to-safety'))
  const [isDragging, setIsDragging] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(0)

  const startLevel = useCallback((lvl) => {
    const { grid: g, start: s, end: e, star: st } = generateLevel(lvl)
    setGrid(g)
    setStart(s)
    setEnd(e)
    setStar(st)
    currentRef.current = s
    setCurrent(s)
    setPath(new Set([key(s[0], s[1])]))
    setStarCollected(false)
    setMoves(0)
    setMemorizeTimeLeft(MEMORIZE_TIME_MS)
    setPhase('memorize')
  }, [])

  const startGame = useCallback(() => {
    feedback('start')
    setScore(0)
    setLevel(1)
    startLevel(1)
  }, [startLevel])

  const nextLevel = useCallback(() => {
    const next = level + 1
    setLevel(next)
    startLevel(next)
  }, [level, startLevel])

  // Countdown during the memorize phase.
  useEffect(() => {
    if (phase !== 'memorize') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = MEMORIZE_TIME_MS - (Date.now() - start)
      if (remaining <= 0) {
        clearInterval(id)
        setMemorizeTimeLeft(0)
        setPhase('play')
      } else {
        setMemorizeTimeLeft(remaining)
      }
    }, 50)
    return () => clearInterval(id)
  }, [phase])

  const tryMove = useCallback(
    (r, c) => {
      if (phase !== 'play') return
      if (!isAdjacent(currentRef.current, r, c)) return

      if (grid[r][c].bomb) {
        currentRef.current = [r, c]
        setCurrent([r, c])
        setPhase('lost')
        setIsDragging(false)
        feedback('lose')
        const record = saveBest('path-to-safety', null, level)
        recordResult('path-to-safety', level)
        if (record) setBest(getBest('path-to-safety'))
        return
      }

      const newMoves = moves + 1
      setMoves(newMoves)
      setPath((prev) => {
        const next = new Set(prev)
        next.add(key(r, c))
        return next
      })
      currentRef.current = [r, c]
      setCurrent([r, c])

      if (!starCollected && r === star[0] && c === star[1]) {
        setStarCollected(true)
      }

      if (r === end[0] && c === end[1]) {
        const moveBonus = Math.max(0, MOVE_BONUS_CAP - newMoves) * level
        const starBonus = starCollected ? STAR_BONUS * level : 0
        const gained = LEVEL_SCORE * level + moveBonus + starBonus
        setScore((s) => s + gained)
        setPhase('won')
        setIsDragging(false)
        feedback('win')
        const record = saveBest('path-to-safety', null, level + 1)
        recordResult('path-to-safety', level + 1)
        if (record) setBest(getBest('path-to-safety'))
      }
    },
    [phase, grid, moves, star, end, starCollected, level],
  )

  const handleCellClick = useCallback(
    (r, c) => {
      tryMove(r, c)
    },
    [tryMove],
  )

  const getCellFromEvent = useCallback((clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY)
    if (!el) return null
    const cell = el.closest('[data-r]')
    if (!cell) return null
    const r = Number(cell.dataset.r)
    const c = Number(cell.dataset.c)
    if (Number.isNaN(r) || Number.isNaN(c)) return null
    return [r, c]
  }, [])

  const handlePointerDown = useCallback(
    (e) => {
      if (phase !== 'play') return
      const cell = getCellFromEvent(e.clientX, e.clientY)
      if (!cell) return
      const [r, c] = cell
      if (r === currentRef.current[0] && c === currentRef.current[1]) {
        setIsDragging(true)
        setDragOver([r, c])
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    },
    [phase, getCellFromEvent],
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return
      const cell = getCellFromEvent(e.clientX, e.clientY)
      if (!cell) {
        setDragOver(null)
        return
      }
      const [r, c] = cell
      if (dragOver && dragOver[0] === r && dragOver[1] === c) return
      setDragOver(cell)
      tryMove(r, c)
    },
    [isDragging, dragOver, getCellFromEvent, tryMove],
  )

  const handlePointerUp = useCallback(
    (e) => {
      if (!isDragging) return
      setIsDragging(false)
      e.currentTarget.releasePointerCapture(e.pointerId)
      setDragOver(null)
    },
    [isDragging],
  )

  const cells = useMemo(() => {
    const items = []
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = grid[r][c]
        const k = key(r, c)
        const isCurrent = current[0] === r && current[1] === c
        const onPath = path.has(k)
        const isStart = start[0] === r && start[1] === c
        const isEnd = end[0] === r && end[1] === c
        const isStar = star[0] === r && star[1] === c && !starCollected
        const showBomb =
          phase === 'memorize' ||
          ((phase === 'lost' || phase === 'won') && cell.bomb)
        const isBlocked = phase === 'play' && !isAdjacent(current, r, c)
        const isDragOver = dragOver && dragOver[0] === r && dragOver[1] === c
        const isDragTarget = isDragOver && isAdjacent(current, r, c) && !(r === current[0] && c === current[1])

        let content = null
        let modifier = ''
        if (showBomb && cell.bomb) {
          content = '💣'
          modifier = 'path-to-safety__cell--bomb'
        } else if (isCurrent) {
          content = '🚩'
          modifier = 'path-to-safety__cell--current'
        } else if (isEnd) {
          content = '🏁'
          modifier = 'path-to-safety__cell--end'
        } else if (isStart) {
          content = '🚩'
          modifier = 'path-to-safety__cell--start'
        } else if (isStar) {
          content = '⭐'
          modifier = 'path-to-safety__cell--star'
        } else if (onPath) {
          modifier = 'path-to-safety__cell--path'
        }

        items.push(
          <button
            key={k}
            data-r={r}
            data-c={c}
            className={`path-to-safety__cell ${modifier} ${isBlocked ? 'path-to-safety__cell--blocked' : ''} ${isDragTarget ? 'path-to-safety__cell--drag-target' : ''} ${isDragOver && !isDragTarget && !(r === current[0] && c === current[1]) ? 'path-to-safety__cell--drag-over' : ''}`}
            onClick={() => handleCellClick(r, c)}
            disabled={phase !== 'play' || isBlocked}
            aria-label={`cell ${r + 1},${c + 1}`}
          >
            {content}
          </button>,
        )
      }
    }
    return items
  }, [grid, current, path, start, end, star, starCollected, phase, dragOver, handleCellClick])

  const statusText = {
    idle: 'Memorize the bombs, then find the safe path from 🚩 to 🏁.',
    memorize: `Level ${level}: Memorize the bombs! Time left: ${(memorizeTimeLeft / 1000).toFixed(1)}s`,
    play: 'Click or drag the flag along the path. Avoid bombs, collect ⭐!',
    won: `Level ${level} complete! Preparing level ${level + 1}…`,
    lost: `Boom! You reached level ${level}.`,
  }[phase]

  return (
    <div className="game path-to-safety">
      <header className="game__hud">
        <span className="game__stat">Level {level}</span>
        <span className="game__stat">Score {score}</span>
        <span className="game__stat">Moves {moves}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('path-to-safety', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        <div className="panel path-to-safety__panel">
          <p className="path-to-safety__status">{statusText}</p>

          {phase === 'memorize' && (
            <div className="path-to-safety__timer">
              <div
                className="path-to-safety__timer-bar"
                style={{ width: `${(memorizeTimeLeft / MEMORIZE_TIME_MS) * 100}%` }}
              />
            </div>
          )}

          <div
            className="path-to-safety__grid"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {cells}
          </div>

          <div className="path-to-safety__controls">
            {phase === 'idle' || phase === 'lost' ? (
              <button className="btn btn--primary" onClick={startGame}>
                {phase === 'lost' ? 'Play Again' : 'Start'}
              </button>
            ) : phase === 'memorize' ? (
              <button className="btn btn--primary" onClick={() => setPhase('play')}>
                Memorized
              </button>
            ) : phase === 'won' ? (
              <button className="btn btn--primary" onClick={nextLevel}>
                Next Level
              </button>
            ) : null}
          </div>

          {phase === 'lost' && best !== null && (
            <p className="panel__text panel__text--muted">
              Best: {formatBest('path-to-safety', best)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
