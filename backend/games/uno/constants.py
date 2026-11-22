"""
FILE: backend/games/uno/constants.py
PURPOSE: Card definitions and type constants for the standard 108-card UNO deck.

CONSTANTS:
  COLORS      : Valid non-wild card colors ["red", "green", "blue", "yellow"]
  TYPES       : All card type strings used in the Card dict
  WILD_TYPES  : Types that can be played on any color
  ACTION_TYPES: Types that have special effects (skip, reverse, draw_two, wilds)

CARD DICT SHAPE:
  { "color": str, "type": str, "value": int | None, "id": int }

DECK COMPOSITION (108 cards total):
  Per color (4 colors × 25 = 100):
    - 0×1, 1-9×2, Skip×2, Reverse×2, Draw Two×2 = 25
  Wild ×4, Wild Draw Four ×4 = 8
"""

COLORS       = ["red", "green", "blue", "yellow"]
WILD_TYPES   = {"wild", "wild_draw_four"}
ACTION_TYPES = {"skip", "reverse", "draw_two", "wild", "wild_draw_four"}
TYPES        = ["number", "skip", "reverse", "draw_two", "wild", "wild_draw_four"]
