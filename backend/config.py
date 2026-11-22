"""
FILE: backend/config.py
PURPOSE: Central configuration constants for the entire backend server.
         All tuneable values live here — never hardcode these in other files.
         Import this module wherever a constant is needed.

CONSTANTS:
  - PORT            : The port uvicorn listens on (8000)
  - FRONTEND_ORIGINS: List of allowed CORS/WebSocket origins for Socket.IO
  - RECONNECT_TTL   : How many seconds the server holds a disconnected player's
                      slot before dropping them permanently (60 s)
  - MAX_CHAT_LOG    : Maximum chat messages stored per room (100)
  - MAX_ROOM_ID     : Upper bound for room ID generation (999)
  - MIN_ROOM_ID     : Lower bound for room ID generation (0)
  - MAX_PLAYERS     : Per-game player-count limits used by room_manager
"""

PORT = 8000
FRONTEND_ORIGINS = ["http://localhost:5173", "http://localhost:4173"]

RECONNECT_TTL = 60          # seconds to hold disconnected player's slot
MAX_CHAT_LOG  = 100         # max chat messages stored per room
MAX_ROOM_ID   = 999
MIN_ROOM_ID   = 0

# Max players allowed per game type — used by RoomManager.join_room()
MAX_PLAYERS = {
    "ludo":  4,
    "bingo": 6,
    "chess": 2,
    "uno":   6,
}
