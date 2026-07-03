import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import NumberMemory from './games/NumberMemory.jsx'
import MathSpeed from './games/MathSpeed.jsx'
import ColorDeception from './games/ColorDeception.jsx'
import TapTheColor from './games/TapTheColor.jsx'
import Sudoku from './games/sudoku/Sudoku.jsx'
import PathToSafety from './games/PathToSafety.jsx'
import RPSReversal from './games/RPSReversal.jsx'
import AttentionIsAllYouNeed from './games/AttentionIsAllYouNeed.jsx'
import GridRotation from './games/GridRotation.jsx'
import FirstFailure from './games/FirstFailure.jsx'
import { DEFAULT_PATH } from './data/games.js'
import './App.css'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="shell__main">
        <header className="topbar">
          <button
            className="topbar__menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="topbar__title">{titleFor(location.pathname)}</span>
        </header>

        <main className="shell__content">
          <Routes>
            <Route path="/number-memory" element={<NumberMemory />} />
            <Route path="/math-speed" element={<MathSpeed />} />
            <Route path="/color-deception" element={<ColorDeception />} />
            <Route path="/tap-the-color" element={<TapTheColor />} />
            <Route path="/sudoku" element={<Sudoku />} />
            <Route path="/path-to-safety" element={<PathToSafety />} />
            <Route path="/rps-reversal" element={<RPSReversal />} />
            <Route path="/attention-is-all-you-need" element={<AttentionIsAllYouNeed />} />
            <Route path="/grid-rotation" element={<GridRotation />} />
            <Route path="/first-failure" element={<FirstFailure />} />
            <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function titleFor(pathname) {
  if (pathname.startsWith('/sudoku')) return 'Sudoku'
  if (pathname.startsWith('/path-to-safety')) return 'Path to Safety'
  if (pathname.startsWith('/rps-reversal')) return 'RPS Reversal'
  if (pathname.startsWith('/attention-is-all-you-need')) return 'Attention Is All You Need'
  if (pathname.startsWith('/grid-rotation')) return 'Grid Rotation'
  if (pathname.startsWith('/first-failure')) return 'First Failure'
  if (pathname.startsWith('/tap-the-color')) return 'Tap the Color'
  if (pathname.startsWith('/color-deception')) return 'Color of Deception'
  if (pathname.startsWith('/math-speed')) return 'Math Speed'
  if (pathname.startsWith('/number-memory')) return 'Number Memory'
  return 'Brain Rot'
}
