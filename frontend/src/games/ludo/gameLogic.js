/**
 * FILE: frontend/src/games/ludo/gameLogic.js
 * PURPOSE: Client-side pure calculations for Ludo piece positions,
 *          valid move calculation for UI indicators, and coordinate mapping.
 *
 * FUNCTIONS:
 *   - getGlobalPos(colorIndex, steps):
 *       Calculates outer track position index (0..51) for steps in 0..50.
 *   - getBoardCoords(colorIndex, pieceId, steps):
 *       Maps steps (-1, 0..50, 51..55, 56) to board grid `{ row, col }`.
 *   - getValidMoves(gameState, myColorIndex, diceValue):
 *       Returns array of valid piece_ids that the local player can move.
 */

import {
  BOARD_PATH,
  HOME_COLUMNS,
  HOME_BASE_POSITIONS,
  CENTER_HOME,
  COLORS,
  PLAYER_STARTS,
  OUTER_TRACK_LEN,
} from './constants'

export function getGlobalPos(colorIndex, steps) {
  if (steps < 0 || steps > 50) return null
  return (PLAYER_STARTS[colorIndex] + steps) % 52
}

export function getBoardCoords(colorIndex, pieceId, steps) {
  const color = COLORS[colorIndex]

  // In Yard
  if (steps === -1) {
    return HOME_BASE_POSITIONS[color][pieceId]
  }

  // On Outer Track (steps 0 to 50)
  if (steps >= 0 && steps <= 50) {
    const globalPos = getGlobalPos(colorIndex, steps)
    return BOARD_PATH[globalPos]
  }

  // In Home Column (steps 51 to 55)
  if (steps >= 51 && steps <= 55) {
    const colIndex = steps - 51
    return HOME_COLUMNS[color][colIndex]
  }

  // Reached Home (step 56)
  if (steps === 56) {
    return CENTER_HOME[color]
  }

  return { row: 7, col: 7 }
}

export function getValidMoves(gameState, myColorIndex, diceValue) {
  if (!gameState || !diceValue) return []
  const current = gameState.players?.find(p => p.color_index === myColorIndex)
  if (!current) return []

  const valid = []
  for (const piece of current.pieces) {
    const s = piece.steps
    if (s === 56) continue
    if (s === -1) {
      if (diceValue === 6) valid.push(piece.id)
    } else if (s + diceValue <= 56) {
      valid.push(piece.id)
    }
  }
  return valid
}
