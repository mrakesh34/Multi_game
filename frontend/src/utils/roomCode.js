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
  return String(n).padStart(3, '0').slice(0, 3)
}

export function isValidRoomId(s) {
  return /^\d{3}$/.test(String(s))
}

export function getRoomDigits(roomId) {
  return formatRoomId(roomId).split('')
}
