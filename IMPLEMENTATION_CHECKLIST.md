# 🗂️ Implementation Checklist
**Platform**: Multiplayer Game Platform (Ludo · Bingo · Chess · UNO)  
**Reference**: See `IMPLEMENTATION_PLAN.md` for all specs  
**Rule**: Check off `[x]` ONLY when item is fully coded AND verified to work locally.

---

## STATUS KEY
- `[ ]` Not started  
- `[~]` In progress  
- `[x]` Complete and verified  
- `[!]` Blocked (see note)

---

## PHASE 0 — RESOLVE OPEN QUESTIONS
> Complete before writing any game logic

- [ ] OQ-1: Bingo variant confirmed (5×5 or Tambola)
- [ ] OQ-2: Chess timer confirmed (yes/no + duration)
- [ ] OQ-3: UNO house rules confirmed (stack +2? 7-0?)
- [ ] OQ-4: UI theme confirmed
- [ ] OQ-5: Deployment target confirmed
- [ ] OQ-6: App name confirmed

---

## PHASE 1 — PROJECT SCAFFOLD

### 1.1 Repository Setup
- [ ] Create `d:\Multi_game\frontend\` directory
- [ ] Create `d:\Multi_game\backend\` directory
- [ ] Create `d:\Multi_game\.gitignore`
- [ ] Create `d:\Multi_game\README.md` (brief run instructions)

### 1.2 Frontend Scaffold (Vite + React)
- [ ] Run `npm create vite@latest frontend -- --template react` in `d:\Multi_game\`
- [ ] Install all dependencies listed in IMPLEMENTATION_PLAN.md §2
- [ ] Configure `tailwind.config.js` (content paths set to `./src/**/*.{js,jsx}`)
- [ ] Configure `postcss.config.js`
- [ ] Add Tailwind directives to `index.css`
- [ ] Add CSS variables from §9.1 to `index.css`
- [ ] Add Google Fonts import (Inter, Nunito, JetBrains Mono) to `index.html`
- [ ] Configure `vite.config.js` with proxy (§13)
- [ ] Create `.env` file with `VITE_BACKEND_URL`
- [ ] Delete Vite boilerplate (App.css, logo, counter)

### 1.3 Backend Scaffold (FastAPI + Socket.IO)
- [ ] Create `backend/requirements.txt` with all deps (§2)
- [ ] Create Python virtual environment: `python -m venv venv`
- [ ] Install requirements: `pip install -r requirements.txt`
- [ ] Create `backend/config.py` (§6.1)
- [ ] Create `backend/main.py` with FastAPI + Socket.IO mounted (§6.2)
- [ ] Verify server starts: `uvicorn main:app --reload --port 8000`
- [ ] Verify WebSocket connection works from browser (basic ping/pong test)

---

## PHASE 2 — PLATFORM CORE (Room System + Chat)

### 2.1 Backend — Models
- [ ] Create `backend/models/__init__.py`
- [ ] Create `backend/models/player.py` (Player dataclass — §4.1)
- [ ] Create `backend/models/room.py` (Room dataclass — §4.2)
- [ ] Create `backend/models/events.py` (Pydantic event models — §5.2)

### 2.2 Backend — Room Manager
- [ ] Create `backend/room_manager.py` (RoomManager class — §6.3)
- [ ] Implement `generate_room_id()` — 3-digit, zero-padded, unique
- [ ] Implement `create_room()` — creates Room, adds host Player
- [ ] Implement `get_room()` — by room_id string
- [ ] Implement `get_room_by_socket()` — by socket_id
- [ ] Implement `join_room()` — adds Player to Room, validates capacity + name uniqueness
- [ ] Implement `leave_room()` — removes Player, handles host transfer
- [ ] Implement `mark_disconnected()` — sets is_connected=False, disconnect_time
- [ ] Implement `try_reconnect()` — matches by name+room_id, checks 60s TTL
- [ ] Implement `cleanup_expired_disconnects()` — removes slots past 60s
- [ ] Unit test: create room, join, leave (Python assertions in `__main__`)

### 2.3 Backend — Base Game
- [ ] Create `backend/games/__init__.py`
- [ ] Create `backend/games/base_game.py` (BaseGame ABC — §6.5)
- [ ] Create `GAME_REGISTRY` dict: `{"ludo": LudoGame, "bingo": BingoGame, "chess": ChessGame, "uno": UnoGame}`

### 2.4 Backend — Socket Handler
- [ ] Create `backend/socket_handler.py` with all handler stubs
- [ ] Implement `on_create_room`: validate data → create room → emit `room_created` → emit `player_joined` to room
- [ ] Implement `on_join_room`: validate → join → emit `room_joined` to joiner → emit `player_joined` to room
- [ ] Implement `on_disconnect`: mark disconnected → emit `player_disconnected` to room
- [ ] Implement `on_reconnect_room`: reconnect → re-join socketio room → emit state to socket → emit `player_reconnected` to room
- [ ] Implement `on_leave_room`: remove → emit `player_left` to room
- [ ] Implement `on_toggle_ready`: flip ready flag → emit `player_ready_changed` to room
- [ ] Implement `on_start_game`: validate host + all ready + min players met → `game.initialize()` → emit `game_started`
- [ ] Implement `on_game_action`: validate turn → `game.apply_action()` → emit `game_state_update` → check game_over
- [ ] Implement `on_chat_message`: validate 200 char limit → store → emit `chat_broadcast` to room
- [ ] Error handling: all handlers wrapped in try/except → emit `room_error` or `error` on failure

### 2.5 Frontend — Utils + Store
- [ ] Create `src/utils/nameGenerator.js` (§7.4) — 50 adjectives, 50 animals, 2-digit number
- [ ] Create `src/utils/localStorage.js` (§7.5) — typed get/set for PLAYER_NAME, SOUND_ENABLED, MUSIC_ENABLED
- [ ] Create `src/utils/roomCode.js` — `formatRoomId(n)`: zero-pad to 3 digits; `isValidRoomId(s)`: string is "000"–"999"
- [ ] Create `src/socket/events.js` (§7.2) — EVENTS constant object
- [ ] Create `src/socket/socket.js` (§7.3) — Socket.IO singleton
- [ ] Create `src/config/games.js` (§7.1) — GAMES array
- [ ] Create `src/store/playerStore.js` (Zustand — §7.6)
- [ ] Create `src/store/roomStore.js` (Zustand — §7.7)
- [ ] Create `src/store/chatStore.js` (Zustand — §7.8)
- [ ] Create `src/store/index.js` — exports all stores

### 2.6 Frontend — Hooks
- [ ] Create `src/hooks/useLocalPlayer.js` — on first render: load name from LS or generate random, store back; expose `name`, `setName`
- [ ] Create `src/hooks/useSocket.js` — connects socket on mount, disconnects on unmount; exposes `socket`, `connected`
- [ ] Create `src/hooks/useRoom.js` — registers all room-level socket listeners (`player_joined`, `player_left`, etc.); updates roomStore
- [ ] Create `src/hooks/useSound.js` (§11)

### 2.7 Frontend — UI Components
- [ ] Create `src/components/ui/Button.jsx` — variants: primary (filled, blue), secondary (outlined), ghost (transparent); `size`: sm/md/lg; disabled state; loading spinner state
- [ ] Create `src/components/ui/Input.jsx` — styled text input, label, error message, maxLength prop
- [ ] Create `src/components/ui/Modal.jsx` — Framer Motion AnimatePresence overlay; `isOpen`, `onClose`, `title`, `children`
- [ ] Create `src/components/ui/Avatar.jsx` — colored circle, 2-char initials (§9.11); `name`, `size` props
- [ ] Create `src/components/ui/Badge.jsx` — small pill: "Host" (gold), "Ready" (green), "Online" (blue dot), "Disconnected" (red dot)
- [ ] Create `src/components/ui/Toast.jsx` — fixed bottom-right, auto-dismiss 3s, Framer Motion slide up
- [ ] Create `src/components/ui/Spinner.jsx` — CSS spin animation
- [ ] Create `src/components/layout/PageTransition.jsx` — Framer Motion wrapper (§10 page transitions spec)
- [ ] Create `src/components/layout/GameLayout.jsx` — split layout: game board area left, chat panel right; top bar; mute button
- [ ] Create `src/components/layout/LobbyLayout.jsx` — centered content, background particle field

### 2.8 Frontend — Background Particle Field
- [ ] Add 30 `<div>` dots to LobbyLayout via `useMemo` with randomized CSS positions/sizes/animation-delay
- [ ] Add `@keyframes float` in `index.css`: translates dot on X and Y axes
- [ ] Each dot: `width/height: 2–4px random`, `opacity: 0.1–0.3 random`, `animation: float Xs infinite alternate`, `X = random 8–20s`

### 2.9 Frontend — Lobby Pages
- [ ] Create `src/components/lobby/HomePage.jsx` — LobbyLayout + title + 2×2 game card grid + inline name editor (§9.4)
- [ ] Create `src/components/lobby/GameCard.jsx` — colored card with emoji + title; hover 3D tilt via `onMouseMove` (§9.4); click → open modal
- [ ] Create `src/components/lobby/CreateRoomModal.jsx` — Modal showing "Create Room" button, calls `create_room` socket event
- [ ] Create `src/components/lobby/JoinRoomModal.jsx` — 3-digit number input + join button, calls `join_room` socket event

### 2.10 Frontend — Room Lobby
- [ ] Create `src/components/room/RoomCode.jsx` — large digit display with copy button (§9.6)
- [ ] Create `src/components/room/PlayerSlot.jsx` — Avatar + name + badges (Host/Ready); empty slot shows "Waiting..."
- [ ] Create `src/components/room/RoomLobby.jsx` — game name + room code + player slots + ready button + start button (§9.7)

### 2.11 Frontend — Chat
- [ ] Create `src/components/chat/ChatInput.jsx` — controlled input (max 200 chars) + send button; Enter key sends
- [ ] Create `src/components/chat/ChatMessage.jsx` — avatar + name + text + relative timestamp
- [ ] Create `src/components/chat/ChatDrawer.jsx` — right-side slide-in panel (§10 chat drawer spec); unread badge; list of ChatMessages; ChatInput at bottom; scroll-to-bottom on new message

### 2.12 Frontend — Routing
- [ ] Create `src/App.jsx` with React Router routes:
  - `"/"` → `HomePage`
  - `"/room/:roomId"` → `RoomLobby` (checks roomStore, redirects if no active room)
  - `"/game/:roomId"` → `GameLayout` (lazy-loads game component from `roomStore.game`)
- [ ] After `create_room` success: navigate to `/room/:roomId`
- [ ] After `join_room` success: navigate to `/room/:roomId`
- [ ] After `game_started`: navigate to `/game/:roomId`

### 2.13 End-to-End Platform Test
- [ ] Two browser tabs can create + join a room
- [ ] Player names show in both tabs
- [ ] Ready toggle syncs across tabs
- [ ] Host can start game when all ready (min 2 players)
- [ ] Chat messages sync across tabs
- [ ] Closing tab → other tab sees "disconnected" badge
- [ ] Refreshing tab within 60s → reconnects and rejoins room

---

## PHASE 3 — LUDO GAME

### 3.1 Backend — Ludo
- [ ] Create `backend/games/ludo/__init__.py`
- [ ] Create `backend/games/ludo/constants.py`:
  - `PLAYER_STARTS = [0, 13, 26, 39]`
  - `SAFE_SQUARES = {0, 8, 13, 21, 26, 34, 39, 47}`
  - `COLORS = ["red", "green", "yellow", "blue"]`
- [ ] Create `backend/games/ludo/logic.py`:
  - `get_global_pos(color_index, steps) → int | None`
  - `get_valid_moves(game_state, dice_value) → list[int]`
  - `apply_move(game_state, player_index, piece_id, dice_value) → dict`
  - `roll_dice() → int` — returns `random.randint(1, 6)`
  - `next_player_index(current, players) → int` — skips finished players
- [ ] Create `backend/games/ludo/game.py` (LudoGame extends BaseGame):
  - `initialize()` — creates state with all pieces at steps=-1
  - `apply_action()` — handles `roll_dice` and `move_piece`
  - `is_game_over()` — True when any player has is_finished=True
  - `get_winner()` — name of first is_finished player
  - `get_state()` — returns full game_state dict
- [ ] Unit test Ludo logic: piece exit, capture, home column, win detection

### 3.2 Frontend — Ludo
- [ ] Create `src/games/ludo/constants.js`:
  - `BOARD_SIZE = 15` (15×15 grid)
  - `PLAYER_STARTS` (global positions)
  - `SAFE_SQUARES`
  - `COLORS = ["red", "green", "yellow", "blue"]`
  - `COLOR_HEX = {red:"#ef4444", green:"#22c55e", yellow:"#eab308", blue:"#3b82f6"}`
  - `BOARD_PATH` — array of 52 `{row, col}` objects in order (outer track positions on 15×15 grid)
  - `HOME_COLUMNS` — per-color: array of 5 `{row, col}` objects
  - `HOME_BASE_POSITIONS` — per-color: 4 `{row, col}` for yard circles
- [ ] Create `src/games/ludo/gameLogic.js`:
  - `getGlobalPos(colorIndex, steps)` — same formula as backend
  - `getBoardCoords(colorIndex, steps)` — returns `{row, col}` pixel grid coords
  - `getValidMoves(gameState, myColorIndex, diceValue)` — returns valid piece IDs
- [ ] Create `src/games/ludo/LudoBoard.jsx` — renders 15×15 SVG board:
  - Colored home bases in 4 corners (6×6 squares each)
  - Outer track squares with safe square stars (⭐)
  - Colored home columns
  - Center home triangle/star
- [ ] Create `src/games/ludo/LudoPiece.jsx` — Framer Motion animated circle:
  - `layoutId` for smooth position transition
  - Highlighted ring when piece can be moved
  - Click handler emits `move_piece` action
- [ ] Create `src/games/ludo/LudoDice.jsx` — 3D CSS dice:
  - Shows face with dots for value 1–6
  - Roll animation (§10 dice spec)
  - Disabled when not player's turn
  - Click emits `roll_dice` action
- [ ] Create `src/games/ludo/LudoGame.jsx`:
  - Listens to `game_state_update` and `game_over`
  - Updates local game state
  - Renders: LudoBoard + LudoDice + TurnBanner + ScorePanel
  - Shows valid move highlights after dice rolled
- [ ] Create `src/games/ludo/index.jsx` — lazy-loaded entry: `export default LudoGame`

### 3.3 Ludo Sound Triggers
- [ ] On `roll_dice` action sent: play `dice_roll.mp3`
- [ ] On `state_update` with moved piece: play `piece_move.mp3`
- [ ] On `state_update` with captured piece: play `piece_capture.mp3`
- [ ] On `game_over` (winner = local player): play `win.mp3`

### 3.4 Ludo Game Test
- [ ] 2-player Ludo: full game playable, win detected correctly
- [ ] 4-player Ludo: captures work correctly
- [ ] Consecutive sixes: 3rd six = forfeited turn
- [ ] Piece returns to yard on capture
- [ ] Pieces in safe squares cannot be captured
- [ ] Pieces in home column cannot be captured
- [ ] First player to get all 4 pieces home wins

---

## PHASE 4 — BINGO GAME

> [!IMPORTANT]  
> Complete OQ-1 (Bingo variant) before starting Phase 4.

### 4.1 Backend — Bingo
- [ ] Create `backend/games/bingo/__init__.py`
- [ ] Create `backend/games/bingo/constants.py` — column ranges, CENTER position
- [ ] Create `backend/games/bingo/logic.py`:
  - `generate_card() → list[list[int]]` — 5×5, center=0
  - `generate_unique_cards(n) → list[...]` — no duplicate cards
  - `mark_number(card, marked, number) → bool`
  - `check_win(marked) → bool` — 5 rows, 5 cols, 2 diagonals
- [ ] Create `backend/games/bingo/game.py` (BingoGame extends BaseGame):
  - `initialize()` — generate unique cards per player, shuffle 1–75 pool, center pre-marked
  - `apply_action()` — only `call_next` from current caller
  - Advance `caller_turn_index` after each call
  - Auto-check all players for win after each call
  - `is_game_over()`, `get_winner()`, `get_state()`
- [ ] Unit test: card generation unique, win detection all 12 patterns

### 4.2 Frontend — Bingo
- [ ] Create `src/games/bingo/constants.js` — column labels, ranges, colors
- [ ] Create `src/games/bingo/gameLogic.js`:
  - `checkWin(marked) → bool`
  - `getWinningLines(marked) → list[list[{r,c}]]` — for highlight animation
- [ ] Create `src/games/bingo/BingoCard.jsx`:
  - 5×5 grid with column headers B-I-N-G-O
  - Each cell: number display + marked state (Framer Motion scale+color animation)
  - FREE center cell always marked
  - Winning line cells highlighted with glow
- [ ] Create `src/games/bingo/NumberBall.jsx` — animated ball dropping from top:
  - Large circle with number inside
  - Framer Motion: `y: -100 → 0`, spring animation, then scale 1.5→1
- [ ] Create `src/games/bingo/CalledNumbers.jsx` — scrollable horizontal strip of all called numbers
- [ ] Create `src/games/bingo/BingoGame.jsx`:
  - Shows own card prominently
  - Other players' cards shown small below (or sidebar)
  - CalledNumbers strip at top
  - NumberBall animation per new call
  - "Call Next Number" button — only for current caller
  - Marked cells auto-update on `game_state_update`

### 4.3 Bingo Sound Triggers
- [ ] On `call_next` action: play `number_call.mp3` when new number received
- [ ] On mark applied: play `mark.mp3`
- [ ] On win: play `bingo.mp3` + confetti

### 4.4 Bingo Game Test
- [ ] 2-player: full game to win
- [ ] 6-player: all cards unique
- [ ] Win detection: row, column, diagonal all work
- [ ] Only current caller can call next number
- [ ] Auto-mark and win-check happen server-side

---

## PHASE 5 — CHESS GAME

> [!IMPORTANT]
> Complete OQ-2 (timer) before starting Phase 5.

### 5.1 Backend — Chess
- [ ] Create `backend/games/chess/__init__.py`
- [ ] Create `backend/games/chess/constants.py`
- [ ] Create `backend/games/chess/game.py` (ChessGame extends BaseGame):
  - `initialize()` — fresh `chess.Board()`, assign white/black by slot order
  - `apply_action()` — handles: `move`, `resign`, `offer_draw`, `accept_draw`, `decline_draw`
  - Move validation via `chess.Board.legal_moves`
  - Detect: checkmate, stalemate, 50-move rule, repetition, insufficient material
  - `is_game_over()`, `get_winner()`, `get_state()` returns FEN + metadata

### 5.2 Frontend — Chess
- [ ] Install `chess.js` dependency
- [ ] Create `src/games/chess/constants.js` — piece Unicode map (♙♖♗♘♕♔ / ♟♜♝♞♛♚), square colors
- [ ] Create `src/games/chess/gameLogic.js`:
  - `chess.js` instance initialized from FEN
  - `getLegalMovesForSquare(fen, square) → string[]` — UCI "to" squares
  - `isPawnPromotion(from, to) → bool`
- [ ] Create `src/games/chess/ChessPiece.jsx` — piece rendered as Unicode/SVG:
  - Framer Motion drag (only own pieces on own turn)
  - `dragConstraints` = board ref
  - On drag end: calculate target square, emit `move` action
  - Also supports click-to-select + click-to-move (for non-drag users)
- [ ] Create `src/games/chess/ChessBoard.jsx`:
  - 8×8 grid of squares
  - Alternating light/dark squares (light: `#f0d9b5`, dark: `#b58863` — standard wood)
  - Rank/file labels (a–h, 1–8)
  - Selected square highlight (yellow border)
  - Legal move highlights (green dot for empty, green ring for capture)
  - Last move highlight (subtle yellow tint on from+to squares)
  - Check highlight (red tint on king square)
  - ChessPiece components positioned on correct squares
