"""
FILE: backend/games/bingo/constants.py
PURPOSE: All Bingo-specific constants for the 1–25 Indian / Student Bingo variant.

RULES:
  - 5×5 grid = 25 numbers total (1 to 25).
  - No FREE space.
  - 12 possible lines: 5 rows + 5 columns + 2 diagonals.
  - Reaching 5 completed lines spells B-I-N-G-O and wins!
"""

GRID_SIZE = 5
TOTAL_NUMBERS = 25
WIN_LINES_TARGET = 5
BINGO_LETTERS = ["B", "I", "N", "G", "O"]
