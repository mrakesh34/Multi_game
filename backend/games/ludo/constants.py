"""
FILE: backend/games/ludo/constants.py
PURPOSE: All Ludo-specific numeric constants and board data.
         Imported by both logic.py and game.py. Never hardcode these elsewhere.

CONSTANTS:
  PLAYER_STARTS  : Global outer-track start position for each color (0=Red, 13=Green, 26=Yellow, 39=Blue)
  SAFE_SQUARES   : Set of outer-track positions (0–51) where pieces cannot be captured
  COLORS         : Human-readable color names indexed by color_index
  NUM_PIECES     : Pieces per player (always 4)
  OUTER_TRACK_LEN: Total squares on the shared outer track (52)
  HOME_COL_LEN   : Squares in each player's private home column (5; step 56 = center)

BOARD POSITION SYSTEM (see IMPLEMENTATION_PLAN.md §8.1):
  steps = -1          → piece is in the yard (home base, not on board)
  steps = 0–50        → piece is on the outer track
  steps = 51–55       → piece is in the home column (safe, color-specific)
  steps = 56          → piece has reached home (finished)
  global_pos formula  → (PLAYER_STARTS[color_index] + steps) % 52
"""

PLAYER_STARTS   = [0, 13, 26, 39]          # outer-track entry per color_index
SAFE_SQUARES    = {0, 8, 13, 21, 26, 34, 39, 47}
COLORS          = ["red", "green", "yellow", "blue"]
NUM_PIECES      = 4
OUTER_TRACK_LEN = 52
HOME_COL_LEN    = 5                         # steps 51–55 are home column
