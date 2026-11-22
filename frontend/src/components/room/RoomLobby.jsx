/**
 * FILE: frontend/src/components/room/RoomLobby.jsx
 * PURPOSE: Minimal, responsive waiting room page shown after creating or joining a room.
 */

import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Play, Users, CheckCircle2, Circle } from 'lucide-react'
import LobbyLayout from '../layout/LobbyLayout'
import RoomCode from './RoomCode'
import PlayerSlot from './PlayerSlot'
import Toast from '../ui/Toast'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useRoomStore, usePlayerStore } from '../../store'
import { useRoom } from '../../hooks/useRoom'
import { GAMES_MAP } from '../../config/games'

export default function RoomLobby() {
  const navigate = useNavigate()
  const { roomId, game, players } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const [toast, setToast] = useState(null)
  const [starting, setStarting] = useState(false)

  useRoom({
    onError: (code, msg) => {
      setToast({ message: msg, type: 'error' })
      setStarting(false)
    },
  })

  if (!roomId) return <Navigate to="/" replace />

  const gameConfig = GAMES_MAP[game] || {}
  const me = players.find(
    (p) => p.socket_id === socketId || (myName && p.name.toLowerCase() === myName.toLowerCase())
  )
  const isHost = me?.is_host ?? false
  const connectedPlayers = players.filter((p) => p.is_connected)
  const allReady = connectedPlayers.filter((p) => !p.is_host).every((p) => p.is_ready)
  const canStart = isHost && allReady && connectedPlayers.length >= 2

  // Fill slots up to maxPlayers for display
  const maxSlots = gameConfig.maxPlayers || 4
  const slots = Array.from({ length: maxSlots }, (_, i) => players[i] || null)

  function handleReady() {
    socket.emit(EVENTS.TOGGLE_READY, {})
  }
  function handleStart() {
    setStarting(true)
    socket.emit(EVENTS.START_GAME, {})
  }
  function handleLeave() {
    socket.emit(EVENTS.LEAVE_ROOM, {})
    navigate('/')
  }

  return (
    <LobbyLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-xl bg-zinc-800 border border-zinc-700/60">
              {gameConfig.emoji}
            </span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{gameConfig.name} Room</h1>
              <p className="text-[11px] text-zinc-400">{gameConfig.tagline}</p>
            </div>
          </div>

          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white text-xs font-semibold transition-all border border-zinc-700/60 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>

        {/* Room Code */}
        <div className="py-2">
          <RoomCode roomId={roomId} />
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-zinc-800/80 my-5" />

        {/* Player Roster */}
        <div className="flex flex-col gap-2.5 mb-6">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <span>Players in Lobby</span>
            </span>
            <span className="font-mono text-zinc-400">
              {connectedPlayers.length} / {maxSlots}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {slots.map((player, i) => (
              <PlayerSlot
                key={i}
                player={player}
                index={i}
                isMe={player?.socket_id === socketId || player?.name === myName}
              />
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 pt-2">
          {!isHost && (
            <button
              onClick={handleReady}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 ${
                me?.is_ready
                  ? 'bg-zinc-800 hover:bg-zinc-750 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 shadow-lg'
              }`}
            >
              {me?.is_ready ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready! Click to Unready</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Click to Ready Up</span>
                </>
              )}
            </button>
          )}

          {isHost && (
            <button
              disabled={!canStart || starting}
              onClick={handleStart}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{starting ? 'Starting match...' : 'Start Game'}</span>
            </button>
          )}

          {isHost && !allReady && connectedPlayers.length >= 2 && (
            <p className="text-[11px] text-zinc-500 text-center font-medium mt-1">
              Waiting for all players to click Ready...
            </p>
          )}

          {isHost && connectedPlayers.length < 2 && (
            <p className="text-[11px] text-zinc-500 text-center font-medium mt-1">
              Need at least 2 players to begin. Share the code!
            </p>
          )}
        </div>
      </motion.div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
