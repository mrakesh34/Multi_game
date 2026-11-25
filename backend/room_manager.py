"""
FILE: backend/room_manager.py
PURPOSE: Singleton in-memory store for all active game rooms.
         This is the ONLY place that creates, modifies, or destroys Room objects.
         No other file should mutate room/player state directly.

KEY RESPONSIBILITIES:
  - generate_room_id()      : Pick a random unused 3-digit ID ("000"–"999")
  - create_room()           : Instantiate a new Room + add the host as Player slot 0
  - get_room()              : Look up a Room by room_id string
  - get_room_by_socket()    : Reverse-lookup which room a socket_id currently belongs to
  - join_room()             : Add a new Player to a room (validates capacity & name uniqueness)
  - leave_room()            : Remove a Player; transfer host if needed; delete empty rooms
  - mark_disconnected()     : Called on socket "disconnect" — saves disconnect_time, is_connected=False
  - try_reconnect()         : Match player by name+room, check 60-s TTL, restore their slot
  - cleanup_expired_disconnects(): Called at the top of every handler — evicts stale slots

ROOM STATE DICT SHAPE (see IMPLEMENTATION_PLAN.md §4.2):
  rooms = { "742": Room, ... }

ERRORS:
  Raises ValueError with a descriptive code string on bad operations.
  Callers (socket_handler.py) catch these and emit room_error to the client.
"""

import random
import time
from typing import Dict, Optional, Tuple

from config import RECONNECT_TTL, MAX_PLAYERS, MIN_ROOM_ID, MAX_ROOM_ID
from models.player import Player
from models.room import Room


