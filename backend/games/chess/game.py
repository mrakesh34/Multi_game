"""
FILE: backend/games/chess/game.py
PURPOSE: ChessGame — concrete BaseGame for Chess using python-chess as the
         authoritative rules engine. Frontend chess.js is UI-only.

CLASS: ChessGame(BaseGame)

RULES ENFORCED:
  - Slot 0 → White, Slot 1 → Black (assigned at initialize).
  - All move validation done by python-chess board.legal_moves.
  - Detects: checkmate, stalemate, 50-move rule, threefold repetition, insufficient material.
  - Draw offers: stored as draw_offer_from (socket_id). Opponent must accept/decline.
  - Resign: sets phase="resigned", game_over=True.

ACTIONS (see IMPLEMENTATION_PLAN.md §8.3):
  "move"         — payload: {from, to, promotion (optional)}
  "resign"       — payload: {}
  "offer_draw"   — payload: {}
  "accept_draw"  — payload: {}
  "decline_draw" — payload: {}

CHESS STATE SHAPE:
  {
    "fen": str,
    "turn": "white" | "black",
    "phase": "playing" | "check" | "checkmate" | "stalemate" | "draw" | "resigned",
    "players": [ {name, color}, ... ],
    "move_history": [str, ...],     # UCI notation
    "last_move": {from, to} | None,
    "draw_offer_from": str | None,
    "captured_by_white": [str, ...],
    "captured_by_black": [str, ...],
  }
"""

import chess
from typing import List, Optional

from games.base_game import BaseGame
from games.chess.constants import PIECE_SYMBOLS, COLORS
from models.player import Player


class ChessGame(BaseGame):
    def __init__(self, players: List[Player]):
        super().__init__(players)
        self.board = chess.Board()
        self._state: dict = {}
        self._game_over = False
        self._winner_name: Optional[str] = None
        self.draw_offer_from: Optional[str] = None

    def initialize(self) -> dict:
        self.board = chess.Board()
        self._game_over = False
        self._winner_name = None

        self._state = {
            "fen": self.board.fen(),
            "turn": "white",
            "phase": "playing",
            "players": [
                {"name": p.name, "color": COLORS[p.slot]}
                for p in self.players
            ],
            "move_history": [],
            "last_move": None,
            "draw_offer_from": None,
            "captured_by_white": [],
            "captured_by_black": [],
            "last_action_summary": "Game started",
        }
        return self._state

    def apply_action(self, socket_id: str, action_type: str, payload: dict) -> dict:
        # Determine which color this socket controls
        player = next((p for p in self.players if p.socket_id == socket_id), None)
        if player is None:
            raise ValueError("Player not in game")

        my_color = COLORS[player.slot]  # "white" or "black"

        if action_type == "move":
            if self._game_over:
                raise ValueError("Game is over")
            if self._state["turn"] != my_color:
                raise ValueError("Not your turn")
            self._handle_move(socket_id, payload, my_color)

        elif action_type == "resign":
            self._handle_resign(socket_id, my_color)

        elif action_type == "offer_draw":
            self.draw_offer_from = socket_id
            self._state["draw_offer_from"] = socket_id
            self._state["last_action_summary"] = f"{player.name} offered a draw"

        elif action_type == "accept_draw":
            if self.draw_offer_from is None or self.draw_offer_from == socket_id:
                raise ValueError("No draw offer to accept")
            self._state["phase"] = "draw"
            self._game_over = True
            self._winner_name = None
            self._state["last_action_summary"] = "Draw accepted"

        elif action_type == "decline_draw":
            self.draw_offer_from = None
            self._state["draw_offer_from"] = None
            self._state["last_action_summary"] = f"{player.name} declined the draw"

        else:
            raise ValueError(f"Unknown action: {action_type}")

        return self._state

    def _handle_move(self, socket_id: str, payload: dict, my_color: str):
        from_sq = payload.get("from", "")
        to_sq   = payload.get("to", "")
        promo   = payload.get("promotion", "")

        uci = from_sq + to_sq + (promo.lower() if promo else "")
        try:
            move = chess.Move.from_uci(uci)
        except Exception:
            raise ValueError(f"Invalid UCI: {uci}")

        if move not in self.board.legal_moves:
            raise ValueError("Illegal move")

        # Track captures before pushing
        captured = self.board.piece_at(move.to_square)

        self.board.push(move)

        # Record the capture
        if captured:
            sym = PIECE_SYMBOLS.get(captured.piece_type, "?")
            if my_color == "white":
                self._state["captured_by_white"].append(sym)
            else:
                self._state["captured_by_black"].append(sym)

        # Update move history
        self._state["move_history"].append(uci)
        self._state["last_move"] = {"from": from_sq, "to": to_sq}
        self._state["draw_offer_from"] = None
        self.draw_offer_from = None

        # Determine new phase
        if self.board.is_checkmate():
            self._state["phase"] = "checkmate"
            self._game_over = True
            self._winner_name = next(
                p.name for p in self.players if COLORS[p.slot] == my_color
            )
        elif self.board.is_stalemate():
            self._state["phase"] = "stalemate"
            self._game_over = True
        elif self.board.is_insufficient_material() or self.board.is_fifty_moves() or self.board.is_repetition():
            self._state["phase"] = "draw"
            self._game_over = True
        elif self.board.is_check():
            self._state["phase"] = "check"
        else:
            self._state["phase"] = "playing"

        self._state["fen"]  = self.board.fen()
        self._state["turn"] = "white" if self.board.turn == chess.WHITE else "black"
        self._state["last_action_summary"] = f"{my_color.capitalize()} played {uci}"

    def _handle_resign(self, socket_id: str, my_color: str):
        self._state["phase"] = "resigned"
        self._game_over = True
        # Winner is the opponent
        opponent_color = "black" if my_color == "white" else "white"
        self._winner_name = next(
            (p.name for p in self.players if COLORS[p.slot] == opponent_color), None
        )
        self._state["last_action_summary"] = f"{my_color.capitalize()} resigned"

    def is_game_over(self) -> bool:
        return self._game_over

    def get_winner(self) -> Optional[str]:
        return self._winner_name

    def get_state(self) -> dict:
        return self._state
