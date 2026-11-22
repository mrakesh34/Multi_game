/**
 * FILE: frontend/src/config/games.js
 * PURPOSE: Static registry of all supported games with clean metadata and styling.
 */

export const GAMES = [
  {
    id: 'bingo',
    name: 'Bingo',
    tagline: '1–25 Classic Paper Bingo',
    description: 'Turn-based number calling with 5-in-a-row lines and multi-player podium rankings.',
    minPlayers: 2,
    maxPlayers: 6,
    accentColor: '#3b82f6',
    borderHover: 'hover:border-blue-500/50',
    badge: 'Popular',
    icon: 'Hash',
    emoji: '🎱',
  },
  {
    id: 'ludo',
    name: 'Ludo',
    tagline: 'Classic Board Race',
    description: 'Roll the dice, knock opponents off the track, and race your 4 tokens to home base.',
    minPlayers: 2,
    maxPlayers: 4,
    accentColor: '#ef4444',
    borderHover: 'hover:border-red-500/50',
    icon: 'Dice',
    emoji: '🎲',
  },
  {
    id: 'chess',
    name: 'Chess',
    tagline: 'Pure 1v1 Strategy',
    description: 'Authoritative rules engine with check, draw negotiations, promotion, and move histories.',
    minPlayers: 2,
    maxPlayers: 2,
    accentColor: '#f59e0b',
    borderHover: 'hover:border-amber-500/50',
    icon: 'Crown',
    emoji: '♟️',
  },
  {
    id: 'uno',
    name: 'UNO',
    tagline: 'Color & Action Card Shedding',
    description: 'Reverse, Skip, +2, +4 Wilds, and penalties for forgetting to declare UNO.',
    minPlayers: 2,
    maxPlayers: 6,
    accentColor: '#10b981',
    borderHover: 'hover:border-emerald-500/50',
    icon: 'Layers',
    emoji: '🃏',
  },
]

export const GAMES_MAP = Object.fromEntries(GAMES.map(g => [g.id, g]))
