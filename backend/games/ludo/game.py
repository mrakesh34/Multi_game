"""
FILE: backend/games/ludo/game.py
PURPOSE: LudoGame — concrete BaseGame implementation for the Ludo board game.
         Orchestrates the game state and delegates all board logic to logic.py.

CLASS: LudoGame(BaseGame)

METHODS:
  initialize()
    Creates the initial game state: all 4 pieces per player start in the yard
    (steps = -1). Sets current_player_index = 0 and phase = "roll".
    Returns the full state dict (broadcast via "game_started").

  apply_action(socket_id, action_type, payload)
    Dispatches to either _handle_roll_dice or _handle_move_piece.
    Validates that it is the caller's turn before allowing any action.
    Raises ValueError on invalid actions (wrong turn, invalid piece, etc.).

  is_game_over()
    Returns True when at least one player has is_finished == True.
    (First player to get all 4 pieces home wins; game stops immediately.)

  get_winner()
    Returns the name of the first finished player.

  get_state()
    Returns the current self._state dict (full state, no hidden info in Ludo).

ACTION TYPES (see IMPLEMENTATION_PLAN.md §8.1):
  "roll_dice"  — payload: {}         → rolls dice, sets phase="move"
  "move_piece" — payload: {piece_id} → moves the piece, advances turn

LUDO STATE SHAPE:
  {
    "current_player_index": int,
    "phase": "roll" | "move",
    "dice_value": int | None,
    "consecutive_sixes": int,
    "players": [ { name, color_index, pieces:[{id, steps}], pieces_home, is_finished } ]
  }
"""

from typing import Optional, List
from games.base_game import BaseGame
from games.ludo import logic, constants
from models.player import Player


class LudoGame(BaseGame):
    def __init__(self, players: List[Player]):
        super().__init__(players)
        self._state: dict = {}

    # ── BaseGame interface ────────────────────────────────────────────────────

    def initialize(self) -> dict:
        self._state = {
            "current_player_index": 0,
            "phase": "roll",
            "dice_value": None,
            "consecutive_sixes": 0,
            "players": [
                {
                    "name": p.name,
                    "color_index": p.color_index,
                    "pieces": [{"id": i, "steps": -1} for i in range(constants.NUM_PIECES)],
                    "pieces_home": 0,
                    "is_finished": False,
                }
                for p in self.players
            ],
        }
        return self._state

    def apply_action(self, socket_id: str, action_type: str, payload: dict) -> dict:
        # Validate turn
        current_player = self.players[self._state["current_player_index"]]
        if current_player.socket_id != socket_id:
            raise ValueError("Not your turn")

        if action_type == "roll_dice":
            return self._handle_roll_dice()
        elif action_type == "move_piece":
            return self._handle_move_piece(payload)
        else:
            raise ValueError(f"Unknown action_type: {action_type}")

    def is_game_over(self) -> bool:
        return any(p.get("is_finished") for p in self._state.get("players", []))

    def get_winner(self) -> Optional[str]:
        for p in self._state.get("players", []):
            if p.get("is_finished"):
                return p["name"]
        return None

    def get_state(self) -> dict:
        return self._state

    # ── Internal handlers ─────────────────────────────────────────────────────

    def _handle_roll_dice(self) -> dict:
        if self._state["phase"] != "roll":
            raise ValueError("Not in roll phase")

        dice = logic.roll_dice()
        self._state["dice_value"] = dice

        valid_moves = logic.get_valid_moves(self._state, dice)
        if valid_moves:
            self._state["phase"] = "move"
        else:
            # No valid moves: advance turn
            idx = self._state["current_player_index"]
            self._state["consecutive_sixes"] = 0
            self._state["current_player_index"] = logic.next_player_index(idx, self._state["players"])
            self._state["dice_value"] = None
            self._state["phase"] = "roll"

        self._state["last_action_summary"] = f"{self.players[self._state['current_player_index']].name} rolled {dice}"
        return self._state

    def _handle_move_piece(self, payload: dict) -> dict:
        if self._state["phase"] != "move":
            raise ValueError("Not in move phase")

        piece_id = payload.get("piece_id")
        if piece_id is None:
            raise ValueError("piece_id required")

        player_index = self._state["current_player_index"]
        dice_value = self._state["dice_value"]

        # Validate the piece is in valid_moves
        valid = logic.get_valid_moves(self._state, dice_value)
        if piece_id not in valid:
            raise ValueError("Invalid piece move")

        self._state = logic.apply_move(self._state, player_index, piece_id, dice_value)
        self._state["last_action_summary"] = f"{self.players[player_index].name} moved piece {piece_id}"
        return self._state
