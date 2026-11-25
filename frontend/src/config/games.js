/**
 * FILE: frontend/src/config/games.js
 * PURPOSE: Static registry of supported games with TE-01 hardware metadata and studio artwork paths.
 */

export const GAMES = [
  {
    id: 'bingo',
    name: 'Bingo',
    tagline: '1–25 Tactile Grid',
    description: 'Take turns calling numbers, complete 5 rows or diagonals, and claim podium ranks.',
    minPlayers: 2,
    maxPlayers: 6,
    accentColor: '#d97706',
    badge: 'Popular',
    image: '/images/games/bingo.svg',
    icon: 'Hash',
    emoji: '🎱',
  },
  {
    id: 'ludo',
    name: 'Ludo',
    tagline: 'Classic Board Race',
    description: 'Roll the die, knock opponents off the track, and race all 4 tokens to home base.',
    minPlayers: 2,
    maxPlayers: 4,
    accentColor: '#d9482b',
    badge: 'Dice Race',
    image: '/images/games/ludo.svg',
    icon: 'Dice',
    emoji: '🎲',
  },
  {
    id: 'chess',
    name: 'Chess',
    tagline: 'Pure 1v1 Strategy',
    description: 'Authoritative rules engine with check alerts, draw offers, promotion, and move logs.',
    minPlayers: 2,
    maxPlayers: 2,
    accentColor: '#e5b869',
    badge: 'Classic',
    image: '/images/games/chess.svg',
    icon: 'Crown',
    emoji: '♟️',
  },
  {
    id: 'uno',
    name: 'UNO',
    tagline: 'Card Shedding Party',
    description: 'Reverse, Skip, +2, +4 Wilds, and live penalties when someone forgets to call UNO.',
    minPlayers: 2,
    maxPlayers: 6,
    accentColor: '#10b981',
    badge: 'Party',
    image: '/images/games/uno.svg',
    icon: 'Layers',
    emoji: '🃏',
  },
]

export const GAMES_MAP = Object.fromEntries(GAMES.map(g => [g.id, g]))
