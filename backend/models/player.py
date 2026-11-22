"""
FILE: backend/models/player.py
PURPOSE: Defines the Player dataclass — the canonical representation of one
         participant in a room.

FIELDS (see IMPLEMENTATION_PLAN.md §4.1):
  socket_id      : Current Socket.IO SID. Changes on reconnect.
  name           : Display name (1–20 chars), unique within a room (case-insensitive).
  slot           : Join order (0 = first/host). Used to assign game colors.
  is_host        : True for the room creator (or the new host after transfer).
  is_ready       : Toggled by the player in the lobby. Host is auto-ready when starting.
  is_connected   : False after a socket disconnect; True after reconnect.
  disconnect_time: Unix timestamp set on disconnect; cleared on reconnect.
  color_index    : Maps to game color array (Ludo: 0=Red 1=Green 2=Yellow 3=Blue).

USAGE:
  player = Player(socket_id="abc", name="BlueFox42", slot=0, ...)
  player_dict = dataclasses.asdict(player)   # for JSON serialization
"""

import dataclasses
from typing import Optional


@dataclasses.dataclass
class Player:
    socket_id:       str
    name:            str
    slot:            int
    is_host:         bool
    is_ready:        bool
    is_connected:    bool
    disconnect_time: Optional[float]  # Unix timestamp or None
    color_index:     int
