/**
 * FILE: frontend/src/games/ludo/LudoGame.jsx
 * PURPOSE: Root game component for Ludo styled in TE-01 Tactile Console.
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
import WinScreen from '../_shared/WinScreen'
import { getBoardCoords, getValidMoves } from './gameLogic'
import './ludo.css'

export default function LudoGame() {
  const { gameState, status, players } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const playSound = useSound('ludo')
  const [rolling, setRolling] = useState(false)

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full tabletop-surface font-mono text-xs text-[#8a919e]">
        Loading Ludo board...
      </div>
    )
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
  const myPlayerInfo = gameState.players?.find(
    (p, i) =>
      players[i]?.socket_id === socketId ||
      (myName && players[i]?.name?.trim().toLowerCase() === myName.trim().toLowerCase())
  )
  const myColorIndex = myPlayerInfo?.color_index ?? 0

  const validMovePieces =
    isMyTurn && gameState.phase === 'move'
      ? getValidMoves(gameState, myColorIndex, gameState.dice_value)
      : []

  function handleRoll() {
    if (!isMyTurn || gameState.phase !== 'roll' || rolling) return
    setRolling(true)
    playSound('dice_roll')
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'roll_dice', payload: {} })
    setTimeout(() => setRolling(false), 720)
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
    <div className="relative flex flex-col items-center justify-between w-full h-full px-3 sm:px-6 py-3 tabletop-surface overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none tabletop-dots opacity-45" />
      <div className="absolute inset-0 pointer-events-none tabletop-grain" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-between h-full gap-3">
        <TurnBanner isMyTurn={isMyTurn} playerName={currentPlayer?.name} />

        {/* Main Board + Dice Console */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full my-auto gap-6">
          <div className="w-full max-w-[min(64dvh,560px)]">
            <LudoBoard>
              {gameState.players?.map((p) =>
                p.pieces.map((piece) => {
                  const coords = getBoardCoords(p.color_index, piece.id, piece.steps)
                  const isSelectable =
                    isMyTurn && p.color_index === myColorIndex && validMovePieces.includes(piece.id)
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
          </div>

          {/* Dice & Controls Hardware Module */}
          <div className="relative flex flex-col items-center gap-4 chassis-card p-5 min-w-[190px]">
            {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
              <span
                key={pos}
                className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-[#242935] border border-white/[0.08] pointer-events-none`}
              />
            ))}

            <h3 className="text-[11px] font-mono font-bold text-[#8a919e] uppercase tracking-widest">
              Dice Console
            </h3>

            <LudoDice
              value={gameState.dice_value}
              isRolling={rolling}
              disabled={!isMyTurn || gameState.phase !== 'roll'}
              onRoll={handleRoll}
            />

            {gameState.phase === 'move' && isMyTurn && (
              <p className="text-[11px] font-mono text-amber-300 font-semibold animate-pulse text-center max-w-[150px]">
                Select a highlighted token to move
              </p>
            )}
          </div>
        </div>
      </div>

      {status === 'finished' && (
        <WinScreen winnerName={gameState.players?.find(p => p.is_finished)?.name} />
      )}
    </div>
  )
}
