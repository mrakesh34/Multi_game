/**
 * FILE: frontend/src/utils/roomCode.js
 * PURPOSE: Helpers for working with 3-digit room codes.
 *
 * FUNCTIONS:
 *   formatRoomId(n) → string
 *     Takes a number or string and returns a zero-padded 3-digit string.
 *     e.g. formatRoomId(7) → "007", formatRoomId("42") → "042"
 *
 *   isValidRoomId(s) → boolean
 *     Returns true if s is exactly a 3-digit string "000"–"999".
 *     Used to validate user input in JoinRoomModal before emitting join_room.
 *
 *   getRoomDigits(roomId) → [string, string, string]
 *     Splits a room ID into an array of individual digit strings.
 *     Used by RoomCode.jsx to display each digit in its own box.
 *     e.g. "742" → ["7", "4", "2"]
 */

export function formatRoomId(n) {
  const str = String(n || '').trim()
  if (/^\d+$/.test(str) && str.length < 3) {
    return str.padStart(3, '0')
  }
  return str
}

export function isValidRoomId(s) {
  return /^[a-zA-Z0-9]{3,6}$/.test(String(s).trim())
}

export function generateSuggestedRoomId() {
  return String(Math.floor(100 + Math.random() * 900))
}

export function getRoomDigits(roomId) {
  return formatRoomId(roomId).split('')
}
