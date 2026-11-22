/**
 * FILE: frontend/src/games/chess/ChessGame.jsx
 * PURPOSE: Root game component for Chess.
 *          Handles move selection, promotion modal, resignations, draw offers,
 *          captured pieces, move history, and sound triggers.
 *
 * SOCKET ACTIONS:
 *   - "move"        -> { from, to, promotion? }
 *   - "resign"      -> {}
 *   - "offer_draw"  -> {}
 *   - "accept_draw" -> {}
 *   - "decline_draw"-> {}
 */

import { useState } from 'react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import ChessBoard from './ChessBoard'
import CapturedPieces from './CapturedPieces'
import MoveHistory from './MoveHistory'
import TurnBanner from '../_shared/TurnBanner'
import WinScreen from '../_shared/WinScreen'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { getLegalMovesForSquare, isPawnPromotion } from './gameLogic'
import './chess.css'

export default function ChessGame() {
  const { gameState, status, players } = useRoomStore()
  const { socketId } = usePlayerStore()
  const playSound = useSound('chess')

  const [selectedSquare, setSelectedSquare] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [pendingMove, setPendingMove] = useState(null)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showResignConfirm, setShowResignConfirm] = useState(false)

  if (!gameState) {
    return <div className="p-8 text-center text-slate-400">Loading Chess board...</div>
  }

  // Determine local player color (slot 0 = white, slot 1 = black)
  const me = players.find(p => p.socket_id === socketId)
  const myColor = me?.slot === 0 ? 'white' : 'black'
  const isMyTurn = gameState.turn === myColor && gameState.phase === 'playing'

  function handleSquareClick(square) {
    if (!isMyTurn) return

    // If clicking on an already highlighted target square -> execute move
    if (selectedSquare && legalMoves.includes(square)) {
      if (isPawnPromotion(gameState.fen, selectedSquare, square)) {
        setPendingMove({ from: selectedSquare, to: square })
        setShowPromoModal(true)
      } else {
        executeMove(selectedSquare, square)
      }
      setSelectedSquare(null)
      setLegalMoves([])
      return
    }

    // Otherwise select square and query legal moves
    setSelectedSquare(square)
    const moves = getLegalMovesForSquare(gameState.fen, square)
    setLegalMoves(moves)
  }

  function executeMove(from, to, promotion = null) {
    playSound('move')
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'move',
      payload: { from, to, promotion },
    })
  }

  function handlePromote(pieceChar) {
    if (pendingMove) {
      executeMove(pendingMove.from, pendingMove.to, pieceChar)
      setPendingMove(null)
      setShowPromoModal(false)
    }
  }

  function handleResign() {
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'resign', payload: {} })
    setShowResignConfirm(false)
  }

  function handleOfferDraw() {
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'offer_draw', payload: {} })
  }

  function handleAcceptDraw() {
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'accept_draw', payload: {} })
  }

  function handleDeclineDraw() {
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'decline_draw', payload: {} })
  }

  const hasDrawOffer = gameState.draw_offer_from && gameState.draw_offer_from !== socketId

  return (
    <div className="flex flex-col items-center justify-between p-4 h-full max-w-5xl mx-auto gap-4">
      {/* Top Banner */}
      <TurnBanner isMyTurn={isMyTurn} playerName={`${gameState.turn.toUpperCase()}'s turn`} />

      {/* Draw Offer Notification */}
      {hasDrawOffer && (
        <div className="w-full glass-card p-3 border-amber-500/40 flex items-center justify-between">
          <span className="text-sm text-amber-300">Opponent offered a draw. Accept?</span>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAcceptDraw}>Accept</Button>
            <Button variant="ghost" size="sm" onClick={handleDeclineDraw}>Decline</Button>
          </div>
        </div>
      )}

      {/* Main Board & Side Panels */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full my-auto">
        <ChessBoard
          fen={gameState.fen}
          myColor={myColor}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={gameState.last_move}
          isCheck={gameState.phase === 'check'}
          onSquareClick={handleSquareClick}
        />

        {/* Side HUD */}
        <div className="flex flex-col gap-4 w-full lg:w-72">
          <CapturedPieces
            whiteCaptures={gameState.captured_by_white}
            blackCaptures={gameState.captured_by_black}
          />
          <MoveHistory history={gameState.move_history} />

          <div className="flex gap-2 w-full">
            <Button variant="secondary" size="sm" className="flex-1" onClick={handleOfferDraw}>
              Offer Draw
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setShowResignConfirm(true)}>
              Resign
            </Button>
          </div>
        </div>
      </div>

      {/* Promotion Choice Modal */}
      <Modal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} title="Pawn Promotion">
        <div className="grid grid-cols-4 gap-4 py-4">
          {['q', 'r', 'b', 'n'].map(p => (
            <button
              key={p}
              onClick={() => handlePromote(p)}
              className="p-4 glass-card text-3xl hover:bg-blue-600/30 transition-colors uppercase font-mono font-bold"
            >
              {p}
            </button>
          ))}
        </div>
      </Modal>

      {/* Resign Confirmation Modal */}
      <Modal isOpen={showResignConfirm} onClose={() => setShowResignConfirm(false)} title="Resign Game?">
        <p className="text-slate-300 text-sm mb-6">Are you sure you want to resign the game?</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowResignConfirm(false)}>Cancel</Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-500" onClick={handleResign}>
            Confirm Resign
          </Button>
        </div>
      </Modal>

      {status === 'finished' && <WinScreen winnerName={gameState.players?.find(p => p.color === gameState.turn)?.name} reason={gameState.phase} />}
    </div>
  )
}
