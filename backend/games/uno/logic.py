"""
FILE: backend/games/uno/logic.py
PURPOSE: Pure functions for UNO deck management, playability, card effects,
         and turn advancement.

FUNCTIONS:
  build_deck() → list[dict]
    Build the standard 108-card UNO deck. Each card is a dict:
    { color, type, value (or None), id (0–107) }

  shuffle_deck(deck) → list[dict]
    Returns a shuffled copy (uses random.shuffle in-place, returns same list).

  deal_hands(deck, num_players, cards_per_player=7) → (hands, remaining)
    Deals cards_per_player cards to each player from the front of deck.
    Returns (list_of_hands, remaining_deck).

  is_playable(card, discard_top, active_color) → bool
    Returns True if `card` can legally be played given the discard pile top
    and the currently active color. Wilds are always playable.

  apply_card_effect(state, card, chosen_color=None) → dict
    Applies the effect of a just-played card:
      - Skip → next player loses turn
      - Reverse → direction flips (with 2 players acts as Skip)
      - Draw Two → next player draws 2 cards and skips
      - Wild → active_color = chosen_color
      - Wild Draw Four → next player draws 4 cards and skips
    Advances current_player_index after effects.

  get_next_player_index(current, num_players, direction) → int
    Returns (current + direction) % num_players. Direction: 1 or -1.
"""

import copy
import random
from typing import List, Tuple, Optional

from games.uno.constants import COLORS, WILD_TYPES


def build_deck() -> List[dict]:
    """Build a standard 108-card UNO deck with unique IDs 0–107."""
    deck = []
    card_id = 0

    for color in COLORS:
        # Zero appears once per color
        deck.append({"color": color, "type": "number", "value": 0, "id": card_id})
        card_id += 1
        # 1–9 appear twice
        for val in range(1, 10):
            for _ in range(2):
                deck.append({"color": color, "type": "number", "value": val, "id": card_id})
                card_id += 1
        # Action cards × 2
        for ctype in ("skip", "reverse", "draw_two"):
            for _ in range(2):
                deck.append({"color": color, "type": ctype, "value": None, "id": card_id})
                card_id += 1

    # Wilds × 4, Wild Draw Four × 4
    for _ in range(4):
        deck.append({"color": "wild", "type": "wild",           "value": None, "id": card_id})
        card_id += 1
        deck.append({"color": "wild", "type": "wild_draw_four", "value": None, "id": card_id})
        card_id += 1

    assert len(deck) == 108, f"Deck has {len(deck)} cards, expected 108"
    return deck


def shuffle_deck(deck: List[dict]) -> List[dict]:
    random.shuffle(deck)
    return deck


def deal_hands(
    deck: List[dict], num_players: int, cards_per_player: int = 7
) -> Tuple[List[List[dict]], List[dict]]:
    """Deal cards to players. Returns (list_of_hands, remaining_deck)."""
    hands = [[] for _ in range(num_players)]
    for _ in range(cards_per_player):
        for i in range(num_players):
            hands[i].append(deck.pop(0))
    return hands, deck


def is_playable(card: dict, discard_top: dict, active_color: str) -> bool:
    """Return True if card can be played on the current discard pile top."""
    if card["type"] in WILD_TYPES:
        return True
    if card["color"] == active_color:
        return True
    if card["type"] == "number" and discard_top["type"] == "number" and card["value"] == discard_top["value"]:
        return True
    if card["type"] not in ("number",) and card["type"] == discard_top["type"]:
        return True
    return False


def get_next_player_index(current: int, num_players: int, direction: int) -> int:
    return (current + direction) % num_players


def apply_card_effect(state: dict, card: dict, chosen_color: Optional[str] = None) -> dict:
    """
    Apply effect of the played card to game state and advance the turn.
    Modifies and returns state.
    """
    n = len(state["players"])
    direction = state["direction"]
    current = state["current_player_index"]

    if card["type"] == "skip":
        # Skip next player — advance twice
        state["current_player_index"] = get_next_player_index(
            get_next_player_index(current, n, direction), n, direction
        )
        state["active_color"] = card["color"]

    elif card["type"] == "reverse":
        if n == 2:
            # With 2 players, Reverse acts as Skip
            state["direction"] = -direction
            state["current_player_index"] = get_next_player_index(
                get_next_player_index(current, n, -direction), n, -direction
            )
        else:
            state["direction"] = -direction
            state["current_player_index"] = get_next_player_index(current, n, -direction)
        state["active_color"] = card["color"]

    elif card["type"] == "draw_two":
        # Next player draws 2 and loses turn
        next_idx = get_next_player_index(current, n, direction)
        state["players"][next_idx]["hand"].extend(state["draw_pile"][:2])
        state["draw_pile"] = state["draw_pile"][2:]
        state["players"][next_idx]["hand_count"] = len(state["players"][next_idx]["hand"])
        # Skip that player
        state["current_player_index"] = get_next_player_index(next_idx, n, direction)
        state["active_color"] = card["color"]

    elif card["type"] == "wild":
        state["active_color"] = chosen_color or "red"
        state["current_player_index"] = get_next_player_index(current, n, direction)

    elif card["type"] == "wild_draw_four":
        next_idx = get_next_player_index(current, n, direction)
        state["players"][next_idx]["hand"].extend(state["draw_pile"][:4])
        state["draw_pile"] = state["draw_pile"][4:]
        state["players"][next_idx]["hand_count"] = len(state["players"][next_idx]["hand"])
        state["active_color"] = chosen_color or "red"
        state["current_player_index"] = get_next_player_index(next_idx, n, direction)

    else:
        # Number card — just advance turn
        state["active_color"] = card["color"]
        state["current_player_index"] = get_next_player_index(current, n, direction)

    state["draw_pile_count"] = len(state["draw_pile"])
    return state
