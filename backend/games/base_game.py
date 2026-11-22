"""
FILE: backend/games/base_game.py
PURPOSE: Abstract base class that ALL game implementations must inherit.
         Defines the exact interface that socket_handler.py depends on.

WHY THIS EXISTS:
  socket_handler.py calls only these methods on any game object:
    - game.initialize()           → returns initial state dict
    - game.apply_action(sid, ...) → returns updated state dict
    - game.is_game_over()         → bool
    - game.get_winner()           → str | None
    - game.get_state()            → full state dict
    - game.get_state_for(sid)     → personalized state (default = full state)

  By enforcing the interface via ABC, any game that forgets to implement
  a required method raises a TypeError at import time, not at runtime.

SUBCLASSES:
  games/ludo/game.py  → LudoGame(BaseGame)
  games/bingo/game.py → BingoGame(BaseGame)
  games/chess/game.py → ChessGame(BaseGame)
  games/uno/game.py   → UnoGame(BaseGame)   ← overrides get_state_for()
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from models.player import Player


class BaseGame(ABC):
    def __init__(self, players: List[Player]):
        # Store the player list as-is from the room.
        # Game implementations may store additional state as instance variables.
        self.players = players

    @abstractmethod
    def initialize(self) -> dict:
        """
        Set up the initial game state.
        Called once when the host clicks 'Start Game'.
        Returns the initial state dict (broadcast to all players via game_started).
        """

    @abstractmethod
    def apply_action(self, socket_id: str, action_type: str, payload: dict) -> dict:
        """
        Apply a player action and return the updated game state dict.
        Raises ValueError with a human-readable message on illegal actions.
        (e.g., "Not your turn", "Illegal move", "Piece cannot move")
        """

    @abstractmethod
    def is_game_over(self) -> bool:
        """Return True when the game has reached a terminal state."""

    @abstractmethod
    def get_winner(self) -> Optional[str]:
        """
        Return the winning player's display name, or None for a draw.
        Only called after is_game_over() returns True.
        """

    @abstractmethod
    def get_state(self) -> dict:
        """Return the full game state dict (no hidden information)."""

    def get_state_for(self, socket_id: str) -> dict:
        """
        Return a potentially filtered state dict for a specific socket.
        Default implementation returns the full state (suitable for Ludo, Bingo, Chess).
        UNO overrides this to hide other players' hands.
        """
        return self.get_state()
