import { useCallback, useEffect, useState } from 'react'
import { getProfile, getOverall, getPlayedCount } from '../data/calibration.js'
import {
  isSoundEnabled,
  setSoundEnabled,
  isHapticsEnabled,
  setHapticsEnabled,
  feedback,
} from '../lib/feedback.js'
import './BrainProfile.css'

// Radar geometry. Six axes, one per cognitive dimension, evenly spaced.
const SIZE = 320
const CENTER = SIZE / 2
const MAX_R = 118
const LABEL_R = 138
const RINGS = [0.25, 0.5, 0.75, 1]

function angleFor(index, count) {
  // Start at the top (−90°) and go clockwise.
  return (-90 + (360 / count) * index) * (Math.PI / 180)
}

function pointAt(index, count, radius) {
  const a = angleFor(index, count)
  return [CENTER + radius * Math.cos(a), CENTER + radius * Math.sin(a)]
}

export default function BrainProfile() {
  const read = useCallback(
    () => ({
      profile: getProfile(),
      overall: getOverall(),
      played: getPlayedCount(),
    }),
    [],
  )
  const [{ profile, overall, played }, setState] = useState(read)
  const [sound, setSound] = useState(isSoundEnabled)
  const [haptics, setHaptics] = useState(isHapticsEnabled)

  // Recompute when returning to the tab (e.g. back from playing a game).
  useEffect(() => {
    const refresh = () => setState(read())
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [read])

  const count = profile.length
  const valuePoints = profile
    .map((d, i) => pointAt(i, count, (d.value / 100) * MAX_R).join(','))
    .join(' ')

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
    if (next) feedback('correct')
  }
  const toggleHaptics = () => {
    const next = !haptics
    setHaptics(next)
    setHapticsEnabled(next)
    if (next) feedback('click')
  }

  return (
    <section className="brain">
      <div className="brain__head">
        <div>
          <h2 className="brain__title">Your Cognitive Profile</h2>
          <p className="brain__subtitle">
            {played === 0
              ? 'Play any game to start calibrating your brain.'
              : `Calibrated from ${played} game${played === 1 ? '' : 's'} you've played.`}
          </p>
        </div>
        <div className="brain__toggles">
          <button
            type="button"
            className={`brain__toggle ${sound ? 'is-on' : ''}`}
            onClick={toggleSound}
            aria-pressed={sound}
          >
            {sound ? '🔊' : '🔇'} Sound
          </button>
          <button
            type="button"
            className={`brain__toggle ${haptics ? 'is-on' : ''}`}
            onClick={toggleHaptics}
            aria-pressed={haptics}
          >
            📳 Haptics
          </button>
        </div>
      </div>

      <div className="brain__body">
        <div className="brain__radar-wrap">
          <svg
            className="brain__radar"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label="Radar chart of your six cognitive dimensions"
          >
            {/* grid rings */}
            {RINGS.map((r) => (
              <polygon
                key={r}
                className="brain__ring"
                points={profile
                  .map((_, i) => pointAt(i, count, r * MAX_R).join(','))
                  .join(' ')}
              />
            ))}
            {/* axes */}
            {profile.map((d, i) => {
              const [x, y] = pointAt(i, count, MAX_R)
              return (
                <line
                  key={d.id}
                  className="brain__axis"
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
                />
              )
            })}
            {/* the plotted profile */}
            <polygon className="brain__shape" points={valuePoints} />
            {/* vertex dots */}
            {profile.map((d, i) => {
              const [x, y] = pointAt(i, count, (d.value / 100) * MAX_R)
              return (
                <circle
                  key={d.id}
                  className="brain__dot"
                  cx={x}
                  cy={y}
                  r={4}
                  style={{ fill: d.color }}
                />
              )
            })}
            {/* brain glyph at the center */}
            <text className="brain__glyph" x={CENTER} y={CENTER} textAnchor="middle">
              🧠
            </text>
            {/* axis labels */}
            {profile.map((d, i) => {
              const [x, y] = pointAt(i, count, LABEL_R)
              const anchor = x < CENTER - 4 ? 'end' : x > CENTER + 4 ? 'start' : 'middle'
              return (
                <text
                  key={d.id}
                  className="brain__label"
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                >
                  <tspan className="brain__label-emoji">{d.emoji}</tspan>
                  <tspan dx="4" style={{ fill: d.color }}>
                    {d.value}
                  </tspan>
                </text>
              )
            })}
          </svg>
          <div className="brain__overall">
            <span className="brain__overall-num">{overall}</span>
            <span className="brain__overall-cap">Brain Score</span>
          </div>
        </div>

        <ul className="brain__legend">
          {profile.map((d) => (
            <li key={d.id} className="brain__legend-row">
              <span className="brain__legend-dot" style={{ background: d.color }} />
              <span className="brain__legend-label">
                {d.emoji} {d.label}
              </span>
              <span className="brain__legend-bar">
                <span
                  className="brain__legend-fill"
                  style={{ width: `${d.value}%`, background: d.color }}
                />
              </span>
              <span className="brain__legend-val">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
