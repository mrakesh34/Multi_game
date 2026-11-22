# 🎮 Multiplayer Game Platform — Master Implementation Plan
**Version**: 1.0 | **Status**: Specification Complete — Not Yet Started  
**Games**: Ludo · Bingo · Chess · UNO  
**Authors**: Any LLM/developer must follow this plan exactly. No deviations without updating this document first.

---

> [!IMPORTANT]
> This is the single source of truth. Every implementation decision is pre-made here. Do not use your own judgment for anything already specified. If something is NOT specified, check the OPEN QUESTIONS section at the bottom before proceeding.

---

## 1. PROJECT CONSTRAINTS (Non-Negotiable)

| Constraint | Value |
|---|---|
| No authentication | ✅ No login, no signup, no sessions |
| No database | ✅ All state in server memory |
| No ads | ✅ |
| Player persistence | LocalStorage only (name + settings) |
| Room ID format | Exactly 3 numeric digits: `000` to `999` |
| Room ID sharing | Verbally shareable — numeric only, no letters |
| Reconnect window | **60 seconds** — server holds slot then drops player |
| Max players | 2–6 depending on game |
| Target platform | Desktop browser (Chrome/Edge/Firefox latest) |
| No PWA | Not in scope |
| Auto-assign name | Yes — random fun name on first visit |

---

## 2. TECH STACK — EXACT VERSIONS

### Frontend
```
Node.js          >= 20.x
React            18.3.x
Vite             5.x
React Router     6.x
Zustand          4.x
Socket.IO Client 4.7.x
Framer Motion    11.x
Tailwind CSS     3.4.x
PixiJS           8.x           (canvas/WebGL renderer — Ludo/UNO card animations)
chess.js         1.x           (Chess rules engine — frontend validation)
Howler.js        2.2.x         (Sound effects)
canvas-confetti  1.9.x         (Win screen confetti)
clsx             2.x           (Conditional classNames utility)
```

### Backend
```
Python           3.12.x
FastAPI          0.115.x
python-socketio  5.11.x
uvicorn          0.30.x
python-chess     1.10.x        (Chess rules engine — backend authority)
pydantic         2.x           (Data validation)
```

---

## 3. REPOSITORY STRUCTURE