- [ ] Create `src/games/chess/CapturedPieces.jsx` — two rows showing captures
- [ ] Create `src/games/chess/MoveHistory.jsx` — scrollable list of moves in algebraic notation, auto-scrolls to bottom
- [ ] Create `src/games/chess/ChessGame.jsx`:
  - Renders board with correct orientation (black player sees flipped board)
  - Draw offer UI (toast + accept/decline buttons)
  - Resign button with confirmation dialog
  - Game phase display (Check!, Checkmate, etc.)
- [ ] Create `src/games/chess/index.jsx`

### 5.3 Chess Sound Triggers
- [ ] `move`: play `move.mp3`
- [ ] `move` resulting in capture: play `capture.mp3`
- [ ] State update with `phase == "check"`: play `check.mp3`
- [ ] `game_over`: play `game_end.mp3`

### 5.4 Chess Game Test
- [ ] Legal moves only possible for own pieces on own turn
- [ ] Illegal moves rejected by server
- [ ] Castling, en passant, pawn promotion work correctly
- [ ] Check detected and displayed
- [ ] Checkmate ends game correctly
- [ ] Stalemate ends game as draw
- [ ] Resign works
- [ ] Draw offer/accept works

---

## PHASE 6 — UNO GAME

> [!IMPORTANT]
> Complete OQ-3 (house rules) before starting Phase 6.

