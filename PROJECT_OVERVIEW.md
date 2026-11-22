# 🎮 Multi-Game Platform — Technical Project Overview

> **Document Status:** Authoritative Technical Reference  
> **Repository:** `d:\Multi_game`  
> **Architecture Pattern:** Authoritative Backend Engine + Reactive Real-time Web Frontend  
> **Last Inspected:** November 2026  

---

## 1. Project Overview

### 1.1 Purpose
The **Multi-Game Platform (GameZone)** is an ad-hoc, zero-friction multiplayer browser game suite. It allows groups of friends to instantly create private game rooms, share a short 3-digit room code, and play turn-based multiplayer games without accounts, email registrations, or downloads.

### 1.2 Core Capabilities
- **Four Fully Implemented Multiplayer Games:**
  - **Ludo:** 2–4 players; classic 15×15 grid board race with capture mechanics, safe squares, and consecutive-six rules.
  - **Bingo:** 2–6 players; interactive 1–25 paper-and-pen variant with player-turn number calling, card shuffling, and multi-player podium rankings.
  - **Chess:** 2 players; authoritative chess engine powered by `python-chess`, supporting full move validation, FEN sync, draw offers, pawn promotion, and resignations.
  - **UNO:** 2–6 players; standard 108-card deck with strict server-enforced hidden hands, action cards (Skip, Reverse, Draw Two, Wild, Wild Draw Four), and UNO call penalties.
- **Frictionless Room Access:**
  - Rooms identified by a 3-digit numeric code (`"000"` to `"999"`).
  - No database, no logins, no sessions—all room state lives in server memory.
- **Persistent Real-Time Synchronization:**
  - Pure WebSocket communication via Socket.IO with sub-second state delivery.
  - Unicast state sanitization (UNO hands hidden from opponents) vs. broadcast state (Ludo, Chess, Bingo).
- **Integrated Social Features:**
  - Real-time in-game slide-out chat drawer with message history (last 100 messages) and unread message counter badges.
  - Lobby ready-up system and automatic host transfer if the creator leaves.
- **Graceful Reconnection:**
  - 60-second disconnection grace period allowing players to refresh or recover network drops without forfeiting their slot.

---

## 2. Technology Stack

### 2.1 Frontend
| Technology / Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **React** | `^18.3.0` | UI component library (Hooks, Context, Functional Components) |
| **Vite** | `^5.0.0` | Build tool, dev server, and WebSocket proxy (`/socket.io` -> `8000`) |
| **Zustand** | `^4.0.0` | Global state management (`roomStore`, `playerStore`, `chatStore`) |
| **Socket.IO Client** | `^4.7.0` | Real-time bi-directional WebSocket client (configured for pure WebSocket transport) |
| **Tailwind CSS** | `^3.4.0` | Utility-first styling with custom dark-glass design tokens |
| **Framer Motion** | `^11.0.0` | Layout animations, slide-out chat drawer, modals, and game piece effects |
| **chess.js** | `^1.0.0` | Client-side chess utility for legal move targets and promotion detection |
| **canvas-confetti** | `^1.9.0` | Particle confetti effect on the game victory screen |
| **Howler.js** | `^2.2.0` | Audio playback engine respecting browser autoplay and sound toggle |
| **clsx** | `^2.0.0` | Dynamic CSS class construction |
| **Pixi.js** | `^8.0.0` | *Installed in package.json, but currently unused* (all boards use SVG/DOM) |

### 2.2 Backend
| Technology / Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **Python** | `3.10+` | Runtime environment (verified on Python 3.14 venv) |
| **FastAPI** | `0.115.0` | ASGI application framework hosting health checks and CORS configuration |
| **python-socketio** | `5.11.0` | Async Socket.IO server engine managing rooms, connections, and events |
| **Uvicorn** | `0.30.0` | High-performance ASGI web server worker |
| **python-chess** | `1.11.2` | Authoritative FEN validation and chess rules engine |
| **Pydantic** | `2.0.0` | Data validation library (schemas defined in `models/events.py`) |

---

## 3. Project Architecture

