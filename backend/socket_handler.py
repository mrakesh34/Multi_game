"""
FILE: backend/socket_handler.py
PURPOSE: Registers ALL Socket.IO event handlers on the sio server instance.
         This is the single entry point for client ↔ server real-time communication.

HOW IT WORKS:
  - register_handlers(sio) is called once from main.py at startup.
  - Each handler is an async function decorated with @sio.event or @sio.on().
  - Every handler calls room_manager.cleanup_expired_disconnects() first.
  - Handlers validate input, call room_manager or game methods, then emit events.
  - On any error: emit "room_error" (room-level) or "error" (generic) to the sender.

EVENT FLOW SUMMARY (see IMPLEMENTATION_PLAN.md §6.4):
  create_room    → room_created (to sender) + player_joined (to room)
  join_room      → room_joined  (to sender) + player_joined (to room)
  reconnect_room → game_state_update (to sender) + player_reconnected (to room)
  disconnect     → player_disconnected (to room)
  leave_room     → player_left (to room)
  toggle_ready   → player_ready_changed (to room)
  start_game     → game_started (to room)
  game_action    → game_state_update (to room) [+ game_over if applicable]
  chat_message   → chat_broadcast (to room)

EMIT HELPERS:
  emit_to(sio, sid, event, data)        — send to one socket
  emit_to_room(sio, room_id, event, data) — broadcast to all sockets in room
"""

import time
from typing import Any

import socketio

from config import MAX_CHAT_LOG
from room_manager import room_manager
from games import GAME_REGISTRY