class RoomManager:
    def __init__(self):
        # Main store: room_id (str "000"–"999") → Room
        self.rooms: Dict[str, Room] = {}

    # ── Room ID helpers ───────────────────────────────────────────────────────

    def generate_room_id(self) -> str:
        """Return a random unused 3-digit zero-padded room ID string."""
        for _ in range(200):
            rid = f"{random.randint(MIN_ROOM_ID, MAX_ROOM_ID):03d}"
            if rid not in self.rooms:
                return rid
        raise ValueError("NO_ROOMS_AVAILABLE")

    # ── CRUD operations ───────────────────────────────────────────────────────

    def create_room(self, game: str, host_socket_id: str, host_name: str, custom_room_id: Optional[str] = None) -> Tuple[Room, Player]:
        """Create a new room and add the host as the first player."""
        if game not in MAX_PLAYERS:
            raise ValueError("INVALID_GAME")

        if custom_room_id:
            room_id = str(custom_room_id).strip()
            if room_id.isdigit() and len(room_id) < 3:
                room_id = room_id.zfill(3)
            if not room_id.isalnum() or len(room_id) < 3 or len(room_id) > 6:
                raise ValueError("INVALID_ROOM_ID")
            if room_id in self.rooms:
                raise ValueError("ROOM_ALREADY_EXISTS")
        else:
            room_id = self.generate_room_id()

        host = Player(
            socket_id=host_socket_id,
            name=host_name,
            slot=0,
            is_host=True,
            is_ready=False,
            is_connected=True,
            disconnect_time=None,
            color_index=0,
        )
        room = Room(
            room_id=room_id,
            game=game,
            status="waiting",
            created_at=time.time(),
            host_socket_id=host_socket_id,
            players=[host],
            game_state=None,
            chat_log=[],
        )
        self.rooms[room_id] = room
        return room, host

    def get_room(self, room_id: str) -> Optional[Room]:
        return self.rooms.get(room_id)

    def get_room_by_socket(self, socket_id: str) -> Optional[Room]:
        for room in self.rooms.values():
            for p in room.players:
                if p.socket_id == socket_id:
                    return room
        return None

    def join_room(self, room_id: str, socket_id: str, name: str) -> Tuple[Room, Player]:
        """Add a player to a room. Validates capacity, name uniqueness, and status."""
        room = self.get_room(room_id)
        if room is None:
            raise ValueError("ROOM_NOT_FOUND")

        # Reject if game already started (non-reconnect path)
        if room.status == "playing":
            raise ValueError("ROOM_STARTED")

        # Reject if name taken (case-insensitive), unless reclaiming own disconnected slot in waiting lobby
        existing = next((p for p in room.players if p.name.lower() == name.lower()), None)
        if existing is not None:
            if room.status == "waiting" and not existing.is_connected:
                existing.socket_id = socket_id
                existing.is_connected = True
                existing.disconnect_time = None
                if existing.is_host:
                    room.host_socket_id = socket_id
                return room, existing
            raise ValueError("NAME_TAKEN")

        # Reject if room is full
        connected = [p for p in room.players if p.is_connected or p.disconnect_time is not None]
        if len(connected) >= MAX_PLAYERS[room.game]:
            raise ValueError("ROOM_FULL")

        slot = len(room.players)
        player = Player(
            socket_id=socket_id,
            name=name,
            slot=slot,
            is_host=False,
            is_ready=False,
            is_connected=True,
            disconnect_time=None,
            color_index=slot,
        )
        room.players.append(player)
        return room, player

    def leave_room(self, socket_id: str) -> Optional[Tuple[Room, Player]]:
        """Remove a player who explicitly left. Transfer host if needed."""
        room = self.get_room_by_socket(socket_id)
        if room is None:
            return None

        player = next((p for p in room.players if p.socket_id == socket_id), None)
        if player is None:
            return None

        room.players = [p for p in room.players if p.socket_id != socket_id]

        # Clean up empty rooms
        if not room.players:
            del self.rooms[room.room_id]
            return room, player

        # Transfer host to next connected player
        if player.is_host and room.players:
            new_host = next((p for p in room.players if p.is_connected), room.players[0])
            new_host.is_host = True
            room.host_socket_id = new_host.socket_id

        return room, player

    # ── Reconnect logic ───────────────────────────────────────────────────────

    def mark_disconnected(self, socket_id: str) -> Optional[Room]:
        """Called when a socket drops. Marks player as disconnected but keeps slot."""
        room = self.get_room_by_socket(socket_id)
        if room is None:
            return None
        player = next((p for p in room.players if p.socket_id == socket_id), None)
        if player:
            player.is_connected = False
            player.disconnect_time = time.time()
        return room

    def try_reconnect(self, room_id: str, name: str, new_socket_id: str) -> Optional[Player]:
        """
        Match a player by name in the given room.
        If found within RECONNECT_TTL seconds, restore their socket and mark connected.
        Returns the Player object on success, None otherwise.
        """
        room = self.get_room(room_id)
        if room is None:
            return None

        player = next(
            (p for p in room.players if p.name.lower() == name.lower()),
            None,
        )
        if player is None:
            return None

        # Check TTL if player had a recorded disconnect_time
        if player.disconnect_time is not None and (time.time() - player.disconnect_time > RECONNECT_TTL):
            return None

        # Restore slot
        player.socket_id = new_socket_id
        player.is_connected = True
        player.disconnect_time = None

        # If reconnecting player was the host, update room record too
        if player.is_host:
            room.host_socket_id = new_socket_id

        return player

    def cleanup_expired_disconnects(self, waiting_ttl: Optional[float] = None):
        """
        Remove players whose reconnect window has expired.
        Uses waiting_ttl (if provided) for 'waiting' rooms and RECONNECT_TTL (60 s) otherwise.
        Transfers host if the expired player was host and removes empty rooms.
        Returns a list of eviction dicts so callers can broadcast player_left.
        """
        now = time.time()
        to_delete = []
        evictions = []

        for room_id, room in self.rooms.items():
            ttl = waiting_ttl if (waiting_ttl is not None and room.status == "waiting") else RECONNECT_TTL
            kept = []
            removed = []
            for p in room.players:
                if p.is_connected or (p.disconnect_time is not None and now - p.disconnect_time <= ttl):
                    kept.append(p)
                else:
                    removed.append(p)

            if not removed:
                continue

            room.players = kept
            if not room.players:
                to_delete.append(room_id)
                continue

            if any(p.is_host for p in removed) or not any(p.is_host for p in room.players):
                for p in room.players:
                    p.is_host = False
                new_host = next((p for p in room.players if p.is_connected), room.players[0])
                new_host.is_host = True
                room.host_socket_id = new_host.socket_id
            else:
                new_host = next((p for p in room.players if p.is_host), None)

            evictions.append({
                "room_id": room_id,
                "removed_names": [p.name for p in removed],
                "room": room,
                "new_host": new_host.socket_id if new_host else None,
            })

        for rid in to_delete:
            del self.rooms[rid]

        return evictions


# ── Global singleton ──────────────────────────────────────────────────────────
# Import this instance everywhere: `from room_manager import room_manager`
room_manager = RoomManager()
