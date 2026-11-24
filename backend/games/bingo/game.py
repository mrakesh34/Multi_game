"""
FILE: backend/games/bingo/game.py
PURPOSE: BingoGame — 1–25 classic paper-and-pen Bingo variant.

RULES IMPLEMENTED:
  - Each player gets a 5×5 card with numbers 1 to 25 shuffled randomly.
  - Players can re-shuffle their own card before the first number is called.
  - Players take turns calling any uncrossed number from 1 to 25.
  - The called number is marked/crossed out on ALL players' cards.
  - Completing any 5-in-a-row (row, column, or diagonal) = 1 line.
  - 1 line = 'B', 2 lines = 'I', 3 lines = 'N', 4 lines = 'G', 5 lines = 'O' (BINGO!).
  - When a number completes 5 lines for multiple players, the caller gets priority win.
  - If more than 2 players are playing, when someone wins, they are placed on the podium
    (1st, 2nd, etc.) and the remaining players keep playing until only 1 remains!
"""

import copy
from typing import List, Optional

from games.base_game import BaseGame
from games.bingo import logic
from games.bingo.constants import GRID_SIZE, TOTAL_NUMBERS, WIN_LINES_TARGET, BINGO_LETTERS
from models.player import Player


class BingoGame(BaseGame):
    def __init__(self, players: List[Player]):
        super().__init__(players)
        self._state: dict = {}
        self._winners: List[dict] = []  # List of {"name": str, "rank": int}

    def initialize(self) -> dict:
        self._winners = []
        player_states = []

        for p in self.players:
            card = logic.generate_card()
            marked = [[False] * GRID_SIZE for _ in range(GRID_SIZE)]
            player_states.append({
                "name": p.name,
                "socket_id": p.socket_id,
                "card": card,
                "marked": marked,
                "lines_count": 0,
                "letters": "",
                "has_bingo": False,
                "is_finished": False,
                "rank": None,
            })

        self._state = {
            "phase": "playing",
            "called_numbers": [],
            "current_number": None,
            "caller_turn_index": 0,
            "winners": [],
            "players": player_states,
            "last_action_summary": "Game started! Pick any number on your card.",
        }
        return self._state

    def update_player_socket(self, name: str, new_socket_id: str):
        for ps in self._state.get("players", []):
            if ps.get("name", "").strip().lower() == name.strip().lower():
                ps["socket_id"] = new_socket_id

    def apply_action(self, socket_id: str, action_type: str, payload: dict) -> dict:
        payload = payload or {}

        # ── Shuffle card action (allowed before first number is called) ────────
        if action_type == "shuffle_card":
            if len(self._state["called_numbers"]) > 0:
                raise ValueError("Cannot shuffle after the game has started")
            room_player = next((rp for rp in self.players if rp.socket_id == socket_id), None)
            ps = next(
                (p for p in self._state["players"]
                 if p["socket_id"] == socket_id or (room_player and p["name"].strip().lower() == room_player.name.strip().lower())),
                None,
            )
            if not ps:
                raise ValueError("Player not found")
            ps["socket_id"] = socket_id
            ps["card"] = logic.generate_card()
            self._state["last_action_summary"] = f"{ps['name']} shuffled their card"
            return self._state

        # ── Pick number action ────────────────────────────────────────────────
        if action_type != "pick_number":
            raise ValueError(f"Unknown action: {action_type}")

        caller_idx = self._state["caller_turn_index"]
        caller_player = self._state["players"][caller_idx]

        room_player = next((rp for rp in self.players if rp.socket_id == socket_id), None)
        is_caller = (caller_player["socket_id"] == socket_id) or (
            room_player and caller_player["name"].strip().lower() == room_player.name.strip().lower()
        )
        if not is_caller:
            raise ValueError("Not your turn to pick a number")

        # Keep socket_id synced in state
        caller_player["socket_id"] = socket_id

        number = payload.get("number")
        if not isinstance(number, int) or number < 1 or number > TOTAL_NUMBERS:
            raise ValueError(f"Invalid number: {number}")

        if number in self._state["called_numbers"]:
            raise ValueError(f"Number {number} was already called")

        # Record call
        self._state["called_numbers"].append(number)
        self._state["current_number"] = number

        # Mark number on all players' cards
        for ps in self._state["players"]:
            logic.mark_number(ps["card"], ps["marked"], number)
            lines = logic.count_completed_lines(ps["marked"])
            ps["lines_count"] = lines
            # Letters string (e.g. 1 -> "B", 2 -> "B I", 5 -> "B I N G O")
            letters_count = min(lines, WIN_LINES_TARGET)
            ps["letters"] = " ".join(BINGO_LETTERS[:letters_count])

        # ── Win Detection with Caller Priority ────────────────────────────────
        # Priority rule: Check calling player first!
        newly_won = []
        if not caller_player["is_finished"] and caller_player["lines_count"] >= WIN_LINES_TARGET:
            newly_won.append(caller_player)

        # Then check any other players who reached 5+ lines on this number
        for ps in self._state["players"]:
            if ps["socket_id"] != caller_player["socket_id"]:
                if not ps["is_finished"] and ps["lines_count"] >= WIN_LINES_TARGET:
                    newly_won.append(ps)

        # Assign ranks to newly won players
        for ps in newly_won:
            rank = len(self._winners) + 1
            ps["has_bingo"] = True
            ps["is_finished"] = True
            ps["rank"] = rank
            self._winners.append({"name": ps["name"], "rank": rank})

        self._state["winners"] = copy.deepcopy(self._winners)

        # ── Multi-player continuation check ───────────────────────────────────
        active_players = [p for p in self._state["players"] if not p["is_finished"]]
        total_players_count = len(self._state["players"])

        # Game is over when 1 or fewer players remain active, or all 25 numbers called
        if len(active_players) <= (1 if total_players_count > 1 else 0) or len(self._state["called_numbers"]) >= TOTAL_NUMBERS:
            self._state["phase"] = "finished"
            # If 1 remaining player, give them the final rank
            if len(active_players) == 1 and total_players_count > 1:
                last_p = active_players[0]
                last_p["rank"] = len(self._winners) + 1
                self._winners.append({"name": last_p["name"], "rank": last_p["rank"]})
                self._state["winners"] = copy.deepcopy(self._winners)
        else:
            # Game keeps playing for remaining positions!
            # Advance caller to the next UNFINISHED player
            n = len(self._state["players"])
            next_idx = (caller_idx + 1) % n
            for _ in range(n):
                if not self._state["players"][next_idx]["is_finished"]:
                    break
                next_idx = (next_idx + 1) % n
            self._state["caller_turn_index"] = next_idx

        # Update action summary
        caller_name = caller_player["name"]
        if newly_won:
            winners_str = ", ".join(w["name"] for w in newly_won)
            self._state["last_action_summary"] = f"{caller_name} called {number}! BINGO for {winners_str}!"
        else:
            self._state["last_action_summary"] = f"{caller_name} called {number}"

        return self._state

    def is_game_over(self) -> bool:
        return self._state.get("phase") == "finished"

    def get_winner(self) -> Optional[str]:
        if self._winners:
            return self._winners[0]["name"]
        return None

    def get_state(self) -> dict:
        return self._state
