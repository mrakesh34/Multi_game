/**
 * FILE: frontend/src/games/bingo/useGameAudio.ts
 * PURPOSE: Zero-dependency Web Audio API procedural sound synthesis for tactile hardware Bingo.
 * 
 * SOUND EFFECTS:
 *   1. Tile Press: Filtered noise burst + 150Hz -> 60Hz pitch-drop sine wave (25ms) (lubricated mechanical thock)
 *   2. Ball Called: Soft wooden clack (bandpass-filtered impulse at ~800Hz, 30ms)
 *   3. Line Complete: Warm, muted major-7th arpeggio (triangle wave with gentle low-pass filter, no harsh beeps)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSoundEnabled, setSoundEnabled } from '../../utils/localStorage'

export interface GameAudioController {
  isMuted: boolean
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  playTilePress: () => void
  playBallCalled: () => void
  playLineComplete: () => void
}

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass()
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {})
  }
  return sharedAudioContext
}

export function useGameAudio(): GameAudioController {
  const [isMuted, setIsMutedState] = useState<boolean>(() => !getSoundEnabled())
  const mutedRef = useRef<boolean>(!getSoundEnabled())

  useEffect(() => {
    mutedRef.current = isMuted
  }, [isMuted])

  // Sync with storage events from GameLayout or other tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'mgp_sound_enabled') {
        const soundEnabled = e.newValue !== 'false'
        setIsMutedState(!soundEnabled)
        mutedRef.current = !soundEnabled
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMutedState(prev => {
      const nextMuted = !prev
      setSoundEnabled(!nextMuted)
      mutedRef.current = nextMuted
      return nextMuted
    })
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted)
    setSoundEnabled(!muted)
    mutedRef.current = muted
  }, [])

  /**
   * TILE PRESS:
   * Short filtered noise burst + 150Hz -> 60Hz pitch-drop sine wave (25ms)
   * Mimics a lubricated mechanical keyboard switch thock.
   */
  const playTilePress = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // 1. Pitch-drop sine sub-oscillator (150Hz -> 60Hz, 25ms)
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.025)

    oscGain.gain.setValueAtTime(0.32, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.026)

    // 2. Filtered noise burst for slider friction/switch impact (18ms)
    const noiseDuration = 0.018
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * noiseDuration))
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.setValueAtTime(1100, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.18, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration)

    noiseSource.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noiseSource.start(now)
    noiseSource.stop(now + noiseDuration)
  }, [])

  /**
   * BALL CALLED:
   * Soft wooden clack (bandpass-filtered impulse at ~800Hz, 30ms).
   */
  const playBallCalled = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const duration = 0.030 // 30ms
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (ctx.sampleRate * 0.006))
      output[i] = (Math.random() * 2 - 1) * decay
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer

    // Bandpass filter centered at 800Hz for acoustic wooden clack
    const bpFilter = ctx.createBiquadFilter()
    bpFilter.type = 'bandpass'
    bpFilter.frequency.setValueAtTime(800, now)
    bpFilter.Q.setValueAtTime(4.2, now)

    const clackGain = ctx.createGain()
    clackGain.gain.setValueAtTime(0.35, now)
    clackGain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noiseSource.connect(bpFilter)
    bpFilter.connect(clackGain)
    clackGain.connect(ctx.destination)

    noiseSource.start(now)
    noiseSource.stop(now + duration)

    // Wood body fundamental resonance
    const woodOsc = ctx.createOscillator()
    const woodGain = ctx.createGain()
    woodOsc.type = 'triangle'
    woodOsc.frequency.setValueAtTime(360, now)
    woodOsc.frequency.exponentialRampToValueAtTime(240, now + duration)

    woodGain.gain.setValueAtTime(0.16, now)
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    woodOsc.connect(woodGain)
    woodGain.connect(ctx.destination)

    woodOsc.start(now)
    woodOsc.stop(now + duration)
  }, [])

  /**
   * LINE COMPLETE:
   * Warm, muted major-7th arpeggio (triangle wave with gentle low-pass filter, no harsh beeps).
   * Cmaj7 / Dmaj7 notes: D4 (293.66Hz), F#4 (369.99Hz), A4 (440.00Hz), C#5 (554.37Hz)
   */
  const playLineComplete = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    if (!ctx) return

    const notes = [293.66, 369.99, 440.00, 554.37, 587.33] // Dmaj7 -> D5
    const noteInterval = 0.055 // 55ms stagger
    const startTime = ctx.currentTime

    notes.forEach((freq, idx) => {
      const noteStart = startTime + idx * noteInterval
      const noteDuration = 0.28 // 280ms gentle ring

      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      // Triangle wave for smooth, warm timbre
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, noteStart)

      // Gentle low-pass filter to remove harsh upper harmonics
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(950, noteStart)
      filter.Q.setValueAtTime(0.7, noteStart)

      // Soft envelope: 10ms smooth attack, gentle exponential decay
      gain.gain.setValueAtTime(0.0001, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.24, noteStart + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(noteStart)
      osc.stop(noteStart + noteDuration)
    })
  }, [])

  return {
    isMuted,
    toggleMute,
    setMuted,
    playTilePress,
    playBallCalled,
    playLineComplete,
  }
}
