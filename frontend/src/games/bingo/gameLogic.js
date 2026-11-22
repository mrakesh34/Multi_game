/**
 * FILE: frontend/src/games/bingo/gameLogic.js
 * PURPOSE: Pure helper functions to count completed lines (rows, columns, diagonals)
 *          and return winning line coordinates for UI highlighting.
 */

export const GRID_SIZE = 5

export function countCompletedLines(marked) {
  if (!marked || marked.length !== GRID_SIZE) return 0
  let count = 0

  // 5 Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (marked[r]?.every(Boolean)) count++
  }

  // 5 Columns
  for (let c = 0; c < GRID_SIZE; c++) {
    if ([0, 1, 2, 3, 4].every(r => marked[r]?.[c])) count++
  }

  // Main diagonal
  if ([0, 1, 2, 3, 4].every(i => marked[i]?.[i])) count++

  // Anti-diagonal
  if ([0, 1, 2, 3, 4].every(i => marked[i]?.[4 - i])) count++

  return count
}

export function getWinningLines(marked) {
  if (!marked || marked.length !== GRID_SIZE) return []
  const lines = []

  // Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (marked[r]?.every(Boolean)) {
      lines.push([0, 1, 2, 3, 4].map(c => ({ r, c })))
    }
  }

  // Columns
  for (let c = 0; c < GRID_SIZE; c++) {
    if ([0, 1, 2, 3, 4].every(r => marked[r]?.[c])) {
      lines.push([0, 1, 2, 3, 4].map(r => ({ r, c })))
    }
  }

  // Main diagonal
  if ([0, 1, 2, 3, 4].every(i => marked[i]?.[i])) {
    lines.push([0, 1, 2, 3, 4].map(i => ({ r: i, c: i })))
  }

  // Anti-diagonal
  if ([0, 1, 2, 3, 4].every(i => marked[i]?.[4 - i])) {
    lines.push([0, 1, 2, 3, 4].map(i => ({ r: i, c: 4 - i })))
  }

  return lines
}
