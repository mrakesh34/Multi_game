/**
 * FILE: frontend/src/games/ludo/constants.js
 * PURPOSE: Board layout, coordinates, track path, safe squares, and color maps
 *          for the standard 15x15 Ludo board.
 *
 * BOARD COORDINATE SYSTEM:
 *   Grid is 15 rows x 15 columns (indices 0 to 14).
 *   - Red Yard (Top-Left): rows 0..5, cols 0..5
 *   - Green Yard (Top-Right): rows 0..5, cols 9..14
 *   - Yellow Yard (Bottom-Right): rows 9..14, cols 9..14
 *   - Blue Yard (Bottom-Left): rows 9..14, cols 0..5
 *   - Center Home: rows 6..8, cols 6..8
 *
 * OUTER TRACK (52 squares, 0..51):
 *   Player Starts:
 *     Red (0)   -> row 6, col 1 (global pos 0)
 *     Green (1) -> row 1, col 8 (global pos 13)
 *     Yellow (2)-> row 8, col 13 (global pos 26)
 *     Blue (3)  -> row 13, col 6 (global pos 39)
 *
 * SAFE SQUARES (outer track global positions):
 *   [0, 8, 13, 21, 26, 34, 39, 47]
 */

export const BOARD_SIZE = 15

export const COLORS = ['red', 'green', 'yellow', 'blue']

export const COLOR_HEX = {
  red:    '#ef4444',
  green:  '#22c55e',
  yellow: '#eab308',
  blue:   '#3b82f6',
}

export const PLAYER_STARTS = [0, 13, 26, 39]

export const OUTER_TRACK_LEN = 52

export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47]

/**
 * Standard 52-square outer track coordinate map on 15x15 grid.
 * Starts from Red's entry point (row 6, col 1) and circles clockwise.
 */
export const BOARD_PATH = [
  /* 0 - Red start */ { row: 6, col: 1 },
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  /* 8 - Safe */ { row: 2, col: 6 },
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  { row: 0, col: 7 },
  { row: 0, col: 8 },
  /* 13 - Green start */ { row: 1, col: 8 },
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  /* 21 - Safe */ { row: 6, col: 12 },
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  { row: 7, col: 14 },
  { row: 8, col: 14 },
  /* 26 - Yellow start */ { row: 8, col: 13 },
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  /* 34 - Safe */ { row: 12, col: 8 },
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  { row: 14, col: 7 },
  { row: 14, col: 6 },
  /* 39 - Blue start */ { row: 13, col: 6 },
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  /* 47 - Safe */ { row: 8, col: 2 },
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  { row: 7, col: 0 },
  { row: 6, col: 0 },
]

/**
 * Private home columns for each color (steps 51 to 55).
 * 5 squares per color leading to the center home triangle.
 */
export const HOME_COLUMNS = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
}

/**
 * Yard base circles for each color (steps = -1).
 * 4 piece slot positions per yard.
 */
export const HOME_BASE_POSITIONS = {
  red: [
    { row: 1.5, col: 1.5 },
    { row: 1.5, col: 3.5 },
    { row: 3.5, col: 1.5 },
    { row: 3.5, col: 3.5 },
  ],
  green: [
    { row: 1.5, col: 10.5 },
    { row: 1.5, col: 12.5 },
    { row: 3.5, col: 10.5 },
    { row: 3.5, col: 12.5 },
  ],
  yellow: [
    { row: 10.5, col: 10.5 },
    { row: 10.5, col: 12.5 },
    { row: 12.5, col: 10.5 },
    { row: 12.5, col: 12.5 },
  ],
  blue: [
    { row: 10.5, col: 1.5 },
    { row: 10.5, col: 3.5 },
    { row: 12.5, col: 1.5 },
    { row: 12.5, col: 3.5 },
  ],
}

/** Center finish coordinates (step = 56) */
export const CENTER_HOME = {
  red:    { row: 7, col: 6 },
  green:  { row: 6, col: 7 },
  yellow: { row: 7, col: 8 },
  blue:   { row: 8, col: 7 },
}
