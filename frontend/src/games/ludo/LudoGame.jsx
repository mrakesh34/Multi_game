/**
 * FILE: frontend/src/games/ludo/LudoGame.jsx
 * PURPOSE: Root game component for Ludo.
 *          Manages socket actions, sounds, board rendering, and turn flow.
 *
 * ACTIONS DISPATCHED:
 *   - "roll_dice"  -> socket.emit(EVENTS.GAME_ACTION, { action_type: 'roll_dice', payload: {} })
 *   - "move_piece" -> socket.emit(EVENTS.GAME_ACTION, { action_type: 'move_piece', payload: { piece_id } })
 */

import { useState } from 'react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import LudoBoard from './LudoBoard'
import LudoPiece from './LudoPiece'
import LudoDice from './LudoDice'
import TurnBanner from '../_shared/TurnBanner'
import ScorePanel from '../_shared/ScorePanel'
import WinScreen from '../_shared/WinScreen'
import { getBoardCoords, getValidMoves } from './gameLogic'
import './ludo.css'

export default function LudoGame() {
  const { gameState, status, players } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const playSound = useSound('ludo')
  const [rolling, setRolling] = useState(false)

  if (!gameState) {
    return <div className="p-8 text-center text-slate-400">Loading Ludo game state...</div>
  }

  const currentIdx = gameState.current_player_index
  const currentPlayer = players[currentIdx]
  const isMyTurn =
    currentPlayer?.socket_id === socketId ||
    Boolean(
      currentPlayer?.name &&
      myName &&
      currentPlayer.name.trim().toLowerCase() === myName.trim().toLowerCase()
    )
  const myPlayerInfo = gameState.players?.find((p, i) => players[i]?.socket_id === socketId || (myName && players[i]?.name?.trim().toLowerCase() === myName.trim().toLowerCase()))
  const myColorIndex = myPlayerInfo?.color_index ?? 0

  const validMovePieces = isMyTurn && gameState.phase === 'move'
    ? getValidMoves(gameState, myColorIndex, gameState.dice_value)
    : []

  function handleRoll() {
    if (!isMyTurn || gameState.phase !== 'roll' || rolling) return
    setRolling(true)
    playSound('dice_roll')
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'roll_dice', payload: {} })
    setTimeout(() => setRolling(false), 800)
  }

  function handleMovePiece(pieceId) {
    if (!isMyTurn || gameState.phase !== 'move') return
    playSound('piece_move')
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'move_piece',
      payload: { piece_id: pieceId },
    })
  }

  return (
    <div className="flex flex-col items-center justify-between p-4 h-full max-w-5xl mx-auto">
      {/* Turn Banner */}
      <TurnBanner isMyTurn={isMyTurn} playerName={currentPlayer?.name} />

      {/* Main Board Container */}
      <div className="flex items-center justify-center w-full my-auto gap-6">
        <LudoBoard>
          {gameState.players?.map((p) =>
            p.pieces.map((piece) => {
              const coords = getBoardCoords(p.color_index, piece.id, piece.steps)
              const isSelectable = isMyTurn && p.color_index === myColorIndex && validMovePieces.includes(piece.id)
              return (
                <LudoPiece
                  key={`${p.color_index}-${piece.id}`}
                  pieceId={piece.id}
                  colorIndex={p.color_index}
                  coords={coords}
                  isSelectable={isSelectable}
                  onClick={() => handleMovePiece(piece.id)}
                />
              )
            })
          )}
        </LudoBoard>

        {/* Dice & Controls Side HUD */}
        <div className="flex flex-col items-center gap-6 glass-card p-6 min-w-[160px]">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dice</h3>
          <LudoDice
            value={gameState.dice_value}
            isRolling={rolling}
            disabled={!isMyTurn || gameState.phase !== 'roll'}
            onRoll={handleRoll}
          />
          {gameState.phase === 'move' && isMyTurn && (
            <p className="text-xs text-yellow-400 font-semibold animate-pulse text-center">
              Select a glowing piece to move
            </p>
          )}
        </div>
      </div>

      {status === 'finished' && <WinScreen winnerName={gameState.players?.find(p => p.is_finished)?.name} />}
    </div>
  )
}