The platform follows an **Authoritative Server / Thin Client** model. The frontend cannot independently advance game state or declare moves; it only dispatches actions and renders incoming state updates.

```
┌────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER                             │
│                                                                        │
│   ┌────────────────┐      ┌─────────────────┐      ┌───────────────┐   │
│   │  React Views   │ ───> │  Zustand Stores │ <─── │   useSocket   │   │
│   │ (Lobby / Game) │      │ (Room / Player) │      │  (useRoom.js) │   │
│   └────────────────┘      └─────────────────┘      └───────▲───────┘   │
│           │                                                │           │
└───────────┼────────────────────────────────────────────────┼───────────┘
            │                                                │
       game_action / create / join                   game_state_update / events
      (WebSocket - port 8000)                        (WebSocket - port 8000)
            │                                                │
┌───────────▼────────────────────────────────────────────────┼───────────┐
│                           FASTAPI + SOCKET.IO                          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────┴───────┐   │
│   │                     socket_handler.py                          │   │
│   │  - Routes socket events (create, join, action, chat)           │   │
│   │  - Runs cleanup_expired_disconnects() on each trigger          │   │
│   └───────────────┬────────────────────────────────┬───────────────┘   │
│                   ▼                                ▼                   │
│   ┌──────────────────────────────┐ ┌───────────────────────────────┐   │
│   │       room_manager.py        │ │        GAME_REGISTRY          │   │
│   │ - Room / Player In-Memory DB │ │ - LudoGame    - BingoGame     │   │
│   │ - 3-digit Code Generator     │ │ - ChessGame   - UnoGame       │   │
│   │ - Reconnection TTL (60s)     │ │ (Concrete BaseGame Instances) │   │
│   └──────────────────────────────┘ └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Data Flow Pattern
1. **Action Emission:** When a player acts (e.g., rolls a die or clicks a square), the frontend emits `game_action` with `{ action_type, payload }`.
2. **Server Validation:** `socket_handler.py` verifies the sender's socket ID against the room and checks if it is that player's turn.
3. **Execution:** The server retrieves the active `BaseGame` instance from `_game_instances` and calls `game_obj.apply_action(socket_id, action_type, payload)`.
4. **State Filtering:**
   - **Public Games (Ludo, Bingo, Chess):** The same authoritative state is broadcast to all sockets in the room.
   - **Private Games (UNO):** The server invokes `game_obj.get_state_for(socket_id)` individually for each player to strip out opponent cards and remaining deck data before transmission.
5. **Client Reaction:** `useRoom.js` catches `game_state_update` and updates `useRoomStore.setGameState()`, prompting reactive React re-renders.

---

## 4. Folder Structure & Key Responsibilities

```
Multi_game/
├── backend/
│   ├── games/
│   │   ├── bingo/
│   │   │   ├── constants.py       # Grid dimensions (5x5), total numbers (25), Bingo letters
│   │   │   ├── game.py            # BingoGame(BaseGame): turn rotation, call priority, rankings
│   │   │   └── logic.py           # Pure logic: generate_card, mark_number, count_completed_lines
│   │   ├── chess/
│   │   │   ├── constants.py       # Piece symbols, player color mappings
│   │   │   └── game.py            # ChessGame(BaseGame): python-chess integration, draw/resign logic
│   │   ├── ludo/
│   │   │   ├── constants.py       # Track coordinates, 8 safe squares, start positions
│   │   │   ├── game.py            # LudoGame(BaseGame): roll phase, move phase, win checking
│   │   │   └── logic.py           # Pure logic: dice roll, path traversal, captures, turn advances
│   │   ├── uno/
│   │   │   ├── constants.py       # 4 colors, wild types, card definitions
│   │   │   ├── game.py            # UnoGame(BaseGame): hidden state filter, penalty checks
│   │   │   └── logic.py           # Pure logic: 108-card deck builder, playability, card effects
│   │   ├── base_game.py           # Abstract Base Class (ABC) enforcing game interface
│   │   └── __init__.py            # Central GAME_REGISTRY mapping strings to game classes
│   ├── models/
│   │   ├── events.py              # Pydantic v2 schemas for client payloads
│   │   ├── player.py              # Player dataclass (socket_id, name, slot, status)
│   │   └── room.py                # Room dataclass (room_id, status, players, chat_log)
│   ├── config.py                  # Port (8000), origins, player limits, 60s TTL
│   ├── main.py                    # Application entrypoint; mounts Socket.IO onto FastAPI ASGI app
│   ├── room_manager.py            # Singleton in-memory room registry, CRUD, and reconnect engine
│   ├── socket_handler.py          # Socket.IO event registrations and dispatch logic
│   └── requirements.txt           # Python dependency manifest
├── frontend/
│   ├── public/
│   │   ├── sounds/                # Audio sound files categorized by game (ludo, bingo, chess, uno)
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/              # ChatDrawer, ChatInput, ChatMessage
│   │   │   ├── layout/            # GameLayout (split view), LobbyLayout, PageTransition
│   │   │   ├── lobby/             # HomePage, GameCard (3D hover), CreateRoomModal, JoinRoomModal
│   │   │   ├── room/              # RoomLobby (pre-game), PlayerSlot, RoomCode display
│   │   │   └── ui/                # Reusable Avatar, Badge, Button, Input, Modal, Spinner, Toast
│   │   ├── config/
│   │   │   └── games.js           # Static registry of games, min/max players, colors, gradients
│   │   ├── games/
│   │   │   ├── _shared/           # Shared game widgets: TurnBanner, WinScreen, ScorePanel
│   │   │   ├── bingo/             # BingoGame, BingoCard, CalledNumbers, NumberBall
│   │   │   ├── chess/             # ChessGame, ChessBoard, ChessPiece, MoveHistory, CapturedPieces
│   │   │   ├── ludo/              # LudoGame, LudoBoard (SVG), LudoDice, LudoPiece
│   │   │   └── uno/               # UnoGame, UnoHand, UnoCard, UnoDiscardPile, DrawPile, ColorPicker
│   │   ├── hooks/
│   │   │   ├── useLocalPlayer.js  # Loads/generates local player identity via localStorage
│   │   │   ├── useRoom.js         # Central Socket.IO room listener syncing into Zustand stores
│   │   │   ├── useSocket.js       # Persistent Socket.IO connection manager
│   │   │   └── useSound.js        # Howler audio player wrapper respecting mute toggles
│   │   ├── socket/
│   │   │   ├── events.js          # Canonical constant event strings (Client <-> Server)
│   │   │   └── socket.js          # Shared singleton Socket.IO client instance
│   │   ├── store/
│   │   │   ├── chatStore.js       # Messages, unread counts, drawer visibility
│   │   │   ├── playerStore.js     # Current player name, socket ID, assigned color index
│   │   │   └── roomStore.js       # Current room ID, game type, player roster, game state
│   │   ├── utils/
│   │   │   ├── localStorage.js    # Typed local storage wrapper (keys prefixed with mgp_)
│   │   │   ├── nameGenerator.js   # 50 Adjectives + 50 Animals random name builder
│   │   │   └── roomCode.js        # 3-digit zero-padding and validation utilities
│   │   ├── App.jsx                # React Router structure (`/`, `/room/:roomId`, `/game/:roomId`)
│   │   ├── index.css              # Tailwind base, design tokens, and CSS keyframe animations
│   │   └── main.jsx               # React DOM root entrypoint
│   ├── package.json               # Frontend dependencies and scripts
│   ├── tailwind.config.js         # Tailwind configuration and theme extensions
│   └── vite.config.js             # Vite configuration with WebSocket proxy
├── IMPLEMENTATION_CHECKLIST.md    # Development checklist tracking phase deliverables
├── IMPLEMENTATION_PLAN.md         # Comprehensive platform technical specification
└── README.md                      # Basic quickstart and run guide
```

---

## 5. Game Modules Implementation

### 5.1 Ludo
- **Implementation:** `backend/games/ludo/` & `frontend/src/games/ludo/`
- **Player Limits:** 2 to 4 players.
- **Rules & Logic:**
  - Standard 52-square outer track, 4 home paths, and center home (step index `56`).
  - Players start in the yard (step index `-1`). Rolling a `6` releases a piece to step `0`.
  - Rolling a `6` grants an extra turn; rolling three consecutive `6`s forfeits the turn.
  - Safe squares: 8 fixed positions (`[0, 8, 13, 21, 26, 34, 39, 47]`) where pieces cannot be captured.
  - Capturing an opponent's piece sends it back to their yard (`steps = -1`).
  - Win condition: First player to move all 4 pieces to `steps = 56` wins.
- **Multiplayer & UI:**
  - Pure SVG board renderer (`LudoBoard.jsx`) with dynamic coordinate mapping (`getBoardCoords`).
  - 3D CSS-animated rolling dice widget (`LudoDice.jsx`).
  - Client sends `roll_dice` and `move_piece` actions; server validates turn and eligibility.

### 5.2 Bingo
- **Implementation:** `backend/games/bingo/` & `frontend/src/games/bingo/`
- **Player Limits:** 2 to 6 players.
- **Rules & Logic:**
  - Classic 1–25 paper-and-pen variant. Each player receives a 5×5 grid with numbers 1 to 25 randomly distributed.
  - Before the first number is called, players can click **Shuffle Card** (`shuffle_card`) to reroll their numbers.
  - Turn-based calling: The active caller picks an uncalled number (`pick_number`). That number is marked on **all** players' cards.
  - Completing any 5-in-a-row (horizontal, vertical, diagonal) yields 1 line. Lines correspond to letters **B - I - N - G - O** (5 lines = BINGO).
  - **Caller Priority & Podium Ranking:** If a called number grants 5 lines to multiple players simultaneously, the caller gets priority. In 3+ player games, the game continues until only 1 player remains, establishing 1st, 2nd, and 3rd rank podium spots.
- **Multiplayer & UI:**
  - Grid cell selection with animated cross-out marks (`BingoCard.jsx`).
  - Opponents' live progress mini-cards showing line counts and rank badges.

### 5.3 Chess
- **Implementation:** `backend/games/chess/` & `frontend/src/games/chess/`
- **Player Limits:** Strictly 2 players (Slot 0 = White, Slot 1 = Black).
- **Rules & Logic:**
  - Authoritative rule evaluation using `python-chess` on the backend.
  - Validates moves, checks, checkmate, stalemate, 50-move rule, threefold repetition, and insufficient material.
  - Client uses `chess.js` solely for calculating local dot highlights for legal moves and pawn promotion triggers.
- **Multiplayer & UI:**
  - Interactive 8×8 board (`ChessBoard.jsx`) automatically flipped based on assigned color.
  - Captures tray (`CapturedPieces.jsx`) and UCI move history feed (`MoveHistory.jsx`).
  - Modal workflows for Pawn Promotion (Queen, Rook, Bishop, Knight), Draw Offers (Accept/Decline), and Resignation confirmation.

### 5.4 UNO
- **Implementation:** `backend/games/uno/` & `frontend/src/games/uno/`
- **Player Limits:** 2 to 6 players.
- **Rules & Logic:**
  - Standard 108-card deck: 76 Number cards (0–9), 24 Action cards (Skip, Reverse, Draw Two), 4 Wilds, 4 Wild Draw Fours.
  - Turn direction flag (`direction = 1` or `-1`). With 2 players, Reverse functions as Skip.
  - **Authoritative Hidden Information:** `UnoGame.get_state_for(socket_id)` redacts other players' hands (retaining only `hand_count`) and hides the draw pile deck array (retaining only `draw_pile_count`).
  - **Penalty Rule:** If a player has 1 card remaining and failed to call UNO (`call_uno`) before the next player takes an action, the server penalizes them with 2 draw cards.
- **Multiplayer & UI:**
  - Dynamic curved hand layout (`UnoHand.jsx`) with rotation transforms.
  - Color picker modal for Wild and Wild Draw Four cards.
  - Draw pile deck interaction and dedicated "🔥 UNO!" trigger button.

---

## 6. Room System & Real-Time Synchronization

### 6.1 Room Code Generation
- Handled by `RoomManager.generate_room_id()`.
- Generates a random 3-digit integer zero-padded string (`"000"` to `"999"`).
- Guarantees uniqueness against all active rooms with up to 200 random attempts before raising `NO_ROOMS_AVAILABLE`.

### 6.2 Room Lifecycle & State Machine
Rooms transition through three states:
1. `"waiting"`: Room created. Players join, select readiness, and wait in `RoomLobby`.
2. `"playing"`: Host triggers `start_game`. Game class initialized and state broadcast.
3. `"finished"`: Terminal state reached (`is_game_over() == True`). WinScreen displayed.

```
       create_room
  [ Client ] ────────> ( "waiting" ) ──[ toggle_ready ]──┐
                           │                             │
                      start_game                         │
                           ▼                             ▼
                      ( "playing" ) <────────────────────┘
                           │
                      [ game_action ]
                           ▼
                      ( "finished" ) ──[ clearRoom ]──> [ Home ]
