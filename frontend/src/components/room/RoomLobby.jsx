/**
 * FILE: frontend/src/components/room/RoomLobby.jsx
 * PURPOSE: Waiting room page shown after creating or joining a room.
 *          Players see each other, toggle ready, and the host can start the game.
 *
 * ROUTE: /room/:roomId
 *
 * ROUTE PROTECTION:
 *   If roomStore.roomId is null (direct URL access), redirects to "/".
 *
 * LAYOUT (see IMPLEMENTATION_PLAN.md §9.7):
 *   - Game emoji + name in header
 *   - RoomCode component (prominent code display)
 *   - Player slots list (filled + empty)
 *   - Ready button (toggles for non-host)
 *   - Start Game button (host only, disabled until all connected players are ready)
 *   - Leave button (top right)
 *
 * SOCKET EVENTS:
 *   EMIT: toggle_ready → {} (flip ready state)
 *   EMIT: start_game   → {} (host only)
 *   EMIT: leave_room   → {} (on leave button or beforeunload)
 *
 * SOCKET EVENTS HANDLED (via useRoom hook):
 *   player_joined / player_left / player_ready_changed → update roomStore.players
 *   game_started → navigate to /game/:roomId (handled inside useRoom)
 *
 * GAME START RULES:
 *   - Only host can click Start Game
 *   - All connected players (except host) must have is_ready = true
 *   - Minimum 2 players required (shown as disabled with tooltip if less)
 */

import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import LobbyLayout from '../layout/LobbyLayout'
import RoomCode    from './RoomCode'
import PlayerSlot  from './PlayerSlot'
import Button      from '../ui/Button'
import Toast       from '../ui/Toast'
import socket      from '../../socket/socket'
import { EVENTS }  from '../../socket/events'
import { useRoomStore, usePlayerStore } from '../../store'
import { useRoom }  from '../../hooks/useRoom'
import { GAMES_MAP } from '../../config/games'

export default function RoomLobby() {
  const navigate  = useNavigate()
  const { roomId, game, players } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const [toast, setToast] = useState(null)
  const [starting, setStarting] = useState(false)

  useRoom({ onError: (code, msg) => { setToast({ message: msg, type: 'error' }); setStarting(false) } })

  if (!roomId) return <Navigate to="/" replace />

  const gameConfig = GAMES_MAP[game] || {}
  const me = players.find(p => p.socket_id === socketId || (myName && p.name.toLowerCase() === myName.toLowerCase()))
  const isHost = me?.is_host ?? false
  const connectedPlayers = players.filter(p => p.is_connected)
  const allReady = connectedPlayers.filter(p => !p.is_host).every(p => p.is_ready)
  const canStart = isHost && allReady && connectedPlayers.length >= 2

  // Fill slots up to maxPlayers for display
  const maxSlots = gameConfig.maxPlayers || 4
  const slots = Array.from({ length: maxSlots }, (_, i) => players[i] || null)

  function handleReady() { socket.emit(EVENTS.TOGGLE_READY, {}) }
  function handleStart() { setStarting(true); socket.emit(EVENTS.START_GAME, {}) }
  function handleLeave() { socket.emit(EVENTS.LEAVE_ROOM, {}); navigate('/') }

  return (
    <LobbyLayout>
      <div className="w-full max-w-md glass-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-game text-2xl font-bold text-white">
            {gameConfig.emoji} {gameConfig.name}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLeave}>Leave</Button>
        </div>

        <RoomCode roomId={roomId} />

        <hr className="border-white/10 my-6" />

        {/* Player slots */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="text-slate-400 text-sm">Players ({connectedPlayers.length}/{maxSlots})</p>
          {slots.map((player, i) => (
            <PlayerSlot key={i} player={player} index={i} isMe={player?.socket_id === socketId} />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!isHost && (
            <Button
              variant={me?.is_ready ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={handleReady}
            >
              {me?.is_ready ? 'Unready' : 'Ready Up'}
            </Button>
          )}
          {isHost && (
            <Button
              variant="primary"
              className="flex-1"
              disabled={!canStart}
              loading={starting}
              onClick={handleStart}
              title={!canStart ? 'All players must be ready (min 2)' : ''}
            >
              ★ Start Game
            </Button>
          )}
        </div>
        {isHost && !allReady && connectedPlayers.length >= 2 && (
          <p className="text-slate-500 text-xs text-center mt-2">Waiting for all players to be ready...</p>
        )}
      </div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
