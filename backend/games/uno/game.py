"""
FILE: backend/games/uno/game.py
PURPOSE: UnoGame — concrete BaseGame for UNO.
         Manages hidden state (each player's private hand) and delegates
         deck/effect logic to logic.py.

CLASS: UnoGame(BaseGame)

KEY DESIGN — HIDDEN INFORMATION:
  Each player's hand is stored in self._state["players"][i]["hand"].
  get_state_for(socket_id) is OVERRIDDEN to strip other players' "hand" arrays,
  leaving only "hand_count". This prevents clients from seeing opponents' cards.
  The socket_handler calls get_state_for(p.socket_id) per player when broadcasting.

ACTIONS:
  "play_card"  — payload: { card_id: int, chosen_color?: str }
    Validates card is in hand, is playable, applies effect.
  "draw_card"  — payload: {}
    Draw 1 card. If drawn card is playable the player may choose to play or pass.
    (This implementation: draw and pass — player plays next turn if they want.)
  "call_uno"   — payload: {}
    Sets has_called_uno = True for the current player (called when hand → 1 card).

UNO PENALTY:
  If a player goes from 2→1 cards without calling UNO before the NEXT player acts,
  they draw 2. Tracked via has_called_uno flag.

UNO STATE SHAPE (see IMPLEMENTATION_PLAN.md §8.4):
  { phase, current_player_index, direction, discard_top, active_color,
    draw_pile_count, players:[{name, hand, hand_count, has_called_uno}],
    last_action_summary }
"""

import copy
import random
from typing import List, Optional

from games.base_game import BaseGame
from games.uno import logic
from games.uno.constants import WILD_TYPES
from models.player import Player