```

### 6.3 Player Slots & Limits
Player capacity is enforced in `RoomManager.join_room()` according to `config.py`:
- **Ludo:** 4 players max
- **Bingo:** 6 players max
- **Chess:** 2 players max
- **UNO:** 6 players max
- **Minimum Players:** 2 players required across all game modes.

### 6.4 Host Management & Auto-Transfer
- The creator of the room is assigned `slot = 0` and `is_host = True`.
- Only the host can initiate `start_game` (requires all connected peers to be ready).
- If the host disconnects or leaves the room, `RoomManager.leave_room()` automatically transfers the host role to the next active, connected player.

### 6.5 Disconnection & 60-Second Reconnection Grace Period
- When a socket drops, `on_disconnect` marks `is_connected = False` and sets a timestamp: `disconnect_time = time.time()`.
- The player slot is preserved for **60 seconds** (`RECONNECT_TTL = 60`).
- If the player reconnects within 60 seconds (via automatic trigger on page reload in `useSocket.js` emitting `reconnect_room`):
  - Their new socket ID is re-mapped to their slot.
  - The latest game state is delivered directly to their socket.
  - A `player_reconnected` notification is broadcast to the room.
- `cleanup_expired_disconnects()` runs at the beginning of every socket event handler, evicting any expired player slots and deleting emptied rooms.

---

## 7. Data Handling & Persistence

### 7.1 Zero Database Architecture
- **No SQL or NoSQL Database:** The platform uses **no persistent database** (no SQLite, PostgreSQL, MongoDB, or Redis).
- **In-Memory Volatility:**
  - All room data, player slots, and game states reside in Python process memory on the backend (`RoomManager.rooms` and `socket_handler._game_instances`).
  - If the server process restarts, all active rooms and matches are terminated immediately.

### 7.2 Client-Side Storage (`localStorage`)
Local storage is strictly used for client preferences, with all keys prefixed by `mgp_` to avoid conflicts:
- `mgp_player_name`: Stores the user's display name. If none exists, `useLocalPlayer` auto-generates a fun alias (e.g., `BlueFox42`) using `nameGenerator.js`.
- `mgp_sound_enabled`: Boolean flag (`"true"` / `"false"`) controlling sound effect playback.
- `mgp_music_enabled`: Preference flag reserved for background music.

### 7.3 Frontend State Management (Zustand)
The frontend separates state into three specialized stores:
1. `roomStore`: Holds current `roomId`, `game` type, room `status`, the list of `players`, and authoritative `gameState`.
2. `playerStore`: Tracks local player `name`, current `socketId`, and assigned `colorIndex`.
3. `chatStore`: Maintains in-memory chat messages (up to 100), `unreadCount`, and drawer toggle state (`isOpen`).

---

## 8. Current Status & Known Observations

### 8.1 Fully Implemented Features
- [x] End-to-end room lifecycle: Create Room, 3-digit Code Join, Ready-up toggle, and Host Start.
- [x] Host delegation on player leave.
- [x] 60-second reconnection window with automated socket re-association on page refresh.
- [x] Complete Ludo mechanics: board path traversal, captures, safe squares, and dice animations.
- [x] Complete Bingo mechanics: 1–25 grid, turn-based calling, multi-line completion, caller priority, and podium placement.
- [x] Complete Chess mechanics: move validation via `python-chess`, FEN synchronization, draw negotiation, resignation, and promotion.
- [x] Complete UNO mechanics: deck manipulation, play validation, hidden state filtering, wild color picking, and UNO failure penalties.
- [x] Real-time chat drawer with unread badges and auto-scroll.
- [x] Interactive UI: 3D tilting game cards, glassmorphic layout, win confetti, and animated turn banners.

### 8.2 Incomplete Features & Code Discrepancies
- **Placeholder Sound Assets:** All 18 sound files in `frontend/public/sounds/` are 87-byte placeholder stubs. The audio triggering mechanism via `Howler.js` is fully wired, but real `.mp3` audio files must be dropped in.
- **Background Music:** `getMusicEnabled` / `setMusicEnabled` utilities exist in `localStorage.js`, but no background audio tracks or loop playback logic are implemented.
- **Unused Frontend Dependencies:**
  - `pixi.js` is included in `package.json`, but no component imports or utilizes Pixi rendering (all boards are SVG/DOM).
- **Backend Model Discrepancy:**
  - `backend/models/events.py` defines Pydantic payload models (`CreateRoomPayload`, `JoinRoomPayload`, etc.), but `socket_handler.py` currently extracts parameters directly via `data.get()` rather than validating through the Pydantic classes.
- **Minor Frontend Warning:**
  - `frontend/src/games/ludo/gameLogic.js` imports `OUTER_TRACK_LEN` from `constants.js`, which is not exported by `constants.js` (Vite build emits a warning; function uses literal `52`).
- **Backend Requirement Comment:**
  - In `backend/requirements.txt`, `# python-chess==1.10.0` is commented out. Although `chess` is installed in the local virtual environment (`myenv`), running `pip install -r requirements.txt` in a fresh environment will not install `chess` unless uncommented.

