/**
 * FILE: frontend/src/hooks/useSound.js
 * PURPOSE: Returns a play(key) function that triggers Howler.js sound effects
 *          for the given game, respecting the global mute setting.
 *
 * USAGE:
 *   const play = useSound('ludo')
 *   play('dice_roll')     // plays /sounds/ludo/dice_roll.mp3 if sound enabled
 *   play('piece_move')
 *
 * HOW IT WORKS:
 *   1. On mount (or when `game` changes), load all sound files for that game
 *      using Howler.js Howl instances.
 *   2. When play(key) is called:
 *      a. Check getSoundEnabled() from localStorage
 *      b. If enabled and the key exists, call howl.play()
 *
 * SOUND FILE MAP (must match files in public/sounds/<game>/):
 *   ludo:  dice_roll, piece_move, piece_capture, win
 *   bingo: number_call, mark, bingo
 *   chess: move, capture, check, game_end
 *   uno:   card_play, card_draw, uno_call, win
 *
 * IMPORTANT:
 *   Howler.js respects browser autoplay policy — sounds only play after the
 *   user has interacted with the page (clicked something). This is by design.
 *   Do NOT try to work around this.
 */

import { useMemo, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { getSoundEnabled } from '../utils/localStorage'

const SOUND_MANIFEST = {
  ludo:  ['dice_roll', 'piece_move', 'piece_capture', 'win'],
  bingo: ['number_call', 'mark', 'bingo'],
  chess: ['move', 'capture', 'check', 'game_end'],
  uno:   ['card_play', 'card_draw', 'uno_call', 'win'],
}

export function useSound(game) {
  const soundsRef = useRef({})

  useEffect(() => {
    if (!game || !SOUND_MANIFEST[game]) return

    const loaded = {}
    for (const key of SOUND_MANIFEST[game]) {
      loaded[key] = new Howl({
        src: [`/sounds/${game}/${key}.mp3`],
        preload: true,
        volume: 0.6,
      })
    }
    soundsRef.current = loaded

    return () => {
      // Unload all Howl instances on game change to free memory
      Object.values(soundsRef.current).forEach(h => h.unload())
    }
  }, [game])

  // play(key) — safe to call even if sound is disabled or file not loaded
  return function play(key) {
    if (!getSoundEnabled()) return
    const howl = soundsRef.current[key]
    if (howl) howl.play()
  }
}
