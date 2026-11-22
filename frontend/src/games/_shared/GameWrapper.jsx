/**
 * FILE: frontend/src/games/_shared/GameWrapper.jsx
 * PURPOSE: HOC/wrapper that connects a game component to the socket and store.
 *          Handles game_state_update and game_over events globally.
 *          Every game's root component (LudoGame, ChessGame, etc.) should be
 *          wrapped in or use the logic from this component.
 *
 * WHAT IT DOES:
 *   - Listens for GAME_STATE_UPDATE and updates roomStore.gameState
 *   - Listens for GAME_OVER and sets roomStore.status = "finished"
 *   - Renders WinScreen when game is over
 *   - Passes gameState down to children via render prop or context
 *
 * PROPS:
 *   children : function(gameState) → JSX  (render prop pattern)
 *              OR just ReactNode if game reads from roomStore directly
 *
 * USAGE (render prop):
 *   <GameWrapper>
 *     {(gameState) => <LudoBoard state={gameState} />}
 *   </GameWrapper>
 *
 * NOTE:
 *   Most game components read directly from useRoomStore().gameState.
 *   This wrapper is optional; use it if you want centralized game event handling.
 */

import { useState } from 'react'
import { useRoomStore } from '../../store'
import WinScreen from './WinScreen'

export default function GameWrapper({ children }) {
  const { gameState, status } = useRoomStore()
  const [winData, setWinData] = useState(null)

  // GameWrapper uses useRoom (already set up in GameLayout) so no duplicate listeners.
  // It just reads from the store.

  if (status === 'finished' && gameState) {
    // WinScreen reads winner from gameState or winData
    return <WinScreen winnerName={winData?.winner_name} />
  }

  return typeof children === 'function' ? children(gameState) : children
}