---

## 9. Architectural Scalability & Future Roadmap

### 9.1 Multi-Process / Multi-Instance Scalability
- **Current Limitation:** The platform currently relies on a single in-memory Python process. If scaled to multiple Uvicorn workers or distributed container instances, clients connected to different nodes will be unable to find each other's rooms.
- **Scaling Recommendation:**
  - Integrate a Redis pub/sub message broker using `python-socketio`'s `AsyncRedisManager`.
  - Move active room state and game state snapshots to Redis with TTL expiration.

### 9.2 Room Code Namespace
- **Current Limitation:** The 3-digit numeric namespace allows a maximum of 1,000 concurrent rooms (`000` to `999`). As room density increases, the collision rate during random ID generation increases.
- **Scaling Recommendation:** Expand to a 4-digit numeric code or 4-character alphanumeric uppercase code (e.g., `ABCD`), expanding room capacity to 10,000+ without degrading usability.

### 9.3 Memory Leak Mitigation for Abandoned Games
- **Current Limitation:** `socket_handler.py` maintains `_game_instances[room_id]`. Entries are deleted when `game_over` triggers. If all players abandon a room mid-game, `room_manager.cleanup_expired_disconnects()` purges the `Room` object, but `_game_instances` can retain orphaned game objects.
- **Scaling Recommendation:** Hook `RoomManager.cleanup_expired_disconnects()` to trigger a callback that cleans up associated entries in `_game_instances`.

### 9.4 UX & Game Enhancements
- **Spectator Mode:** Currently, joining a room with status `"playing"` is rejected with `ROOM_STARTED`. Allowing spectator mode would allow friends to watch ongoing matches.
- **Turn Timers:** Adding an optional turn clock or chess timer (blitz/rapid) would prevent matches from stalling if an active player goes AFK without disconnecting.
