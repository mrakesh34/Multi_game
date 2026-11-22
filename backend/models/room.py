"""
FILE: backend/models/room.py
PURPOSE: Defines the Room dataclass — one entry in RoomManager.rooms.

FIELDS (see IMPLEMENTATION_PLAN.md §4.2):
  room_id        : "000" to "999" zero-padded string. Human-shareable.
  game           : "ludo" | "bingo" | "chess" | "uno"
  status         : "waiting" | "playing" | "finished"
  created_at     : time.time() at creation; used for cleanup of stale rooms.
  host_socket_id : socket_id of current host. Updated on host transfer / reconnect.
  players        : Ordered list of Player objects. Index = join order.
  game_state     : None until game starts; then holds the full game state dict.
                   This is the authoritative server-side game state.
  chat_log       : List of ChatMessage dicts (max MAX_CHAT_LOG = 100).
                   Recent 20 sent to new joiners via room_joined event.

USAGE:
  room = Room(room_id="742", game="ludo", ...)
  room.game_state = ludo_game.initialize()
"""

import dataclasses
from typing import List, Optional

from models.player import Player


@dataclasses.dataclass
class Room:
    room_id:        str
    game:           str
    status:         str              # "waiting" | "playing" | "finished"
    created_at:     float
    host_socket_id: str
    players:        List[Player]
    game_state:     Optional[dict]   # None until game starts
    chat_log:       List[dict]       # List of ChatMessage dicts
