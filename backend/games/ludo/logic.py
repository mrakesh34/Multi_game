"""
FILE: backend/games/ludo/logic.py
PURPOSE: Pure functions for Ludo game mechanics.
         No side effects, no state mutation — takes dicts, returns dicts/values.
         Tested independently of the game class.

FUNCTIONS:
  get_global_pos(color_index, steps) → int | None
    Convert a piece's step count to its global outer-track position (0–51).
    Returns None if the piece is in the yard, home column, or finished.

  roll_dice() → int
    Returns a random integer 1–6 (uses random.randint).

  get_valid_moves(game_state, dice_value) → list[int]
    Given the current game state and a dice value, return piece IDs that can
    legally move for the current player.

  apply_move(game_state, player_index, piece_id, dice_value) → dict
    Core move function. Handles:
      - Moving piece out of yard (requires dice==6)
      - Moving piece along outer track
      - Entering and moving through home column
      - Capturing opponent pieces (not on safe squares)
      - Detecting a finished player (all 4 pieces at steps==56)
      - Advancing the turn (extra roll on 6, forfeit on 3rd consecutive 6)
    Returns the updated game_state dict.
    Raises ValueError on invalid moves.

  next_player_index(current, players) → int
    Find the next player who isn't finished, skipping over finished players.
"""

import copy
import random
from typing import List, Optional

from games.ludo.constants import PLAYER_STARTS, SAFE_SQUARES, OUTER_TRACK_LEN, HOME_COL_LEN


def get_global_pos(color_index: int, steps: int) -> Optional[int]:
    """Return outer-track global position for steps 0–50. None otherwise."""
    if steps < 0 or steps > 50:
        return None
    return (PLAYER_STARTS[color_index] + steps) % OUTER_TRACK_LEN


def roll_dice() -> int:
    return random.randint(1, 6)


def get_valid_moves(game_state: dict, dice_value: int) -> List[int]:
    """Return list of piece IDs that can legally move with this dice value."""
    current = game_state["players"][game_state["current_player_index"]]
    valid = []
    for piece in current["pieces"]:
        s = piece["steps"]
        if s == 56:
            continue                           # already home
        if s == -1:
            if dice_value == 6:
                valid.append(piece["id"])      # only a 6 can leave the yard
        elif s + dice_value <= 56:
            valid.append(piece["id"])
    return valid


def apply_move(game_state: dict, player_index: int, piece_id: int, dice_value: int) -> dict:
    """
    Move the specified piece by dice_value steps.
    Handles captures, home-column entry, win detection, and turn advancement.
    Returns updated game_state. Raises ValueError for illegal moves.
    """
    state = copy.deepcopy(game_state)
    current = state["players"][player_index]
    piece = next((p for p in current["pieces"] if p["id"] == piece_id), None)

    if piece is None:
        raise ValueError(f"Piece {piece_id} not found")
    if piece["steps"] == 56:
        raise ValueError("Piece already home")
    if piece["steps"] == -1 and dice_value != 6:
        raise ValueError("Need a 6 to leave the yard")

    # Move the piece
    if piece["steps"] == -1:
        piece["steps"] = 0
    else:
        piece["steps"] = min(piece["steps"] + dice_value, 56)

    new_steps = piece["steps"]

    # Capture check: only on outer track (steps 0–50), not on safe squares
    if 0 <= new_steps <= 50:
        my_global = get_global_pos(current["color_index"], new_steps)
        if my_global is not None and my_global not in SAFE_SQUARES:
            for i, opponent in enumerate(state["players"]):
                if i == player_index:
                    continue
                for opp_piece in opponent["pieces"]:
                    if opp_piece["steps"] == -1 or opp_piece["steps"] > 50:
                        continue
                    opp_global = get_global_pos(opponent["color_index"], opp_piece["steps"])
                    if opp_global == my_global:
                        opp_piece["steps"] = -1   # send captured piece back to yard

    # Update pieces_home count and finished flag
    current["pieces_home"] = sum(1 for p in current["pieces"] if p["steps"] == 56)
    if current["pieces_home"] == 4:
        current["is_finished"] = True

    # Win detection (first finished player ends the game)
    finished = [p for p in state["players"] if p.get("is_finished")]
    if finished:
        state["phase"] = "finished"
        return state

    # Turn advancement
    consecutive = state.get("consecutive_sixes", 0)
    if dice_value == 6 and new_steps != 56:
        if consecutive >= 2:
            # 3rd consecutive six → forfeit
            state["consecutive_sixes"] = 0
            state["current_player_index"] = next_player_index(player_index, state["players"])
            state["phase"] = "roll"
        else:
            state["consecutive_sixes"] = consecutive + 1
            state["phase"] = "roll"           # same player rolls again
            state["dice_value"] = None
    else:
        state["consecutive_sixes"] = 0
        state["current_player_index"] = next_player_index(player_index, state["players"])
        state["phase"] = "roll"
        state["dice_value"] = None

    return state


def next_player_index(current: int, players: list) -> int:
    """Return the next non-finished player index, wrapping around."""
    n = len(players)
    for offset in range(1, n + 1):
        candidate = (current + offset) % n
        if not players[candidate].get("is_finished", False):
            return candidate
    return current   # fallback: all finished (shouldn't happen mid-game)
