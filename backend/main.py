"""
FILE: backend/main.py
PURPOSE: Application entry point. Wires FastAPI + python-socketio together
         and starts the ASGI server.

WHAT THIS FILE DOES:
  1. Creates the FastAPI app instance.
  2. Creates an AsyncServer (python-socketio) with correct CORS settings.
  3. Mounts the socket.io ASGI app onto FastAPI so both HTTP and WebSocket
     traffic are handled by the same process on PORT 8000.
  4. Calls register_handlers() from socket_handler.py to attach all socket
     event listeners (create_room, join_room, game_action, etc.).
  5. Provides a simple HTTP GET "/" health-check endpoint.

HOW TO RUN:
  uvicorn main:app --reload --port 8000

DEPENDENCY CHAIN:
  main.py → socket_handler.py → room_manager.py → models/ → games/
"""

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import PORT, FRONTEND_ORIGINS
from socket_handler import register_handlers

# ── FastAPI app ──────────────────────────────────────────────────────────────
fastapi_app = FastAPI(title="Multi-Game Platform API")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Socket.IO server ─────────────────────────────────────────────────────────
sio = socketio.AsyncServer(
    cors_allowed_origins=FRONTEND_ORIGINS,
    async_mode="asgi",
    logger=False,
    engineio_logger=False,
)

# Mount socket.io ASGI app — all /socket.io/* requests go here
# Defining `app = socket_app` ensures `uvicorn main:app` and `uvicorn main:socket_app` both work!
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
socket_app = app

# Register every socket event handler (create_room, join_room, etc.)
register_handlers(sio)


# ── Health check ─────────────────────────────────────────────────────────────
@fastapi_app.get("/")
async def health():
    return {"status": "ok", "message": "Multi-Game Platform backend running"}


# ── Dev entrypoint ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
