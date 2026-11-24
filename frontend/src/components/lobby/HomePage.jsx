/**
 * FILE: frontend/src/components/lobby/HomePage.jsx
 * PURPOSE: Modern, minimal landing page with quick join, game picker,
 *          and automatic name assignment modal for new visitors.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, ArrowRight, Sparkles } from 'lucide-react'
import { useLocalPlayer } from '../../hooks/useLocalPlayer'
import { useSocket } from '../../hooks/useSocket'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { isNameConfirmed, setNameConfirmed } from '../../utils/localStorage'
import { isValidRoomId } from '../../utils/roomCode'
import { GAMES } from '../../config/games'
import { EVENTS } from '../../socket/events'
import socket from '../../socket/socket'
import LobbyLayout from '../layout/LobbyLayout'
import GameCard from './GameCard'
import AssignNameModal from './AssignNameModal'
import Toast from '../ui/Toast'
import Avatar from '../ui/Avatar'

export default function HomePage() {
  const { name } = useLocalPlayer()
  const { connected } = useSocket()
  const navigate = useNavigate()

  const setRoom = useRoomStore((s) => s.setRoom)
  const setPlayers = useRoomStore((s) => s.setPlayers)
  const setColorIndex = usePlayerStore((s) => s.setColorIndex)
  const setMessages = useChatStore((s) => s.setMessages)

  // Name assignment modal state
  const [showNameModal, setShowNameModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Direct quick join room input
  const [quickCode, setQuickCode] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)

  // Check on mount if user hasn't confirmed their name yet
  useEffect(() => {
    if (!isNameConfirmed()) {
      setShowNameModal(true)
    }
  }, [])

  function handleQuickJoin(e) {
    e?.preventDefault()
    const code = quickCode.trim()
    if (!isValidRoomId(code)) {
      setToast({ message: 'Please enter a valid 3-digit room code (e.g. 742)', type: 'error' })
      return
    }
    if (!name) {
      setShowNameModal(true)
      return
    }

    setQuickLoading(true)

    function onJoined(data) {
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers(data.players)
      setMessages(data.chat_log || [])
      const me = data.players.find((p) => p.name === name)
      if (me) setColorIndex(me.color_index)
      navigate(`/${data.game}/room/${data.room_id}`)
    }

    function onRoomError(data) {
      socket.off(EVENTS.ROOM_JOINED, onJoined)
      setToast({ message: data.message || 'Could not join room', type: 'error' })
      setQuickLoading(false)
    }

    socket.once(EVENTS.ROOM_JOINED, onJoined)
    socket.once(EVENTS.ROOM_ERROR, onRoomError)
    socket.emit(EVENTS.JOIN_ROOM, { room_id: code, player_name: name })
  }

  const colorIndex = (name?.charCodeAt(0) || 0) % 6

  return (
    <LobbyLayout>
      {/* Top Navbar */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-8 mb-4 border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 shadow-sm">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">GameZone</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Connecting...</span>
              </>
            )}
          </div>

          {/* Player name trigger */}
          <button
            onClick={() => setShowNameModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-all group"
          >
            <Avatar name={name || 'Player'} index={colorIndex} size="sm" />
            <span className="font-medium font-mono truncate max-w-[120px]">{name || 'Set Name'}</span>
            <span className="text-[10px] text-zinc-500 group-hover:text-blue-400 font-sans">Edit</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multiplayer Games • Zero Login</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Play classic games together in seconds.
          </h1>

          <p className="text-zinc-400 text-base max-w-lg mx-auto">
            Create a private room, share your 3-digit code, and play seamlessly across any device.
          </p>
        </motion.div>

        {/* Quick Join Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-6 flex justify-center"
        >
          <form
            onSubmit={handleQuickJoin}
            className="flex items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-lg"
          >
            <input
              type="text"
              maxLength={3}
              inputMode="numeric"
              placeholder="Enter 3-digit code (e.g. 742)"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none font-mono font-bold"
            />
            <button
              type="submit"
              disabled={quickCode.length !== 3 || quickLoading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{quickLoading ? 'Joining...' : 'Join'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </section>

      {/* Game Cards Grid */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            playerName={name}
            onError={(msg) => setToast({ message: msg, type: 'error' })}
          />
        ))}
      </section>

      {/* Name Assignment Modal */}
      <AssignNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
      />

      {/* Toast notifications */}
      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
