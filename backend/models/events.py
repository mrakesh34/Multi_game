"""
FILE: backend/models/events.py
PURPOSE: Pydantic v2 models for validating incoming Socket.IO event payloads.
         Using these ensures that malformed client data fails loudly with a
         clear error rather than causing a KeyError deep in game logic.

MODELS:
  CreateRoomPayload  — payload for "create_room" event
  JoinRoomPayload    — payload for "join_room" event
  ReconnectPayload   — payload for "reconnect_room" event
  GameActionPayload  — payload for "game_action" event (wraps per-game actions)
  ChatMessagePayload — payload for "chat_message" event

USAGE (in socket_handler.py):
  try:
      data = CreateRoomPayload(**raw_data)
  except ValidationError as e:
      await emit_error(sid, "INVALID_PAYLOAD", str(e))
      return
"""

from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator


class CreateRoomPayload(BaseModel):
    game:        str = Field(..., pattern="^(ludo|bingo|chess|uno)$")
    player_name: str = Field(..., min_length=1, max_length=20)


class JoinRoomPayload(BaseModel):
    room_id:     str = Field(..., min_length=1, max_length=3)
    player_name: str = Field(..., min_length=1, max_length=20)

    @field_validator("room_id")
    @classmethod
    def pad_room_id(cls, v: str) -> str:
        return v.zfill(3)


class ReconnectPayload(BaseModel):
    room_id:     str = Field(..., min_length=1, max_length=3)
    player_name: str = Field(..., min_length=1, max_length=20)

    @field_validator("room_id")
    @classmethod
    def pad_room_id(cls, v: str) -> str:
        return v.zfill(3)


class GameActionPayload(BaseModel):
    action_type: str = Field(..., min_length=1)
    payload:     dict = Field(default_factory=dict)


class ChatMessagePayload(BaseModel):
    text: str = Field(..., min_length=1, max_length=200)
