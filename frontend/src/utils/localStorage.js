/**
 * FILE: frontend/src/utils/localStorage.js
 * PURPOSE: Typed, centralized wrapper around localStorage.
 *          All keys used by this app are defined here — no raw key strings elsewhere.
 *
 * KEYS (all prefixed with "mgp_" to avoid collisions with other apps):
 *   mgp_player_name    — player's display name (string, 1–20 chars)
 *   mgp_sound_enabled  — whether sound effects are on ("true" / "false")
 *   mgp_music_enabled  — whether background music is on ("true" / "false")
 *
 * FUNCTIONS:
 *   getPlayerName()       → string | null
 *   setPlayerName(name)   → void
 *   getSoundEnabled()     → boolean  (defaults to true)
 *   setSoundEnabled(val)  → void
 *   getMusicEnabled()     → boolean  (defaults to true)
 *   setMusicEnabled(val)  → void
 */

const KEYS = {
  PLAYER_NAME:    'mgp_player_name',
  NAME_CONFIRMED: 'mgp_name_confirmed',
  SOUND_ENABLED:  'mgp_sound_enabled',
  MUSIC_ENABLED:  'mgp_music_enabled',
}

export function getPlayerName()       { return localStorage.getItem(KEYS.PLAYER_NAME) || null }
export function setPlayerName(name)   { localStorage.setItem(KEYS.PLAYER_NAME, name) }

export function isNameConfirmed()     { return localStorage.getItem(KEYS.NAME_CONFIRMED) === 'true' }
export function setNameConfirmed(val) { localStorage.setItem(KEYS.NAME_CONFIRMED, String(val)) }

export function getSoundEnabled()     { return localStorage.getItem(KEYS.SOUND_ENABLED) !== 'false' }
export function setSoundEnabled(val)  { localStorage.setItem(KEYS.SOUND_ENABLED, String(val)) }

export function getMusicEnabled()     { return localStorage.getItem(KEYS.MUSIC_ENABLED) !== 'false' }
export function setMusicEnabled(val)  { localStorage.setItem(KEYS.MUSIC_ENABLED, String(val)) }