def register_handlers(sio: socketio.AsyncServer):

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def _emit_error(sid, code: str, message: str):
        await sio.emit("room_error", {"code": code, "message": message}, to=sid)

    def _player_dict(p) -> dict:
        return {
            "socket_id": p.socket_id,
            "name": p.name,
            "slot": p.slot,
            "is_host": p.is_host,
            "is_ready": p.is_ready,
            "is_connected": p.is_connected,
            "color_index": p.color_index,
        }

    # ── create_room ───────────────────────────────────────────────────────────

    @sio.on("create_room")
    async def on_create_room(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        try:
            game = data.get("game", "")
            name = data.get("player_name", "").strip()
            if not name:
                return await _emit_error(sid, "INVALID_NAME", "Name is required.")

            room, player = room_manager.create_room(game, sid, name)
            await sio.enter_room(sid, room.room_id)

            # Confirm to creator
            await sio.emit("room_created", {
                "room_id": room.room_id,
                "game": room.game,
                "player": _player_dict(player),
            }, to=sid)

            # Broadcast to room (just the creator at this point)
            await sio.emit("player_joined", {
                "player": _player_dict(player),
                "players": [_player_dict(p) for p in room.players],
            }, room=room.room_id)

        except ValueError as e:
            await _emit_error(sid, str(e), str(e))

    # ── join_room ─────────────────────────────────────────────────────────────

    @sio.on("join_room")
    async def on_join_room(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        try:
            room_id = str(data.get("room_id", "")).zfill(3)
            name = data.get("player_name", "").strip()

            room, player = room_manager.join_room(room_id, sid, name)
            await sio.enter_room(sid, room.room_id)

            await sio.emit("room_joined", {
                "room_id": room.room_id,
                "game": room.game,
                "players": [_player_dict(p) for p in room.players],
                "chat_log": room.chat_log[-20:],
            }, to=sid)

            await sio.emit("player_joined", {
                "player": _player_dict(player),
                "players": [_player_dict(p) for p in room.players],
            }, room=room.room_id)

        except ValueError as e:
            await _emit_error(sid, str(e), str(e))

    # ── reconnect_room ────────────────────────────────────────────────────────

    @sio.on("reconnect_room")
    async def on_reconnect_room(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        try:
            room_id = str(data.get("room_id", "")).zfill(3)
            name = data.get("player_name", "").strip()

            player = room_manager.try_reconnect(room_id, name, sid)
            if player is None:
                return await _emit_error(sid, "RECONNECT_FAILED", "Could not reconnect. Session expired or player not found.")

            room = room_manager.get_room(room_id)
            await sio.enter_room(sid, room_id)

            # Send current game state to reconnecting player
            if room.game_state is not None and room.room_id in _game_instances:
                game_obj = _game_instances[room.room_id]
                state = game_obj.get_state_for(sid)
            else:
                state = room.game_state

            await sio.emit("game_state_update", {
                "game_state": state,
                "action_summary": f"{name} reconnected",
            }, to=sid)

            await sio.emit("player_reconnected", {
                "socket_id": sid,
                "player_name": name,
                "players": [_player_dict(p) for p in room.players],
            }, room=room_id)

        except Exception as e:
            await _emit_error(sid, "ERROR", str(e))

    # ── disconnect ────────────────────────────────────────────────────────────

    @sio.on("disconnect")
    async def on_disconnect(sid: str):
        room = room_manager.mark_disconnected(sid)
        if room is None:
            return

        player = next((p for p in room.players if p.socket_id == sid), None)
        if player:
            await sio.emit("player_disconnected", {
                "socket_id": sid,
                "player_name": player.name,
                "reconnect_expires_at": time.time() + 60,
            }, room=room.room_id)

    # ── leave_room ────────────────────────────────────────────────────────────

    @sio.on("leave_room")
    async def on_leave_room(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        result = room_manager.leave_room(sid)
        if result is None:
            return
        room, player = result
        await sio.leave_room(sid, room.room_id)

        # Only broadcast if room still exists (wasn't emptied)
        if room.room_id in room_manager.rooms:
            new_host = next((p for p in room.players if p.is_host), None)
            await sio.emit("player_left", {
                "player_name": player.name,
                "players": [_player_dict(p) for p in room.players],
                "new_host": new_host.socket_id if new_host else None,
            }, room=room.room_id)

    # ── toggle_ready ──────────────────────────────────────────────────────────

    @sio.on("toggle_ready")
    async def on_toggle_ready(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        room = room_manager.get_room_by_socket(sid)
        if room is None:
            return
        player = next((p for p in room.players if p.socket_id == sid), None)
        if player is None:
            return
        player.is_ready = not player.is_ready

        await sio.emit("player_ready_changed", {
            "socket_id": sid,
            "is_ready": player.is_ready,
            "players": [_player_dict(p) for p in room.players],
        }, room=room.room_id)

    # ── start_game ────────────────────────────────────────────────────────────

    # In-memory map of room_id → active game object instance
    _game_instances: dict = {}

    @sio.on("start_game")
    async def on_start_game(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        room = room_manager.get_room_by_socket(sid)
        if room is None:
            return await _emit_error(sid, "NOT_IN_ROOM", "You are not in a room.")

        # Only host can start
        if room.host_socket_id != sid:
            return await _emit_error(sid, "NOT_HOST", "Only the host can start the game.")

        # All connected players must be ready
        connected = [p for p in room.players if p.is_connected]
        if not all(p.is_ready or p.is_host for p in connected):
            return await _emit_error(sid, "NOT_ALL_READY", "All players must be ready.")

        # Minimum player count
        from config import MAX_PLAYERS
        min_players = 2
        if len(connected) < min_players:
            return await _emit_error(sid, "NOT_ENOUGH_PLAYERS", f"Need at least {min_players} players.")

        try:
            GameClass = GAME_REGISTRY[room.game]
            game_obj = GameClass(room.players)
            initial_state = game_obj.initialize()
            room.game_state = initial_state
            room.status = "playing"
            _game_instances[room.room_id] = game_obj

            await sio.emit("game_started", {"game_state": initial_state}, room=room.room_id)

        except Exception as e:
            await _emit_error(sid, "START_FAILED", str(e))

    # ── game_action ───────────────────────────────────────────────────────────

    @sio.on("game_action")
    async def on_game_action(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        room = room_manager.get_room_by_socket(sid)
        if room is None or room.room_id not in _game_instances:
            return await _emit_error(sid, "NO_GAME", "No active game found.")

        game_obj = _game_instances[room.room_id]
        action_type = data.get("action_type", "")
        payload = data.get("payload", {})

        try:
            updated_state = game_obj.apply_action(sid, action_type, payload)
            room.game_state = updated_state

            # For UNO, send personalized state per socket; others get full state
            for p in room.players:
                if p.is_connected:
                    state_for = game_obj.get_state_for(p.socket_id)
                    await sio.emit("game_state_update", {
                        "game_state": state_for,
                        "action_summary": updated_state.get("last_action_summary", ""),
                    }, to=p.socket_id)

            # Check game over
            if game_obj.is_game_over():
                room.status = "finished"
                winner = game_obj.get_winner()
                await sio.emit("game_over", {
                    "winner_name": winner,
                    "reason": "normal",
                    "final_state": game_obj.get_state(),
                }, room=room.room_id)
                del _game_instances[room.room_id]

        except ValueError as e:
            await _emit_error(sid, "INVALID_ACTION", str(e))

    # ── chat_message ──────────────────────────────────────────────────────────

    @sio.on("chat_message")
    async def on_chat_message(sid: str, data: dict = None):
        room_manager.cleanup_expired_disconnects()
        data = data or {}
        room = room_manager.get_room_by_socket(sid)
        if room is None:
            return
        player = next((p for p in room.players if p.socket_id == sid), None)
        if player is None:
            return

        text = str(data.get("text", "")).strip()[:200]
        if not text:
            return

        msg = {
            "from_name": player.name,
            "text": text,
            "timestamp": time.time(),
        }
        room.chat_log.append(msg)
        if len(room.chat_log) > MAX_CHAT_LOG:
            room.chat_log = room.chat_log[-MAX_CHAT_LOG:]

        await sio.emit("chat_broadcast", msg, room=room.room_id)
