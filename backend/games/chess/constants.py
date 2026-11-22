"""
FILE: backend/games/chess/constants.py
PURPOSE: Chess-specific constants.

CONSTANTS:
  PIECE_SYMBOLS : Maps python-chess piece type integers to their symbol strings.
                  Used when building captured_by_white/black lists in game state.
  COLORS        : ["white", "black"] indexed by slot order (slot 0 = white).
"""

import chess

PIECE_SYMBOLS = {
    chess.PAWN:   "P",
    chess.KNIGHT: "N",
    chess.BISHOP: "B",
    chess.ROOK:   "R",
    chess.QUEEN:  "Q",
    chess.KING:   "K",
}
COLORS = ["white", "black"]
