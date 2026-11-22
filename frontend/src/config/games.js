/**
 * FILE: frontend/src/config/games.js
 * PURPOSE: Static registry of all supported games.
 *          Used by HomePage to render game cards, and by room/game components
 *          to look up display info for a game by its id string.
 *
 * HOW TO ADD A NEW GAME:
 *   1. Add an entry to the GAMES array below.
 *   2. Create a backend game class (games/<name>/game.py).
 *   3. Create frontend game components (games/<name>/).
 *   4. Register in GAME_REGISTRY (backend/games/__init__.py).
 *
 * FIELDS:
 *   id          : Exact string sent in create_room/join_room socket events.
 *                 Must match the backend GAME_REGISTRY key.
 *   name        : Human-readable display name.
 *   description : Short subtitle shown on the game card.
 *   minPlayers  : Minimum players required to start (checked by host UI).
 *   maxPlayers  : Maximum players allowed (backend enforces this too).
 *   color       : Primary hex color for the game card accent/gradient.
 *   emoji       : Game icon shown on card and in the room header.
 *   bgGradient  : Tailwind gradient classes for the game card background.
 */

export const GAMES = [
  {
    id: 'ludo',
    name: 'Ludo',
    description: 'Classic board race game',
    minPlayers: 2,
    maxPlayers: 4,
    color: '#ef4444',
    emoji: '🎲',
    bgGradient: 'from-red-900 to-red-700',
  },
  {
    id: 'bingo',
    name: 'Bingo',
    description: '5×5 number card game',
    minPlayers: 2,
    maxPlayers: 6,
    color: '#3b82f6',
    emoji: '🎱',
    bgGradient: 'from-blue-900 to-blue-700',
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Classic strategy game',
    minPlayers: 2,
    maxPlayers: 2,
    color: '#a16207',
    emoji: '♟️',
    bgGradient: 'from-amber-900 to-amber-700',
  },
  {
    id: 'uno',
    name: 'UNO',
    description: 'Card shedding game',
    minPlayers: 2,
    maxPlayers: 6,
    color: '#16a34a',
    emoji: '🃏',
    bgGradient: 'from-green-900 to-green-700',
  },
]

/** Convenience lookup: GAMES_MAP["ludo"] → game config object */
export const GAMES_MAP = Object.fromEntries(GAMES.map(g => [g.id, g]))
