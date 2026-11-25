/**
 * FILE: frontend/src/games/uno/UnoGame.jsx
 * PURPOSE: Root game component for UNO styled with TE-01 Tactile Console surface.
 */

import { useState } from 'react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import { playSnap } from '../../utils/uiAudio'
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
  const { socketId, name: myName } = usePlayerStore()
  const playSound = useSound('uno')

  const [pendingWildCard, setPendingWildCard] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full tabletop-surface font-mono text-xs text-[#8a919e]">
        Loading UNO table...
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

  const myPlayerState = gameState.players?.find(
    p =>
      p.socket_id === socketId ||
      (myName && p.name?.trim().toLowerCase() === myName.trim().toLowerCase())
  )
  const otherPlayers =
    gameState.players?.filter(
      p =>
        p.socket_id !== socketId &&
        (!myName || p.name?.trim().toLowerCase() !== myName.trim().toLowerCase())
    ) || []

  function handlePlayCard(card) {
    if (!isMyTurn) return

    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      setPendingWildCard(card)
      setShowColorPicker(true)
      return
    }

    playSnap()
    playSound('card_play')
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'play_card',
      payload: { card_id: card.id },
    })
  }

  function handleColorSelect(chosen_color) {
    if (!pendingWildCard) return
    playSnap()
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
    playSnap()
    playSound('card_draw')
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'draw_card', payload: {} })
  }

  function handleCallUno() {
    playSound('uno_call')
    socket.emit(EVENTS.GAME_ACTION, { action_type: 'call_uno', payload: {} })
  }

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full px-3 sm:px-6 py-3 tabletop-surface overflow-hidden">
      <div className="absolute inset-0 pointer-events-none tabletop-dots opacity-45" />
      <div className="absolute inset-0 pointer-events-none tabletop-grain" />

      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full max-w-5xl mx-auto gap-3">
        <div className="w-full flex flex-col items-center gap-2">
          <TurnBanner isMyTurn={isMyTurn} playerName={currentPlayer?.name} />
          <UnoPlayerStatus players={otherPlayers} currentIdx={currentIdx} />
        </div>

        {/* Center Table: Draw & Discard Deck */}
        <div className="chassis-card px-8 py-6 rounded-3xl flex items-center justify-center gap-8 sm:gap-12 my-auto">
          <DrawPile
            count={gameState.draw_pile_count}
            canDraw={isMyTurn}
            onDraw={handleDraw}
          />
          <UnoDiscardPile
            topCard={gameState.discard_top}
            activeColor={gameState.active_color}
          />

          {myPlayerState?.hand?.length <= 2 && (
            <Button
              variant="danger"
              size="lg"
              className="font-mono font-black text-base uppercase tracking-wider animate-pulse"
              onClick={handleCallUno}
            >
              UNO!
            </Button>
          )}
        </div>

        {/* Player's Fanned Hand */}
        <div className="w-full">
          <UnoHand
            cards={myPlayerState?.hand || []}
            discardTop={gameState.discard_top}
            activeColor={gameState.active_color}
            isMyTurn={isMyTurn}
            onPlayCard={handlePlayCard}
          />
        </div>
      </div>

      <ColorPicker
        isOpen={showColorPicker}
        onSelectColor={handleColorSelect}
      />

      {status === 'finished' && (
        <WinScreen winnerName={gameState.players?.find(p => p.hand_count === 0)?.name} />
      )}
    </div>
  )
}
