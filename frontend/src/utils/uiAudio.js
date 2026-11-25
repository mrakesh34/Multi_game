/**
 * FILE: frontend/src/utils/uiAudio.js
 * PURPOSE: Zero-dependency procedural Web Audio API sound effects for the
 *          TE-01 Tactile Console UI (keycap clicks, code flip clacks,
 *          card snaps, wooden thuds, and celebration chimes).
 *          Respects the global sound setting via getSoundEnabled().
 */

import { getSoundEnabled } from './localStorage'

let sharedCtx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (AudioCtx) sharedCtx = new AudioCtx()
  }
  if (sharedCtx && sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {})
  }
  return sharedCtx
}

/** Crisp lubricated mechanical keycap thock */
export function playKeyThock(pitch = 165) {
  if (!getSoundEnabled()) return
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(pitch, now)
  osc.frequency.exponentialRampToValueAtTime(56, now + 0.032)

  gain.gain.setValueAtTime(0.22, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.034)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.036)

  // Subtle slider friction noise burst
  const len = Math.max(1, Math.floor(ctx.sampleRate * 0.016))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  }
  const src = ctx.createBufferSource()
  src.buffer = buf

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1050, now)

  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.12, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016)

  src.connect(filter)
  filter.connect(nGain)
  nGain.connect(ctx.destination)
  src.start(now)
  src.stop(now + 0.018)
}

/** Split-flap / room code shuffle double-clack */
export function playFlipClack() {
  if (!getSoundEnabled()) return
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  ;[0, 0.042].forEach((offset, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(idx === 0 ? 440 : 290, now + offset)
    osc.frequency.exponentialRampToValueAtTime(115, now + offset + 0.028)

    gain.gain.setValueAtTime(0.12, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + offset)
    osc.stop(now + offset + 0.032)
  })
}

/** Warm tactile card / piece snap */
export function playSnap() {
  if (!getSoundEnabled()) return
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const len = Math.max(1, Math.floor(ctx.sampleRate * 0.055))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.35))
  }

  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1250, now)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055)

  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  src.start(now)
}

/** Warm muted chime for match launch or win */
export function playWarmChime() {
  if (!getSoundEnabled()) return
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [293.66, 369.99, 440.0, 554.37]
  notes.forEach((freq, idx) => {
    const start = now + idx * 0.05
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, start)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(980, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.28)
  })
}
