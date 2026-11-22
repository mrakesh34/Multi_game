/**
 * FILE: frontend/src/games/chess/gameLogic.js
 * PURPOSE: Helper wrapping chess.js for client-side legal move queries and promotion checks.
 *          Server remains the ultimate authority on move validation.
 */

import { Chess } from 'chess.js'

export function getLegalMovesForSquare(fen, square) {
  if (!fen || !square) return []
  try {
    const chess = new Chess(fen)
    const moves = chess.moves({ square, verbose: true })
    return moves.map(m => m.to)
  } catch (err) {
    return []
  }
}

export function isPawnPromotion(fen, from, to) {
  if (!fen || !from || !to) return false
  try {
    const chess = new Chess(fen)
    const piece = chess.get(from)
    if (!piece || piece.type !== 'p') return false
    return (piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1')
  } catch (err) {
    return false
  }
}

export function parseFenBoard(fen) {
  if (!fen) return []
  try {
    const chess = new Chess(fen)
    return chess.board()
  } catch (err) {
    return []
  }
}