### 6.1 Backend — UNO
- [ ] Create `backend/games/uno/__init__.py`
- [ ] Create `backend/games/uno/constants.py` — card types, colors
- [ ] Create `backend/games/uno/logic.py`:
  - `build_deck() → list[Card]` — 108 cards with unique IDs 0–107
  - `shuffle_deck(deck) → list[Card]`
  - `deal_hands(deck, n, 7) → (hands, remaining)`
  - `is_playable(card, discard_top, active_color) → bool`
  - `apply_card_effect(state, card, chosen_color) → state`
  - `get_next_player_index(current, n, direction) → int`
- [ ] Create `backend/games/uno/game.py` (UnoGame extends BaseGame):
  - `initialize()` — build + shuffle deck, deal 7 each, flip starter (re-flip if Wild)
  - `apply_action()` — handles `play_card`, `draw_card`, `call_uno`
  - Validate: it's player's turn, card is in hand, card is playable
  - UNO penalty: if player plays to 1 card and didn't call UNO before next player acts → draw 2
  - `get_state_for(socket_id)` — removes other players' hand arrays
  - `is_game_over()`, `get_winner()`

### 6.2 Frontend — UNO
- [ ] Create `src/games/uno/constants.js`:
  - `CARD_COLORS = {red:"#ef4444", green:"#22c55e", blue:"#3b82f6", yellow:"#eab308", wild:"#1a1a2e"}`
  - `CARD_TYPES`, `TYPE_LABELS` (symbols for skip ⊘, reverse ↺, +2, +4)
