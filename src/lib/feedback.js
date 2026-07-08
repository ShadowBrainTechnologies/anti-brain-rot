// Sound + haptic feedback for games.
//
// Zero-asset: sounds are short synthesized tones via the Web Audio API, so no
// audio files ship with the bundle. Haptics use navigator.vibrate where the
// browser/device supports it (mostly Android). Both respect a single user
// preference persisted in localStorage.
//
// Usage from a game:
//   import { feedback } from '../lib/feedback.js'
//   feedback('correct')   // plays a pleasant blip + short buzz
//   feedback('wrong')     // low buzz + longer vibration
//
// Extending: add an entry to CUES with a { tones, vibrate } recipe and call
// feedback('<name>'). Nothing else needs to change.

const SOUND_KEY = 'brain-rot:sound'
const HAPTICS_KEY = 'brain-rot:haptics'

// A cue is a small recipe: one or more tones (frequency in Hz, duration in ms,
// optional delay/type/gain) plus an optional vibration pattern (ms, per the
// navigator.vibrate spec — a number or an array of on/off durations).
export const CUES = {
  click: { tones: [{ f: 440, d: 40, g: 0.05, type: 'sine' }], vibrate: 8 },
  start: {
    tones: [
      { f: 523, d: 90, type: 'sine' },
      { f: 784, d: 120, delay: 90, type: 'sine' },
    ],
    vibrate: 20,
  },
  correct: {
    tones: [
      { f: 660, d: 70, type: 'sine' },
      { f: 990, d: 90, delay: 60, type: 'sine' },
    ],
    vibrate: 15,
  },
  wrong: {
    tones: [{ f: 180, d: 180, g: 0.09, type: 'sawtooth' }],
    vibrate: [40, 30, 40],
  },
  tick: { tones: [{ f: 320, d: 30, g: 0.04, type: 'square' }], vibrate: 0 },
  win: {
    tones: [
      { f: 523, d: 110, type: 'triangle' },
      { f: 659, d: 110, delay: 100, type: 'triangle' },
      { f: 784, d: 160, delay: 200, type: 'triangle' },
    ],
    vibrate: [20, 40, 20],
  },
  lose: {
    tones: [
      { f: 300, d: 160, type: 'sawtooth' },
      { f: 200, d: 240, delay: 140, type: 'sawtooth' },
    ],
    vibrate: [60, 40, 120],
  },
}

// --- preferences -----------------------------------------------------------

function readPref(key) {
  try {
    // default ON when unset
    return localStorage.getItem(key) !== 'off'
  } catch {
    return true
  }
}

function writePref(key, enabled) {
  try {
    localStorage.setItem(key, enabled ? 'on' : 'off')
  } catch {
    /* storage unavailable — ignore */
  }
}

export function isSoundEnabled() {
  return readPref(SOUND_KEY)
}

export function setSoundEnabled(enabled) {
  writePref(SOUND_KEY, enabled)
}

export function isHapticsEnabled() {
  return readPref(HAPTICS_KEY)
}

export function setHapticsEnabled(enabled) {
  writePref(HAPTICS_KEY, enabled)
}

// --- audio -----------------------------------------------------------------

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) {
    try {
      audioCtx = new Ctx()
    } catch {
      return null
    }
  }
  // Browsers suspend the context until a user gesture; resume opportunistically.
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

function playTone(ctx, { f, d, delay = 0, type = 'sine', g = 0.06 }) {
  const start = ctx.currentTime + delay / 1000
  const stop = start + d / 1000
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(f, start)
  // Quick attack + smooth release so tones don't click.
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(g, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, stop)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(stop + 0.02)
}

export function playSound(name) {
  if (!isSoundEnabled()) return
  const cue = CUES[name]
  if (!cue || !cue.tones) return
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    for (const tone of cue.tones) playTone(ctx, tone)
  } catch {
    /* audio failed — non-fatal */
  }
}

// --- haptics ---------------------------------------------------------------

export function vibrate(pattern) {
  if (!isHapticsEnabled()) return
  if (pattern === 0 || pattern == null) return
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    /* vibration unsupported — ignore */
  }
}

// --- combined --------------------------------------------------------------

// Fire the named cue: sound + haptic together. Safe to call anywhere; it no-ops
// when disabled or unsupported and never throws.
export function feedback(name) {
  const cue = CUES[name]
  if (!cue) return
  playSound(name)
  if ('vibrate' in cue) vibrate(cue.vibrate)
}
