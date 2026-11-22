/**
 * FILE: frontend/src/games/uno/UnoGame.jsx
 * PURPOSE: Root game component for UNO.
 *          Handles hand fan, discard & draw piles, color selection modal,
 *          UNO button call, and sound effects.
 *
 * SOCKET ACTIONS:
 *   - "play_card" -> { card_id, chosen_color? }
 *   - "draw_card" -> {}
 *   - "call_uno"  -> {}
 */

import { useState } from 'react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import UnoHand from './UnoHand'
import UnoDiscardPile from './UnoDiscardPile'
import DrawPile from './DrawPile'
import UnoPlayerStatus from './UnoPlayerStatus'
import ColorPicker from './ColorPicker'
import TurnBanner from '../_shared/TurnBanner'
import WinScreen from '../_shared/WinScreen'
import Button from '../../components/ui/Button'
import './uno.css'

export default function UnoGame() {
  const { gameState, status, players } = useRoomStore()
  const { socketId } = usePlayerStore()
  const playSound = useSound('uno')

  const [pendingWildCard, setPendingWildCard] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  if (!gameState) {
    return <div className="p-8 text-center text-slate-400">Loading UNO game...</div>
  }

  const currentIdx = gameState.current_player_index
  const currentPlayer = players[currentIdx]
  const isMyTurn = currentPlayer?.socket_id === socketId

  // Own player info
  const myPlayerState = gameState.players?.find(p => p.socket_id === socketId)
  const otherPlayers = gameState.players?.filter(p => p.socket_id !== socketId) || []

  function handlePlayCard(card) {
    if (!isMyTurn) return

    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      setPendingWildCard(card)
      setShowColorPicker(true)
      return
    }

    playSound('card_play')
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'play_card',
      payload: { card_id: card.id },
    })
  }

  function handleColorSelect(chosen_color) {
    if (!pendingWildCard) return
    playSound('card_play')
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'play_card',
      payload: { card_id: pendingWildCard.id, chosen_color },
    })
    setPendingWildCard(null)
    setShowColorPicker(false)
  }

  function handleDraw() {
    if (!isMyTurn) return
    playSound('card_draw')
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'draw_card', payload: {} })
  }

  function handleCallUno() {
    playSound('uno_call')
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'call_uno', payload: {} })
  }

  return (
    <div className="flex flex-col items-center justify-between p-4 h-full max-w-5xl mx-auto gap-4">
      {/* Top Banner & Other Players */}
      <TurnBanner isMyTurn={isMyTurn} playerName={currentPlayer?.name} />
      <UnoPlayerStatus players={otherPlayers} currentIdx={currentIdx} />

      {/* Center Table: Discard + Draw Piles */}
      <div className="flex items-center justify-center gap-10 my-auto">
        <DrawPile
          count={gameState.draw_pile_count}
          canDraw={isMyTurn}
          onDraw={handleDraw}
        />
        <UnoDiscardPile
          topCard={gameState.discard_top}
          activeColor={gameState.active_color}
        />

        {/* Call UNO button (visible when own hand has <= 2 cards) */}
        {myPlayerState?.hand?.length <= 2 && (
          <Button
            variant="primary"
            size="lg"
            className="bg-red-600 hover:bg-red-500 font-game font-black text-xl animate-pulse shadow-2xl"
            onClick={handleCallUno}
          >
            🔥 UNO!
          </Button>
        )}
      </div>

      {/* Own Hand */}
      <div className="w-full">
        <UnoHand
          cards={myPlayerState?.hand || []}
          discardTop={gameState.discard_top}
          activeColor={gameState.active_color}
          isMyTurn={isMyTurn}
          onPlayCard={handlePlayCard}
        />
      </div>

      <ColorPicker
        isOpen={showColorPicker}
        onSelectColor={handleColorSelect}
      />

      {status === 'finished' && <WinScreen winnerName={gameState.players?.find(p => p.hand_count === 0)?.name} />}
    </div>
  )
}