- [ ] Create `src/games/uno/gameLogic.js`:
  - `isPlayable(card, discardTop, activeColor) → bool` (client-side check for UI)
- [ ] Create `src/games/uno/UnoCard.jsx`:
  - Rounded rectangle card with colored background
  - White oval center with value/type symbol
  - Wild cards: 4-color quadrant design
  - Hover: lifts up (`translateY(-8px)`)
  - Playable cards: glowing border in active color
  - Non-playable: 50% opacity, no hover effect
  - Click emits `play_card` action (if playable + player's turn)
- [ ] Create `src/games/uno/UnoHand.jsx`:
  - Fan layout: cards fanned with rotation (§10 UNO hand fan spec)
  - On hover of a card: it lifts from fan
  - Cards sorted by color then value
- [ ] Create `src/games/uno/UnoDiscardPile.jsx`:
  - Shows top card large in center
  - Previous card slightly visible behind (slight offset)
  - Card play animation: new card flies from hand to pile (Framer Motion — §10)
- [ ] Create `src/games/uno/DrawPile.jsx`:
  - Stack of face-down cards (3 offset layers for depth effect)
  - Click to draw (if player's turn and no playable card or choosing to draw)
  - Shows count label
- [ ] Create `src/games/uno/ColorPicker.jsx`:
  - Modal overlay appearing after playing Wild/WD4
  - 4 colored circles (Red, Green, Blue, Yellow)
  - Click → emits color choice
- [ ] Create `src/games/uno/UnoPlayerStatus.jsx`:
  - Row of other players: avatar + name + card count
  - Card back thumbnails showing hand_count
  - "UNO!" badge when hand_count == 1
- [ ] Create `src/games/uno/UnoGame.jsx`:
  - Center: DrawPile + DiscardPile side by side
  - Bottom: own UnoHand
  - Top/sides: UnoPlayerStatus for other players
  - "UNO!" call button (shown when own hand has 2 cards, disappears after playing to 1)
  - ColorPicker overlay when wild played
  - Direction indicator (arrow showing clockwise/counterclockwise)
- [ ] Create `src/games/uno/index.jsx`

### 6.3 UNO Sound Triggers
- [ ] Card played: `card_play.mp3`
- [ ] Card drawn: `card_draw.mp3`
- [ ] Someone calls UNO: `uno_call.mp3` (play for everyone)
- [ ] Win: `win.mp3`

### 6.4 UNO Game Test
- [ ] 2-player: reverse acts as skip
- [ ] Cards dealt correctly (7 each)
- [ ] Playability rules work (color match, type match, wild always)
- [ ] Skip and Reverse work correctly
- [ ] Draw Two: next player draws 2 and skips
- [ ] Wild: player picks color
- [ ] Wild Draw Four: next player draws 4 and skips
- [ ] UNO penalty: not calling UNO → draw 2 on next player's action
- [ ] Win detection: empty hand

---

## PHASE 7 — SHARED GAME COMPONENTS

- [ ] Create `src/games/_shared/GameWrapper.jsx` — socket listeners for `game_state_update` and `game_over`; updates `roomStore.gameState`
- [ ] Create `src/games/_shared/TurnBanner.jsx` (§9.9)
- [ ] Create `src/games/_shared/ScorePanel.jsx` — player list with scores/status
- [ ] Create `src/games/_shared/WinScreen.jsx` — confetti + winner name + replay/home buttons (§9.10)

---

## PHASE 8 — POLISH + INTEGRATION

### 8.1 Navigation Guards
- [ ] Redirect `/room/:roomId` to `/` if no active room in store
- [ ] Redirect `/game/:roomId` to `/` if no active game in store
- [ ] On browser back button during game: confirm dialog "Leave game?"

### 8.2 Error States
- [ ] `room_error` received → show Toast with error message
- [ ] Network disconnect → Toast "Connection lost. Reconnecting..." (auto-reconnect via socket.io)
- [ ] Reconnect success → Toast "Reconnected!"
- [ ] Game action error (invalid move, not your turn) → Toast with message

### 8.3 Responsive Final Check (Desktop Only)
- [ ] Minimum supported viewport: 1024×768
- [ ] Game boards scale correctly at 1024px, 1280px, 1440px, 1920px
- [ ] No horizontal scroll at any breakpoint

### 8.4 Sound System
- [ ] All sound files placed in `public/sounds/` per game
- [ ] Mute toggle button in `GameLayout` top bar
- [ ] State persisted in localStorage (`mgp_sound_enabled`)
- [ ] Sounds do not play if browser hasn't had user interaction (Howler handles this)

### 8.5 Final Integration Tests
- [ ] 2-player full flow: Home → Create Room → Lobby → Ludo game → Win → Home
- [ ] 2-player full flow: Chess game → Resign
- [ ] 4-player full flow: UNO game → Win
- [ ] 3-player Bingo: full game to Bingo win
- [ ] Chat works throughout all phases (lobby + in-game)
- [ ] Disconnect + reconnect within 60s: game continues
- [ ] Disconnect past 60s: game handles missing player (skips turn or ends)

---

## QUICK REFERENCE — LAST STOPPED AT

```
Phase: Phase 1 through Phase 7 Complete (Scaffolding & Component Construction)
Section: All folders & files generated across Frontend and Backend
Task: All files created with explicit explanatory header comments & full implementations
LLM Session Date: 2026-11-21
Notes: 
- Complete repository structure from IMPLEMENTATION_PLAN.md §3 created.
- All backend models, socket handlers, room manager, base game, and game logic (Ludo, Bingo, Chess, UNO) implemented and syntax verified.
- All frontend components, routes, stores, hooks, UI elements, layouts, and all 4 game modules (Ludo, Bingo, Chess, UNO) implemented with detailed file headers explaining purpose, props, and socket events.
- Next step: Run environment dependencies setup (pip install, npm install) and proceed with local verification & Phase 8 integration tests.
```
*(Update this block at end of every session)*