```
d:\Multi_game\
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── sounds/
│   │       ├── ludo/
│   │       │   ├── dice_roll.mp3
│   │       │   ├── piece_move.mp3
│   │       │   ├── piece_capture.mp3
│   │       │   └── win.mp3
│   │       ├── bingo/
│   │       │   ├── number_call.mp3
│   │       │   ├── mark.mp3
│   │       │   └── bingo.mp3
│   │       ├── chess/
│   │       │   ├── move.mp3
│   │       │   ├── capture.mp3
│   │       │   ├── check.mp3
│   │       │   └── game_end.mp3
│   │       └── uno/
│   │           ├── card_draw.mp3
│   │           ├── card_play.mp3
│   │           ├── uno_call.mp3
│   │           └── win.mp3
│   ├── src/
│   │   ├── main.jsx                    # App entry — ReactDOM.createRoot
│   │   ├── App.jsx                     # Router setup
│   │   ├── index.css                   # Global CSS + Tailwind directives
│   │   │
│   │   ├── config/
│   │   │   └── games.js                # Game registry (see Section 7.1)
│   │   │
│   │   ├── socket/
│   │   │   ├── socket.js               # Socket.IO singleton instance
│   │   │   └── events.js               # All event name constants (strings)
│   │   │
│   │   ├── store/
│   │   │   ├── index.js                # Combines all Zustand stores
│   │   │   ├── playerStore.js          # Local player identity
│   │   │   ├── roomStore.js            # Room + players state
│   │   │   └── chatStore.js            # Chat messages
│   │   │
│   │   ├── hooks/
│   │   │   ├── useLocalPlayer.js       # Read/write name from LocalStorage
│   │   │   ├── useSocket.js            # Socket connect/disconnect lifecycle
│   │   │   ├── useRoom.js              # Room events (join, leave, players)
│   │   │   └── useSound.js             # Howler sound trigger helper
│   │   │
│   │   ├── utils/
│   │   │   ├── roomCode.js             # 3-digit room code helpers
│   │   │   ├── nameGenerator.js        # Random fun name generator
│   │   │   └── localStorage.js         # Typed LS get/set/remove
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx          # Primary/secondary/ghost variants
│   │   │   │   ├── Input.jsx           # Styled text input
│   │   │   │   ├── Modal.jsx           # Animated overlay modal
│   │   │   │   ├── Avatar.jsx          # Colored initials avatar
│   │   │   │   ├── Badge.jsx           # Status pill (online/ready/host)
│   │   │   │   ├── Toast.jsx           # Notification toast
│   │   │   │   └── Spinner.jsx         # Loading spinner
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── PageTransition.jsx  # Framer Motion page wrapper
│   │   │   │   ├── GameLayout.jsx      # In-game layout (board + chat + HUD)
│   │   │   │   └── LobbyLayout.jsx     # Pre-game layout
│   │   │   │
│   │   │   ├── lobby/
│   │   │   │   ├── HomePage.jsx        # Landing page — game picker
│   │   │   │   ├── GameCard.jsx        # Animated game selection card
│   │   │   │   ├── CreateRoomModal.jsx # Create room overlay
│   │   │   │   └── JoinRoomModal.jsx   # Join room overlay (3-digit input)
│   │   │   │
│   │   │   ├── room/
│   │   │   │   ├── RoomLobby.jsx       # Waiting room before game starts
│   │   │   │   ├── PlayerSlot.jsx      # One player in the lobby list
│   │   │   │   └── RoomCode.jsx        # Displays room code prominently
│   │   │   │
│   │   │   └── chat/
│   │   │       ├── ChatDrawer.jsx      # Slide-in chat panel (right side)
│   │   │       ├── ChatMessage.jsx     # Single message row
│   │   │       └── ChatInput.jsx       # Input + send button
│   │   │
│   │   └── games/
│   │       ├── _shared/
│   │       │   ├── GameWrapper.jsx     # Connects game to socket + store
│   │       │   ├── TurnBanner.jsx      # "Your Turn" / "PlayerX's Turn"
│   │       │   ├── ScorePanel.jsx      # Player scores sidebar
│   │       │   └── WinScreen.jsx       # Confetti + winner announcement
│   │       │
│   │       ├── ludo/
│   │       │   ├── index.jsx           # Lazy-loaded entry point
│   │       │   ├── LudoGame.jsx        # Root game component, socket listener
│   │       │   ├── LudoBoard.jsx       # SVG board render
│   │       │   ├── LudoPiece.jsx       # Animated token (Framer Motion)
│   │       │   ├── LudoDice.jsx        # 3D CSS dice animation
│   │       │   ├── constants.js        # Board path arrays, colors, positions
│   │       │   ├── gameLogic.js        # Pure functions (client-side helpers)
│   │       │   └── ludo.css            # Ludo-specific styles
│   │       │
│   │       ├── bingo/
│   │       │   ├── index.jsx
│   │       │   ├── BingoGame.jsx       # Root — socket listener
│   │       │   ├── BingoCard.jsx       # 5×5 card grid for one player
│   │       │   ├── CalledNumbers.jsx   # Scrollable called-number history
│   │       │   ├── NumberBall.jsx      # Animated number reveal ball
│   │       │   ├── constants.js        # Card generation rules
│   │       │   ├── gameLogic.js        # Win-check pure functions
│   │       │   └── bingo.css
│   │       │
│   │       ├── chess/
│   │       │   ├── index.jsx
│   │       │   ├── ChessGame.jsx       # Root — socket listener
│   │       │   ├── ChessBoard.jsx      # 8×8 board render
│   │       │   ├── ChessPiece.jsx      # SVG piece with drag (Framer Motion)
│   │       │   ├── CapturedPieces.jsx  # Captured piece display
│   │       │   ├── MoveHistory.jsx     # Scrollable algebraic move list
│   │       │   ├── constants.js        # Piece Unicode / SVG map
│   │       │   ├── gameLogic.js        # chess.js wrapper
│   │       │   └── chess.css
│   │       │
│   │       └── uno/
│   │           ├── index.jsx
│   │           ├── UnoGame.jsx         # Root — socket listener
│   │           ├── UnoHand.jsx         # Player's hand (fan layout)
│   │           ├── UnoCard.jsx         # Individual card component
│   │           ├── UnoDiscardPile.jsx  # Center discard pile
│   │           ├── DrawPile.jsx        # Draw pile (clickable)
│   │           ├── ColorPicker.jsx     # Wild color selection overlay
│   │           ├── UnoPlayerStatus.jsx # Other players' hand counts
│   │           ├── constants.js        # Card definitions, colors
│   │           ├── gameLogic.js        # Playability checks (client helper)
│   │           └── uno.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── main.py                         # App entry — mounts FastAPI + Socket.IO
│   ├── config.py                       # Constants (port, reconnect TTL, etc.)
│   ├── room_manager.py                 # Room CRUD + reconnect logic
│   ├── socket_handler.py               # All socket event handlers
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── player.py                   # Player dataclass
│   │   ├── room.py                     # Room dataclass
│   │   └── events.py                   # Pydantic models for event payloads
│   │
│   └── games/
│       ├── __init__.py
│       ├── base_game.py                # Abstract BaseGame class
│       ├── ludo/
│       │   ├── __init__.py
│       │   ├── game.py                 # LudoGame(BaseGame)
│       │   ├── logic.py                # Pure functions (dice, moves, capture)
│       │   └── constants.py            # Board path, safe squares, home cols
│       ├── bingo/
│       │   ├── __init__.py
│       │   ├── game.py                 # BingoGame(BaseGame)
│       │   ├── logic.py                # Card gen, number call, win check
│       │   └── constants.py            # Column ranges
│       ├── chess/
│       │   ├── __init__.py
│       │   ├── game.py                 # ChessGame(BaseGame) — wraps python-chess
│       │   └── constants.py
│       └── uno/
│           ├── __init__.py
│           ├── game.py                 # UnoGame(BaseGame)
│           ├── logic.py                # Deck, deal, playability, effects
│           └── constants.py            # Card definitions
│
├── .gitignore
└── README.md
```

---

## 4. DATA MODELS (Exact JSON/Python Structures)

### 4.1 Player Object
```json
{
  "socket_id": "string",
  "name": "string (1–20 chars)",
  "slot": 0,
  "is_host": true,
  "is_ready": false,
  "is_connected": true,
  "disconnect_time": null,
  "color_index": 0
}
```
`color_index` maps to the game's color array. For Ludo: 0=Red,1=Green,2=Yellow,3=Blue. For Chess: 0=White,1=Black.

### 4.2 Room Object (server-side Python dict)
```python
{
  "room_id": str,                  # "000" to "999"
  "game": str,                     # "ludo" | "bingo" | "chess" | "uno"
  "status": str,                   # "waiting" | "playing" | "finished"
  "created_at": float,             # time.time()
  "host_socket_id": str,
  "players": List[Player],
  "game_state": dict | None,       # None until game starts
  "chat_log": List[ChatMessage],   # Max 100 messages stored
}
```

### 4.3 ChatMessage Object
```json
{
  "from_name": "string",
  "text": "string (max 200 chars)",
  "timestamp": 1700000000.0
}
```

---

## 5. WEBSOCKET EVENTS — COMPLETE SPECIFICATION

### 5.1 Event Name Constants (use these exact strings — defined in `events.js` and `socket_handler.py`)

```
CLIENT → SERVER:
  "create_room"
  "join_room"
  "reconnect_room"
  "leave_room"
  "toggle_ready"
  "start_game"
  "game_action"
  "chat_message"

SERVER → CLIENT (to one socket):
  "room_created"
  "room_joined"
  "room_error"
  "game_started"
  "game_state_update"
  "game_over"
  "error"

SERVER → CLIENT (broadcast to room):
  "player_joined"
  "player_left"
  "player_ready_changed"
  "player_disconnected"
  "player_reconnected"
  "chat_broadcast"
  "game_started"        (also broadcast)
  "game_state_update"   (also broadcast)
  "game_over"           (also broadcast)
```

