/**
 * FILE: frontend/src/games/chess/ChessGame.jsx
 * PURPOSE: Root game component for Chess styled with TE-01 Tactile Console surface.
 */

import { useState } from 'react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import { playKeyThock } from '../../utils/uiAudio'
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
    return (
      <div className="flex items-center justify-center h-full tabletop-surface font-mono text-xs text-[#8a919e]">
        Loading Chess board...
      </div>
    )
  }

  const me = players.find(p => p.socket_id === socketId)
  const myColor = me?.slot === 0 ? 'white' : 'black'
  const isMyTurn = gameState.turn === myColor && gameState.phase === 'playing'

  function handleSquareClick(square) {
    if (!isMyTurn) return

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

    playKeyThock(160)
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
    <div className="relative flex flex-col items-center justify-between w-full h-full px-3 sm:px-6 py-3 tabletop-surface overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none tabletop-dots opacity-45" />
      <div className="absolute inset-0 pointer-events-none tabletop-grain" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-between h-full gap-3">
        <TurnBanner isMyTurn={isMyTurn} playerName={`${gameState.turn.toUpperCase()}`} />

        {hasDrawOffer && (
          <div className="w-full max-w-xl chassis-card p-3 border-amber-500/40 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-amber-300">Opponent offered a draw. Accept?</span>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleAcceptDraw}>Accept</Button>
              <Button variant="secondary" size="sm" onClick={handleDeclineDraw}>Decline</Button>
            </div>
          </div>
        )}

        {/* Main Board & Side HUD */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 w-full my-auto">
          <ChessBoard
            fen={gameState.fen}
            myColor={myColor}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={gameState.last_move}
            isCheck={gameState.phase === 'check'}
            onSquareClick={handleSquareClick}
          />

          <div className="flex flex-col gap-3.5 w-full lg:w-72">
            <CapturedPieces
              whiteCaptures={gameState.captured_by_white}
              blackCaptures={gameState.captured_by_black}
            />
            <MoveHistory history={gameState.move_history} />

            <div className="flex gap-2 w-full">
              <Button variant="secondary" size="sm" className="flex-1 font-mono" onClick={handleOfferDraw}>
                Offer Draw
              </Button>
              <Button variant="danger" size="sm" className="font-mono" onClick={() => setShowResignConfirm(true)}>
                Resign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Modal */}
      <Modal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} title="Pawn Promotion">
        <div className="grid grid-cols-4 gap-3 py-2">
          {['q', 'r', 'b', 'n'].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => handlePromote(p)}
              className="keycap-btn p-4 rounded-xl text-2xl uppercase font-mono font-black hover:text-[#e07a22] cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </Modal>

      {/* Resign Confirmation */}
      <Modal isOpen={showResignConfirm} onClose={() => setShowResignConfirm(false)} title="Resign Game?">
        <p className="text-[#8a919e] text-sm mb-6">Are you sure you want to resign this match?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowResignConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleResign}>
            Confirm Resign
          </Button>
        </div>
      </Modal>

      {status === 'finished' && (
        <WinScreen
          winnerName={gameState.players?.find(p => p.color === gameState.turn)?.name}
          reason={gameState.phase}
        />
      )}
    </div>
  )
}
