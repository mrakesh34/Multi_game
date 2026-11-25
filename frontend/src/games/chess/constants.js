/**
 * FILE: frontend/src/games/chess/constants.js
 * PURPOSE: Unicode piece symbols, TE-01 warm bone & slate square colors, and rank/file definitions.
 */

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export const SQUARE_COLORS = {
  light:    '#e6dccb',
  dark:     '#57606f',
  selected: '#e07a22',
  lastMove: 'rgba(224, 122, 34, 0.34)',
  check:    'rgba(217, 72, 43, 0.65)',
}

export const PIECE_UNICODE = {
  wP: '♙',
  wN: '♘',
  wB: '♗',
  wR: '♖',
  wQ: '♕',
  wK: '♔',
  bP: '♟',
  bN: '♞',
  bB: '♝',
  bR: '♜',
  bQ: '♛',
  bK: '♚',
}