### 5.2 Event Payloads — Client → Server

**`create_room`**
```json
{ "game": "ludo", "player_name": "BlueFox42" }
```

**`join_room`**
```json
{ "room_id": "742", "player_name": "RedTiger99" }
```

**`reconnect_room`**
```json
{ "room_id": "742", "player_name": "BlueFox42" }
```
Server matches by name + room_id. If found and within 60s window, restores the slot.

**`leave_room`**
```json
{}
```

**`toggle_ready`**
```json
{}
```

**`start_game`**
```json
{}
```
Only the host can send this. Server validates.

**`game_action`**
```json
{
  "action_type": "string",
  "payload": {}
}
```
See Section 8 for per-game action types.

**`chat_message`**
```json
{ "text": "string (max 200 chars)" }
```

### 5.3 Event Payloads — Server → Client

**`room_created`** → to creator only
```json
{
  "room_id": "742",
  "game": "ludo",
  "player": { ...Player object... }
}
```

**`room_joined`** → to joiner only
```json
{
  "room_id": "742",
  "game": "ludo",
  "players": [ ...all Player objects... ],
  "chat_log": [ ...recent 20 ChatMessages... ]
}
```

**`room_error`** → to requester only
```json
{
  "code": "ROOM_NOT_FOUND | ROOM_FULL | ROOM_STARTED | NAME_TAKEN | INVALID_ROOM_ID",
  "message": "Human-readable error string"
}
```

**`player_joined`** → broadcast to room
```json
{
  "player": { ...Player object... },
  "players": [ ...all Player objects... ]
}
```

**`player_left`** → broadcast to room
```json
{
  "player_name": "string",
  "players": [ ...remaining Player objects... ],
  "new_host": "socket_id | null"
}
```

**`player_ready_changed`** → broadcast to room
```json
{
  "socket_id": "string",
  "is_ready": true,
  "players": [ ...all Player objects... ]
}
```

**`player_disconnected`** → broadcast to room
```json
{
  "socket_id": "string",
  "player_name": "string",
  "reconnect_expires_at": 1700000060.0
}
```

**`player_reconnected`** → broadcast to room
```json
{
  "socket_id": "string (new socket)",
  "player_name": "string"
}
```

**`game_started`** → broadcast to room
```json
{
  "game_state": { ...game-specific state... }
}
```

