/**
 * FILE: frontend/src/games/bingo/index.jsx
 * PURPOSE: Lazy-loaded entry point for Bingo.
 *          Exported as default for React.lazy() in GameLayout.
 */

import BingoGame from './BingoGame.tsx'

export default BingoGame
export { BingoBoard } from './BingoBoard'
export { BingoTile } from './BingoTile'
export { RecentCallsTray } from './RecentCallsTray'
export { TurnStatusBar } from './TurnStatusBar'
export { useGameAudio } from './useGameAudio'

