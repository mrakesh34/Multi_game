"""
FILE: backend/games/__init__.py
PURPOSE: Package init + GAME_REGISTRY — the central lookup table that maps
         a game name string to its concrete game class.

WHY THIS EXISTS:
  socket_handler.py needs to instantiate the correct game class when
  "start_game" is received. Instead of a big if/elif block in the handler,
  it does: GameClass = GAME_REGISTRY[room.game]

  Adding a new game = add one import + one entry here. Nothing else changes.

REGISTRY:
  "ludo"  → LudoGame
  "bingo" → BingoGame
  "chess" → ChessGame
  "uno"   → UnoGame
"""

from games.ludo.game   import LudoGame
from games.bingo.game  import BingoGame
from games.chess.game  import ChessGame
from games.uno.game    import UnoGame

GAME_REGISTRY = {
    "ludo":  LudoGame,
    "bingo": BingoGame,
    "chess": ChessGame,
    "uno":   UnoGame,
}
