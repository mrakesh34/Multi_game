/**
 * FILE: frontend/src/games/chess/constants.js
 * PURPOSE: Unicode piece symbols, square colors, and rank/file definitions.
 */

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export const SQUARE_COLORS = {
  light: '#f0d9b5',
  dark:  '#b58863',
  selected: '#fde047',
  lastMove: 'rgba(254, 240, 138, 0.5)',
  check: 'rgba(239, 68, 68, 0.6)',
}

export const PIECE_UNICODE = {
  // White pieces
  wP: '♙',
  wN: '♘',
  wB: '♗',
  wR: '♖',
  wQ: '♕',
  wK: '♔',
  // Black pieces
  bP: '♟',
  bN: '♞',
  bB: '♝',
  bR: '♜',
  bQ: '♛',
  bK: '♚',
}
