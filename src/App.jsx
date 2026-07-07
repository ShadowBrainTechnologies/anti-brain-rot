import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './pages/HomePage.jsx'
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
import NBack from './games/NBack.jsx'
import SequenceRecall from './games/SequenceRecall.jsx'
import MentalRotation from './games/MentalRotation.jsx'
import ReverseRecall from './games/ReverseRecall.jsx'
import RuleSwitch from './games/RuleSwitch.jsx'
import EstimateIt from './games/EstimateIt.jsx'
import GoNoGo from './games/GoNoGo.jsx'
import VisualSearch from './games/VisualSearch.jsx'
import OddOneOut from './games/OddOneOut.jsx'
import TypingAsteroids from './games/TypingAsteroids.jsx'
import FaceIdentify from './games/FaceIdentify.jsx'
import UnfollowTheLeader from './games/UnfollowTheLeader.jsx'
import ColorSwitch from './games/ColorSwitch.jsx'
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
            <Route path="/" element={<HomePage />} />
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
            <Route path="/n-back" element={<NBack />} />
            <Route path="/sequence-recall" element={<SequenceRecall />} />
            <Route path="/mental-rotation" element={<MentalRotation />} />
            <Route path="/reverse-recall" element={<ReverseRecall />} />
            <Route path="/rule-switch" element={<RuleSwitch />} />
            <Route path="/estimate-it" element={<EstimateIt />} />
            <Route path="/go-no-go" element={<GoNoGo />} />
            <Route path="/visual-search" element={<VisualSearch />} />
            <Route path="/odd-one-out" element={<OddOneOut />} />
            <Route path="/typing-asteroids" element={<TypingAsteroids />} />
            <Route path="/face-identify" element={<FaceIdentify />} />
            <Route path="/unfollow-the-leader" element={<UnfollowTheLeader />} />
            <Route path="/color-switch" element={<ColorSwitch />} />
            <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function titleFor(pathname) {
  if (pathname === '/') return 'Home'
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
  if (pathname.startsWith('/n-back')) return 'N-Back'
  if (pathname.startsWith('/sequence-recall')) return 'Sequence Recall'
  if (pathname.startsWith('/mental-rotation')) return 'Mental Rotation'
  if (pathname.startsWith('/reverse-recall')) return 'Reverse Recall'
  if (pathname.startsWith('/rule-switch')) return 'Rule Switch'
  if (pathname.startsWith('/estimate-it')) return 'Estimate It'
  if (pathname.startsWith('/go-no-go')) return 'Go / No-Go'
  if (pathname.startsWith('/visual-search')) return 'Visual Search'
  if (pathname.startsWith('/odd-one-out')) return 'Odd One Out'
  if (pathname.startsWith('/typing-asteroids')) return 'Typing Asteroids'
  if (pathname.startsWith('/face-identify')) return 'Face Identify'
  if (pathname.startsWith('/unfollow-the-leader')) return 'Unfollow the Leader'
  if (pathname.startsWith('/color-switch')) return 'Color Switch'
  return 'Anti Brain Rot'
}