class UnoGame(BaseGame):
    def __init__(self, players: List[Player]):
        super().__init__(players)
        self._state: dict = {}
        self._winner_name: Optional[str] = None

    # ── BaseGame interface ────────────────────────────────────────────────────

    def initialize(self) -> dict:
        deck = logic.build_deck()
        logic.shuffle_deck(deck)
        hands, remaining = logic.deal_hands(deck, len(self.players), 7)

        # Flip starter card — re-flip if Wild or Wild Draw Four
        starter = None
        while remaining:
            candidate = remaining.pop(0)
            if candidate["type"] not in WILD_TYPES:
                starter = candidate
                break
            remaining.append(candidate)   # put wild at bottom, try again

        player_states = [
            {
                "name": p.name,
                "socket_id": p.socket_id,         # kept for get_state_for filtering
                "hand": hands[i],
                "hand_count": len(hands[i]),
                "has_called_uno": False,
            }
            for i, p in enumerate(self.players)
        ]

        self._state = {
            "phase": "playing",
            "current_player_index": 0,
            "direction": 1,                        # 1=clockwise, -1=counterclockwise
            "discard_top": starter,
            "active_color": starter["color"],
            "draw_pile": remaining,
            "draw_pile_count": len(remaining),
            "players": player_states,
            "last_action_summary": "Game started!",
        }
        return self.get_state()   # Return sanitized (no hands leaked)

    def apply_action(self, socket_id: str, action_type: str, payload: dict) -> dict:
        # Find acting player
        player_idx = next(
            (i for i, ps in enumerate(self._state["players"]) if ps["socket_id"] == socket_id),
            None,
        )
        if player_idx is None:
            raise ValueError("Player not found")

        current_idx = self._state["current_player_index"]

        if action_type == "call_uno":
            self._state["players"][player_idx]["has_called_uno"] = True
            self._state["last_action_summary"] = f"{self._state['players'][player_idx]['name']} called UNO!"
            return self._state

        if player_idx != current_idx:
            raise ValueError("Not your turn")

        # UNO penalty check: if previous player has 1 card and didn't call UNO
        # (They are the one who just played down to 1; now it's this player's turn)
        # We check if the previous player (before this action) had 1 card & no UNO call
        # This is enforced at the START of the NEXT player's action
        prev_idx = (current_idx - self._state["direction"]) % len(self._state["players"])
        prev_ps = self._state["players"][prev_idx]
        if prev_ps["hand_count"] == 1 and not prev_ps["has_called_uno"]:
            # Penalize previous player: draw 2
            self._draw_cards_for_player(prev_idx, 2)
            self._state["last_action_summary"] = f"{prev_ps['name']} forgot UNO! Drew 2 cards."

        if action_type == "play_card":
            return self._handle_play_card(player_idx, payload)
        elif action_type == "draw_card":
            return self._handle_draw_card(player_idx)
        else:
            raise ValueError(f"Unknown action: {action_type}")

    def is_game_over(self) -> bool:
        return self._state.get("phase") == "finished"

    def get_winner(self) -> Optional[str]:
        return self._winner_name

    def get_state(self) -> dict:
        """Return full state (includes all hands). Do not broadcast this directly."""
        return self._state

    def get_state_for(self, socket_id: str) -> dict:
        """
        Return a copy of state with other players' hands stripped.
        This is what gets broadcast to each individual player socket.
        """
        state = copy.deepcopy(self._state)
        for ps in state["players"]:
            if ps["socket_id"] != socket_id:
                ps.pop("hand", None)   # hide opponent's hand; keep hand_count
        # Also remove draw_pile contents (just keep count)
        state.pop("draw_pile", None)
        return state

    # ── Internal handlers ─────────────────────────────────────────────────────

    def _handle_play_card(self, player_idx: int, payload: dict) -> dict:
        card_id = payload.get("card_id")
        chosen_color = payload.get("chosen_color")

        ps = self._state["players"][player_idx]
        # Find card in hand
        card = next((c for c in ps["hand"] if c["id"] == card_id), None)
        if card is None:
            raise ValueError("Card not in hand")

        # Check playability
        discard_top  = self._state["discard_top"]
        active_color = self._state["active_color"]
        if not logic.is_playable(card, discard_top, active_color):
            raise ValueError("Card is not playable")

        # Wild requires a chosen_color
        if card["type"] in WILD_TYPES and not chosen_color:
            raise ValueError("chosen_color required for wild card")

        # Remove from hand
        ps["hand"] = [c for c in ps["hand"] if c["id"] != card_id]
        ps["hand_count"] = len(ps["hand"])
        ps["has_called_uno"] = False   # reset for next time

        # Update discard pile
        self._state["discard_top"] = card

        # Check for win BEFORE applying effect (empty hand = win)
        if ps["hand_count"] == 0:
            self._state["phase"] = "finished"
            self._winner_name = ps["name"]
            self._state["last_action_summary"] = f"{ps['name']} wins!"
            return self._state

        # Apply card effect (skips, reverses, draws, wild color)
        self._state = logic.apply_card_effect(self._state, card, chosen_color)
        self._state["last_action_summary"] = f"{ps['name']} played {card['color']} {card['type']}"
        return self._state

    def _handle_draw_card(self, player_idx: int) -> dict:
        ps = self._state["players"][player_idx]

        if not self._state["draw_pile"]:
            # Reshuffle discard pile into draw pile (keep top card)
            top = self._state["discard_top"]
            self._state["draw_pile"] = logic.shuffle_deck(self._state.get("_discard_history", []))
            self._state["discard_top"] = top

        drawn = self._state["draw_pile"].pop(0)
        ps["hand"].append(drawn)
        ps["hand_count"] += 1
        self._state["draw_pile_count"] = len(self._state["draw_pile"])

        # Advance turn (player draws and passes)
        n = len(self._state["players"])
        self._state["current_player_index"] = logic.get_next_player_index(
            player_idx, n, self._state["direction"]
        )
        self._state["last_action_summary"] = f"{ps['name']} drew a card"
        return self._state

    def _draw_cards_for_player(self, player_idx: int, count: int):
        ps = self._state["players"][player_idx]
        drawn = self._state["draw_pile"][:count]
        self._state["draw_pile"] = self._state["draw_pile"][count:]
        ps["hand"].extend(drawn)
        ps["hand_count"] = len(ps["hand"])
        self._state["draw_pile_count"] = len(self._state["draw_pile"])