**`game_state_update`** → broadcast to room  
*(For UNO, server sends a sanitized version: other players' hands are replaced with just `hand_count`)*
```json
{
  "game_state": { ...game-specific state... },
  "action_summary": "string (human-readable: 'BlueFox played Red 7')"
}
```

**`game_over`** → broadcast to room
```json
{
  "winner_name": "string | null",
  "reason": "string (normal | forfeit | stalemate | draw)",
  "final_state": { ...game-specific state... }
}
```

**`chat_broadcast`** → broadcast to room
```json
{
  "from_name": "string",
  "text": "string",
  "timestamp": 1700000000.0
}
```

**`error`** → to requester only
```json
{ "message": "string" }
```

---

## 6. BACKEND IMPLEMENTATION

### 6.1 `config.py`
```python
PORT = 8000
FRONTEND_ORIGINS = ["http://localhost:5173", "http://localhost:4173"]
RECONNECT_TTL = 60          # seconds to hold disconnected slot
MAX_CHAT_LOG = 100          # messages stored per room
MAX_ROOM_ID = 999
MIN_ROOM_ID = 0
```

### 6.2 `main.py` — Server Bootstrap
- Create FastAPI app
- Create `python_socketio.AsyncServer(cors_allowed_origins=FRONTEND_ORIGINS, async_mode='asgi')`
- Mount socket.io as ASGI middleware
- Register all socket events from `socket_handler.py`
- Run with uvicorn on `config.PORT`

### 6.3 `room_manager.py` — Room State

```python
class RoomManager:
    rooms: Dict[str, Room]      # key = room_id string "000"-"999"

    def generate_room_id(self) -> str:
        # Try random 3-digit IDs until unused, max 100 tries
        # If all taken, raise RoomFullError
        # Return zero-padded string: f"{random.randint(0, 999):03d}"

    def create_room(self, game, host_socket_id, host_name) -> Room: ...
    def get_room(self, room_id) -> Room | None: ...
    def get_room_by_socket(self, socket_id) -> Room | None: ...
    def join_room(self, room_id, socket_id, name) -> Player: ...
    def leave_room(self, socket_id) -> tuple[Room, Player] | None: ...
    def mark_disconnected(self, socket_id) -> Room | None: ...
    def try_reconnect(self, room_id, name, new_socket_id) -> Player | None: ...
    def cleanup_expired_disconnects(self): ...  # call periodically or on events
```

**Reconnect logic:**
1. On `disconnect` socket event: call `mark_disconnected(socket_id)` → sets `is_connected=False`, `disconnect_time=time.time()`
2. On `reconnect_room` event: call `try_reconnect` → find player in room by name, check `time.time() - disconnect_time <= RECONNECT_TTL`, if valid: update socket_id, set `is_connected=True`, `disconnect_time=None`
3. `cleanup_expired_disconnects`: called at the start of every socket event handler — removes players where `disconnect_time` exists and is older than TTL

**Room validation rules:**
- Max players per game: `{"ludo": 4, "bingo": 6, "chess": 2, "uno": 6}`
- Cannot join a room with `status == "playing"` (unless reconnect)
- Cannot join if name already taken in room (case-insensitive)
- Room IDs are always 3 digits zero-padded

### 6.4 `socket_handler.py` — Event Handlers

Each handler signature: `async def on_<event>(sid, data):`

```
on_create_room   → validate data → room_manager.create_room → emit room_created to sid → emit player_joined to room
on_join_room     → validate → room_manager.join_room → emit room_joined to sid → emit player_joined to room
on_reconnect_room→ room_manager.try_reconnect → re-add to socketio room → emit game_state_update to sid → emit player_reconnected to room
on_disconnect    → room_manager.mark_disconnected → emit player_disconnected to room
on_leave_room    → room_manager.leave_room → emit player_left to room
on_toggle_ready  → flip player.is_ready → emit player_ready_changed to room
on_start_game    → validate host + all ready → game.initialize() → emit game_started to room
on_game_action   → validate turn + action → game.apply_action() → emit game_state_update → if game over: emit game_over
on_chat_message  → validate text length → store in chat_log → emit chat_broadcast to room
```

### 6.5 `games/base_game.py`

```python
from abc import ABC, abstractmethod

class BaseGame(ABC):
    def __init__(self, players: list[Player]):
        self.players = players

    @abstractmethod
    def initialize(self) -> dict:
        """Set up initial game state. Returns state dict."""

    @abstractmethod
    def apply_action(self, socket_id: str, action_type: str, payload: dict) -> dict:
        """Apply a player action. Returns updated state dict. Raises ValueError on invalid action."""

    @abstractmethod
    def is_game_over(self) -> bool: ...

    @abstractmethod
    def get_winner(self) -> str | None:
        """Returns winner's name or None for draw."""

    def get_state_for(self, socket_id: str) -> dict:
        """Override for games with hidden info (UNO hands). Default: full state."""
        return self.get_state()

    @abstractmethod
    def get_state(self) -> dict: ...
```

---

## 7. FRONTEND IMPLEMENTATION

### 7.1 `config/games.js` — Game Registry
```js
export const GAMES = [
  {
    id: "ludo",
    name: "Ludo",
    description: "Classic board race game",
    minPlayers: 2,
    maxPlayers: 4,
    color: "#ef4444",        // red
    emoji: "🎲",
    bgGradient: "from-red-900 to-red-700",
  },
  {
    id: "bingo",
    name: "Bingo",
    description: "5×5 number card game",
    minPlayers: 2,
    maxPlayers: 6,
    color: "#3b82f6",        // blue
    emoji: "🎱",
    bgGradient: "from-blue-900 to-blue-700",
  },
  {
    id: "chess",
    name: "Chess",
    description: "Classic strategy game",
    minPlayers: 2,
    maxPlayers: 2,
    color: "#a16207",        // amber
    emoji: "♟️",
    bgGradient: "from-amber-900 to-amber-700",
  },
  {
    id: "uno",
    name: "UNO",
    description: "Card shedding game",
    minPlayers: 2,
    maxPlayers: 6,
    color: "#16a34a",        // green
    emoji: "🃏",
    bgGradient: "from-green-900 to-green-700",
  },
]
```

### 7.2 `socket/events.js` — Event Constants
```js
export const EVENTS = {
  // Client → Server
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  RECONNECT_ROOM: "reconnect_room",
  LEAVE_ROOM: "leave_room",
  TOGGLE_READY: "toggle_ready",
  START_GAME: "start_game",
  GAME_ACTION: "game_action",
  CHAT_MESSAGE: "chat_message",

  // Server → Client
  ROOM_CREATED: "room_created",
  ROOM_JOINED: "room_joined",
  ROOM_ERROR: "room_error",
  PLAYER_JOINED: "player_joined",
  PLAYER_LEFT: "player_left",
  PLAYER_READY_CHANGED: "player_ready_changed",
  PLAYER_DISCONNECTED: "player_disconnected",
  PLAYER_RECONNECTED: "player_reconnected",
  GAME_STARTED: "game_started",
  GAME_STATE_UPDATE: "game_state_update",
  GAME_OVER: "game_over",
  CHAT_BROADCAST: "chat_broadcast",
  ERROR: "error",
}
```

### 7.3 `socket/socket.js`
```js
import { io } from "socket.io-client"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
const socket = io(BACKEND_URL, { autoConnect: false, transports: ["websocket"] })
export default socket
```

### 7.4 `utils/nameGenerator.js`
Two arrays: 50 adjectives + 50 animals. Random combo + 2-digit number.
```js
const ADJECTIVES = ["Blue","Red","Gold","Wild","Dark","Swift","Brave","Cool","Ninja","Fire",
  "Storm","Iron","Neon","Cyber","Lucky","Lazy","Fuzzy","Spicy","Cosmic","Shadow",
  "Super","Ultra","Mega","Hyper","Turbo","Zany","Funky","Witty","Jolly","Zippy",
  "Crimson","Silver","Jade","Amber","Violet","Scarlet","Cobalt","Coral","Indigo","Teal",
  "Atomic","Blaze","Frost","Volt","Spark","Surge","Flash","Gloom","Drift","Haze"]
const ANIMALS = ["Fox","Wolf","Bear","Panda","Tiger","Lion","Eagle","Shark","Dragon","Falcon",
  "Cobra","Lynx","Otter","Hawk","Raven","Viper","Rhino","Moose","Bison","Crane",
  "Gecko","Dingo","Tapir","Okapi","Lemur","Stoat","Quoll","Genet","Fossa","Tayra",
  "Zorro","Xerus","Urubu","Tanki","Sable","Ratel","Quokka","Potto","Olingo","Nilgai",
  "Maned","Liger","Kudu","Jackal","Ibis","Hyena","Grebe","Finch","Egret","Dhole"]
export function generateName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num = Math.floor(Math.random() * 90) + 10
  return `${adj}${animal}${num}`
}
```

### 7.5 `utils/localStorage.js`
```js
const KEYS = {
  PLAYER_NAME: "mgp_player_name",
  SOUND_ENABLED: "mgp_sound_enabled",
  MUSIC_ENABLED: "mgp_music_enabled",
}
export function getPlayerName() { return localStorage.getItem(KEYS.PLAYER_NAME) || null }
export function setPlayerName(name) { localStorage.setItem(KEYS.PLAYER_NAME, name) }
export function getSoundEnabled() { return localStorage.getItem(KEYS.SOUND_ENABLED) !== "false" }
export function setSoundEnabled(val) { localStorage.setItem(KEYS.SOUND_ENABLED, String(val)) }
```

### 7.6 `store/playerStore.js` (Zustand)
```js
{
  name: string | null,       // player's display name
  socketId: string | null,
  colorIndex: number,
  setName: fn,
  setSocketId: fn,
}
```

### 7.7 `store/roomStore.js` (Zustand)
```js
{
  roomId: string | null,
  game: string | null,
  status: "waiting" | "playing" | "finished" | null,
  players: Player[],
  gameState: object | null,
  setRoom: fn,
  setPlayers: fn,
  setGameState: fn,
  clearRoom: fn,
}
```

### 7.8 `store/chatStore.js` (Zustand)
```js
{
  messages: ChatMessage[],   // max 100
  isOpen: boolean,
  unreadCount: number,
  addMessage: fn,
  setOpen: fn,
  markRead: fn,
}
```

### 7.9 `App.jsx` — Routing
```
/                  → HomePage
/room/:roomId      → RoomLobby (waiting room)
/game/:roomId      → GameLayout (auto-routes to correct game)
```

---

## 8. GAME IMPLEMENTATIONS

---

### 8.1 LUDO

#### Rules
- 2–4 players, colors assigned in order: Red(0), Green(1), Yellow(2), Blue(3)
- Each player has 4 pieces
- Roll a 6 to move a piece out of yard onto the board
- If you roll a 6, you get an extra turn (max 3 consecutive 6s → forfeit turn)
- Landing on another player's piece (not on a safe square) captures it → returns to yard
- Safe squares (global outer track positions): `[0, 8, 13, 21, 26, 34, 39, 47]`
- Home column squares are always safe (can't be captured there)
- First to get all 4 pieces home wins

#### Board Position System

```
OUTER TRACK: 52 squares numbered 0–51 (global positions)

Player start positions (global):
  Red    = 0
  Green  = 13
  Yellow = 26
  Blue   = 39

Player's piece path uses "steps" (0–56):
  steps = -1   → in yard (home base, not on board)
  steps = 0    → just entered board (at player's start square, global = player_start)
  steps = 1–50 → on outer track
  steps = 51–55→ in home column (color-specific, cannot be captured)
  steps = 56   → reached home (finished, removed from active play)

Global position formula (for steps 0–50):
  global_pos = (player_start_pos + steps) % 52

Home column entry: when steps == 51, piece leaves outer track and enters home column.
  Home column squares are NOT on the outer track. They are rendered separately.
  Home column index = steps - 51 (0=first column square, 4=last before center)
```

#### Ludo Game State (server)
```python
{
  "current_player_index": int,         # index into players array (0–3)
  "phase": "roll" | "move" | "extra_roll",
  "dice_value": int | None,            # 1–6 or None
  "consecutive_sixes": int,            # 0–3
  "players": [
    {
      "name": str,
      "color_index": int,              # 0=Red, 1=Green, 2=Yellow, 3=Blue
      "pieces": [
        {"id": 0, "steps": -1},        # steps: -1=yard, 0–50=outer, 51–55=col, 56=home
        {"id": 1, "steps": -1},
        {"id": 2, "steps": -1},
        {"id": 3, "steps": -1},
      ],
      "pieces_home": 0,                # count of pieces at steps==56
      "is_finished": False,            # True when pieces_home == 4
    }
  ]
}
```

#### Ludo Actions (client → server)
```json
{ "action_type": "roll_dice", "payload": {} }
{ "action_type": "move_piece", "payload": { "piece_id": 0 } }
```

#### Ludo Backend Logic (`games/ludo/logic.py`)

```python
PLAYER_STARTS = [0, 13, 26, 39]       # global outer track starts per color_index
SAFE_SQUARES = {0, 8, 13, 21, 26, 34, 39, 47}

def get_global_pos(player_color_index: int, steps: int) -> int | None:
    """Returns global outer track position (0–51) for steps 0–50. None for yard/column/home."""
    if steps < 0 or steps > 50: return None
    return (PLAYER_STARTS[player_color_index] + steps) % 52

def get_valid_moves(game_state: dict, dice_value: int) -> list[int]:
    """Returns list of piece_ids that can legally move given dice value."""
    current = game_state["players"][game_state["current_player_index"]]
    valid = []
    for piece in current["pieces"]:
        s = piece["steps"]
        if s == 56: continue                             # already home
        if s == -1:
            if dice_value == 6: valid.append(piece["id"])  # only 6 can exit yard
        elif s + dice_value <= 56:
            valid.append(piece["id"])
    return valid

def apply_move(game_state: dict, player_index: int, piece_id: int, dice_value: int) -> dict:
    """
    Moves piece, handles captures, checks win, advances turn.
    Returns updated game_state.
    Raises ValueError if move is invalid.
    """
    # 1. Find piece in current player's pieces by piece_id
    # 2. If steps==-1 and dice==6: set steps=0
    # 3. Else: steps += dice_value
    # 4. Clamp to max 56
    # 5. If steps <= 50: check for captures (other players' pieces at same global pos, not on safe square)
    # 6. Captured piece: set steps = -1 for that piece
    # 7. Update pieces_home count
    # 8. If pieces_home == 4: set is_finished = True
    # 9. Check win condition: first player with is_finished=True
    # 10. Advance turn:
    #     - If dice==6 and steps != 56 and consecutive_sixes < 2: extra roll (same player, phase="roll")
    #     - If dice==6 and consecutive_sixes == 2: forfeit (next player)
    #     - Otherwise: next player (skip finished players)
    ...
```

---

### 8.2 BINGO

#### Rules (Standard American 5×5)
- 2–6 players
- Each player gets a unique 5×5 card
- Numbers in columns: B=1–15, I=16–30, N=31–45, G=46–60, O=61–75
- Center square (row 2, col 2, 0-indexed) is FREE (pre-marked)
- Each turn: host/server calls a random uncalled number from 1–75
- Players mark numbers on their card automatically (server tracks marks)
- Win conditions: any complete row, column, or diagonal (5 in a row including FREE)
- Server validates win, announces winner, game ends immediately on first BINGO

#### Bingo Game State (server)
```python
{
  "phase": "playing" | "finished",
  "called_numbers": list[int],          # numbers called so far (order matters for display)
  "current_number": int | None,         # most recently called number
  "numbers_remaining": list[int],       # shuffled pool of 1–75 not yet called
  "caller_turn_index": int,             # whose turn it is to request next number call
  "players": [
    {
      "name": str,
      "card": list[list[int]],          # 5×5 grid, center = 0 (FREE marker)
      "marked": list[list[bool]],       # 5×5 grid of marked state, center starts True
      "has_bingo": False,
    }
  ]
}
```

#### Card Generation Rules (`games/bingo/logic.py`)
```python
COLUMN_RANGES = {
  0: range(1, 16),     # B: 1–15
  1: range(16, 31),    # I: 16–30
  2: range(31, 46),    # N: 31–45
  3: range(46, 61),    # G: 46–60
  4: range(61, 76),    # O: 61–75
}
CENTER = (2, 2)        # row 2, col 2 is FREE

def generate_card() -> list[list[int]]:
    """Generate a unique 5×5 bingo card. Center = 0."""
    card = []
    for col in range(5):
        column_numbers = random.sample(list(COLUMN_RANGES[col]), 5)
        card.append(column_numbers)
    # Transpose: card[row][col]
    transposed = [[card[col][row] for col in range(5)] for row in range(5)]
    transposed[2][2] = 0   # FREE square
    return transposed

def generate_unique_cards(n: int) -> list[list[list[int]]]:
    """Generate n cards guaranteed unique (compare as frozensets of non-zero numbers)."""
    ...

def check_win(marked: list[list[bool]]) -> bool:
    """Check if any row, column, or diagonal is fully marked."""
    # Check 5 rows
    # Check 5 columns
    # Check 2 diagonals
    # Return True if any complete

def mark_number(card: list[list[int]], marked: list[list[bool]], number: int) -> bool:
    """Find number on card, mark it. Returns True if found."""
    for r in range(5):
        for c in range(5):
            if card[r][c] == number:
                marked[r][c] = True
                return True
    return False
```

#### Bingo Actions (client → server)
```json
{ "action_type": "call_next", "payload": {} }
```
Only the current caller (determined by `caller_turn_index`) can call next number.  
After calling, `caller_turn_index` advances to next player (wraps around).

#### Win Check
Server automatically checks all players' cards after each number is called.  
If any player has bingo: emit `game_over`.

---

### 8.3 CHESS

#### Rules
- Exactly 2 players
- Standard FIDE chess rules (implemented by `python-chess` on server, `chess.js` on client)
- White always plays first
- Slot 0 = White, Slot 1 = Black (assigned at game start)
- No time control (unlimited time per move)
- Game ends on: checkmate, stalemate, resignation, threefold repetition, 50-move rule, insufficient material
- Draw offer: one player offers, other accepts or declines

#### Chess Game State (server)
```python
{
  "fen": str,                           # Full FEN string — single source of truth
  "turn": "white" | "black",
  "phase": "playing" | "check" | "checkmate" | "stalemate" | "draw" | "resigned",
  "players": [
    {"name": str, "color": "white"},
    {"name": str, "color": "black"},
  ],
  "move_history": list[str],            # UCI notation: ["e2e4", "e7e5", ...]
  "last_move": {"from": str, "to": str} | None,   # algebraic: "e2", "e4"
  "draw_offer_from": str | None,        # socket_id of player who offered draw
  "captured_by_white": list[str],       # piece symbols captured BY white player
  "captured_by_black": list[str],
}
```

#### Chess Actions (client → server)
```json
{ "action_type": "move", "payload": { "from": "e2", "to": "e4", "promotion": "q" } }
{ "action_type": "resign", "payload": {} }
{ "action_type": "offer_draw", "payload": {} }
{ "action_type": "accept_draw", "payload": {} }
{ "action_type": "decline_draw", "payload": {} }
```
`promotion` field: `"q"` | `"r"` | `"b"` | `"n"` — only required for pawn promotion.

#### Chess Backend Logic (`games/chess/game.py`)
```python
import chess

class ChessGame(BaseGame):
    def initialize(self):
        self.board = chess.Board()
        # assign colors to players by slot
        ...

    def apply_action(self, socket_id, action_type, payload):
        if action_type == "move":
            uci = payload["from"] + payload["to"]
            if payload.get("promotion"):
                uci += payload["promotion"]
            move = chess.Move.from_uci(uci)
            if move not in self.board.legal_moves:
                raise ValueError("Illegal move")
            self.board.push(move)
            # check game-ending conditions: checkmate, stalemate, etc.
        elif action_type == "resign":
            # mark phase = "resigned", winner = opponent
        elif action_type == "offer_draw":
            self.draw_offer_from = socket_id
        elif action_type == "accept_draw":
            # validate draw_offer_from is not same player
            # mark phase = "draw"
        elif action_type == "decline_draw":
            self.draw_offer_from = None
```

#### Chess Frontend Logic (`games/chess/gameLogic.js`)
```js
import { Chess } from "chess.js"
// Client uses chess.js only for:
// 1. Highlighting legal moves for selected piece
// 2. Checking if move results in check (UI feedback only)
// Server is authoritative for all move validation
```

---

### 8.4 UNO

#### Rules — Standard UNO (108 cards)
- 2–6 players
- Deck composition:
  - 4 colors: Red, Green, Blue, Yellow
  - Per color: `0`×1, `1–9`×2, `Skip`×2, `Reverse`×2, `Draw Two`×2 = 25 per color = 100
  - Wild: ×4, Wild Draw Four: ×4 = 8
  - Total: 108
- Deal 7 cards to each player at game start
- Flip top card of remaining deck → discard pile starter (if Wild or WD4, re-draw)
- On your turn: play a matching card (same color OR same value/type) or draw 1 card
- After drawing 1: may play drawn card if it matches, else pass
- Wild: declare color, play on any color
- Wild Draw Four: play on any color, next player draws 4 and skips — only if you have no matching color (honor rule — not enforced server-side per standard UNO)
- Skip: next player loses their turn
- Reverse: direction flips (with 2 players, Reverse acts as Skip)
- Draw Two: next player draws 2 and skips. **No stacking** (standard rule)
- UNO: when you have 1 card left, you must "call UNO" (action) — if you don't before next player acts, you draw 2
- Win: first player to empty their hand

#### Card Representation
```python
# Python
{
  "color": "red" | "green" | "blue" | "yellow" | "wild",
  "type": "number" | "skip" | "reverse" | "draw_two" | "wild" | "wild_draw_four",
  "value": int | None,    # 0–9 for number cards, None for action/wild
  "id": int,              # unique card id (0–107) for tracking
}
```

#### UNO Game State (server)
```python
{
  "phase": "playing" | "finished",
  "current_player_index": int,
  "direction": 1 | -1,                 # 1=clockwise, -1=counterclockwise
  "discard_top": Card,                 # top card of discard pile
  "active_color": str,                 # current valid color (may differ from discard_top.color for wilds)
  "draw_pile_count": int,
  "pending_draw": int,                 # draw_two accumulation — always 0 in standard (no stack)
  "must_draw": bool,                   # player must draw before playing
  "players": [
    {
      "name": str,
      "hand": list[Card],              # ONLY sent to that player's socket
      "hand_count": int,               # sent to all
      "has_called_uno": bool,
    }
  ],
  "last_action_summary": str,
}
```

#### UNO Actions (client → server)
```json
{ "action_type": "play_card", "payload": { "card_id": 42, "chosen_color": "red" } }
{ "action_type": "draw_card", "payload": {} }
{ "action_type": "call_uno", "payload": {} }
```
`chosen_color` required only when playing Wild or Wild Draw Four.

#### UNO Backend Logic (`games/uno/logic.py`)
```python
def build_deck() -> list[Card]:
    """Build standard 108-card UNO deck with unique IDs 0–107."""
    ...

def deal_hands(deck, num_players, cards_per_player=7):
    """Deal cards_per_player to each player. Returns (player_hands, remaining_deck)."""
    ...

def is_playable(card: Card, discard_top: Card, active_color: str) -> bool:
    """
    Returns True if card can be played on discard_top with active_color.
    Wild and WD4 are always playable.
    Others: match color OR match type/value.
    """
    if card["type"] in ("wild", "wild_draw_four"): return True
    if card["color"] == active_color: return True
    if card["type"] == "number" and discard_top["type"] == "number" and card["value"] == discard_top["value"]: return True
    if card["type"] != "number" and card["type"] == discard_top["type"]: return True
    return False

def apply_card_effect(game_state, card, chosen_color=None) -> dict:
    """Apply card effects (skip, reverse, draw_two, wild). Advance player index."""
    ...

def get_next_player_index(current: int, num_players: int, direction: int) -> int:
    return (current + direction) % num_players
```

#### UNO Hidden State
When broadcasting `game_state_update`, server builds personalized state per socket:
```python
def get_state_for(self, socket_id):
    state = self.get_state()
    for p in state["players"]:
        if p["socket_id"] != socket_id:
            del p["hand"]             # remove hand, keep hand_count
    return state
```

---

## 9. UI/UX SPECIFICATION

### 9.1 Color Palette
```css
/* Global CSS variables in index.css */
:root {
  --bg-primary: #0a0a0f;          /* near-black background */
  --bg-secondary: #13131a;         /* card/panel background */
  --bg-glass: rgba(255,255,255,0.05); /* glassmorphism bg */
  --border-glass: rgba(255,255,255,0.08);
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-green: #22c55e;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
}
```

### 9.2 Typography
```css
font-family: 'Inter', system-ui, sans-serif;   /* import from Google Fonts */
/* Game title: 'Nunito' (rounded, friendly) */
/* Numbers/scores: 'JetBrains Mono' (monospace) */
```

### 9.3 Global Background
Full-screen animated particle field — 30 floating dots (pure CSS, `@keyframes float`), no library. Dots are 2–4px, opacity 0.1–0.3, random positions, animated with varying durations (8–20s) and directions.

### 9.4 HomePage Layout
```
Full viewport, centered column:
  ┌─────────────────────────────────┐
  │   🎮  GameZone                  │  ← Title (Nunito, 72px, gradient text)
  │   "Pick a game, make a room,    │  ← Subtitle (muted text)
  │    share the code, play."       │
  │                                 │
  │   ┌──────┐ ┌──────┐            │  ← Game cards row
  │   │ LUDO │ │BINGO │            │
  │   └──────┘ └──────┘            │
  │   ┌──────┐ ┌──────┐            │
  │   │CHESS │ │ UNO  │            │
  │   └──────┘ └──────┘            │
  │                                 │
  │   Your name: [BlueFox42] ✏️    │  ← Editable name, inline
  └─────────────────────────────────┘
```

**GameCard hover effect**: CSS `transform: perspective(800px) rotateX(5deg) rotateY(5deg)` + glow shadow. Use `mousemove` event on card to calculate rotation from cursor position.

### 9.5 GameCard Click → Modal
Clicking a GameCard opens an overlay modal (Framer Motion `AnimatePresence`, scale + fade):
```
┌──────────────────────────┐
│ 🎲 Ludo                  │
│ 2–4 players              │
│                          │
│ [Create Room]            │
│ [Join Room  ]            │
│                          │
│ ── or ──                 │
│ Room code: [___] [Join]  │
└──────────────────────────┘
```

### 9.6 Room ID Display (RoomCode component)
```
┌──────────────────────────┐
│ Room Code                │
│  ┌────────────────────┐  │
│  │      7  4  2       │  │  ← Large monospace digits, colored
│  └────────────────────┘  │
│  [Copy]  [Share]         │
└──────────────────────────┘
```
Each digit displayed in its own box. Glow effect on hover.

### 9.7 RoomLobby Layout
```
┌──────────────────────────────────┐
│  🎲 Ludo — Room 742   [Leave]    │
│  ─────────────────────────────── │
│  Players (2/4):                  │
│   👤 BlueFox42  [Host] [Ready✓]  │
│   👤 RedTiger99        [Ready✓]  │
│   ➕ Waiting...                  │
│   ➕ Waiting...                  │
│  ─────────────────────────────── │
│  [Ready Up]    [Start Game] ★    │  ← Start only for host, only when all ready
└──────────────────────────────────┘
```

### 9.8 In-Game Layout
```
┌─────────────────────────────────────────────────────┐
│ [🎮 GameZone]  Room: 742   Players: ● BlueFox ● Red │  ← Top bar
├────────────────────────────────────┬────────────────┤
│                                    │   SCORE PANEL  │
│                                    │   ─────────── │
│         GAME BOARD                 │   Chat drawer  │
│         (center)                   │   (slides in)  │
│                                    │                │
│                                    │   [💬 Chat]    │
└────────────────────────────────────┴────────────────┘
```

Chat drawer: fixed 320px wide panel on the right. Toggleable via chat button. Badge shows unread count when closed.

### 9.9 TurnBanner
Centered at top of game board area:
- **Your turn**: green glow, "🎯 Your Turn!" — pulse animation
- **Other's turn**: muted, "RedTiger99's turn..." — no animation

### 9.10 WinScreen
Full-screen overlay (semi-transparent dark, `z-index: 999`):
```
      🎉
  BlueFox42 Wins!
  
  [Play Again]  [Go Home]
```
`canvas-confetti` fires burst from center. `Framer Motion` scales in with spring.

### 9.11 Player Avatar (Avatar.jsx)
Circle with colored background, initials (first 2 chars of name). Colors cycle:
`["#ef4444","#3b82f6","#22c55e","#f59e0b","#8b5cf6","#ec4899"]`

---

## 10. ANIMATION SPECIFICATIONS

| Element | Library | Spec |
|---|---|---|
| Page transitions | Framer Motion | `initial: {opacity:0, y:20}` → `animate: {opacity:1, y:0}` → `exit: {opacity:0, y:-20}`, duration 0.3s |
| Game card hover | CSS + JS | `perspective(800px) rotateX` ±10deg based on cursor, `transition: 0.1s` |
| Modal open | Framer Motion | `scale: 0.9 → 1.0`, `opacity: 0 → 1`, spring stiffness 300 |
| Ludo piece move | Framer Motion `layoutId` | Animate to new position, duration 0.4s, ease "easeInOut" |
| Ludo dice roll | CSS `@keyframes` | `rotateX` 720deg + `rotateY` 360deg in 0.8s, 3 iterations |
| Bingo number ball | Framer Motion | Drop from top (y: -100→0), bounce (spring), scale 1.5→1 |
| Bingo cell mark | Framer Motion | Scale 0→1, background color fade, duration 0.3s |
| Chess piece drag | Framer Motion drag | `dragConstraints` = board, `dragElastic` 0.1 |
| Chess move highlight | CSS | `box-shadow: inset 0 0 0 4px rgba(255,235,0,0.6)` |
| UNO card play | Framer Motion | Card animates to discard pile position + rotation, duration 0.5s |
| UNO card draw | Framer Motion | Slide from draw pile position to hand, duration 0.4s |
| UNO hand fan | CSS transform | `rotate(n * step_angle)` where step_angle = min(10, 60/(hand_size-1)) degrees |
| Win screen confetti | canvas-confetti | `confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } })` |
| Chat drawer | Framer Motion | `x: 320 → 0`, duration 0.3s, ease "easeOut" |

---

## 11. SOUND DESIGN

All sounds triggered via `useSound.js` hook wrapping `Howler.js`.

```js
// useSound.js
export function useSound(game) {
  const enabled = getSoundEnabled()
  const sounds = useMemo(() => loadSoundsForGame(game), [game])
  return (key) => { if (enabled && sounds[key]) sounds[key].play() }
}
```

Respect `getSoundEnabled()` from localStorage. Mute toggle in top bar of game.

---

## 12. ENVIRONMENT VARIABLES

**Frontend** (`.env` in `frontend/`):
```
VITE_BACKEND_URL=http://localhost:8000
```

**Backend** (no `.env` file — use `config.py` only):
```python
PORT = 8000
```

---

## 13. VITE CONFIG (`vite.config.js`)

```js
export default {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/socket.io": {
        target: "http://localhost:8000",
        ws: true,
      }
    }
  }
}
```

---

## 14. PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Backend run command: `uvicorn main:app --reload --port 8000`

---

## 15. OPEN QUESTIONS (Must be answered before implementing these sections)

| # | Question | Affects | Status |
|---|---|---|---|
| OQ-1 | Bingo variant: Standard 5×5 (1–75) or Indian Tambola/Housie (1–90, 3×9 ticket)? | `games/bingo/` entirely | ⬜ UNANSWERED |
| OQ-2 | Chess: Should there be a move timer (e.g., 10 min per player)? | `games/chess/game.py`, UI clock | ⬜ UNANSWERED |
| OQ-3 | UNO house rules: (a) Stack +2/+4? (b) 7-0 rule? | `games/uno/logic.py` | ⬜ UNANSWERED |
| OQ-4 | UI color theme: Confirm dark glassmorphism or specific brand colors? | `index.css`, design system | ⬜ UNANSWERED |
| OQ-5 | Deployment target: Local only? Railway + Vercel? Other? | `config.py`, CORS origins | ⬜ UNANSWERED |
| OQ-6 | App name / title shown in browser tab + header? | `index.html`, `HomePage.jsx` | ⬜ UNANSWERED |

---

> [!NOTE]
> Any LLM implementing this plan: check the **Implementation Checklist** document for current progress. Update checklist items as you complete them. Never mark a section done unless ALL sub-items are complete and tested locally.
