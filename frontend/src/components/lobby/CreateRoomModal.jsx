/**
 * FILE: frontend/src/components/lobby/CreateRoomModal.jsx
 * PURPOSE: Modal for creating a new room for a specific game.
 *          Emits the create_room socket event and navigates on success.
 *
 * PROPS:
 *   isOpen     : boolean
 *   onClose    : function
 *   game       : game config object { id, name, emoji }
 *   playerName : current local player's name
 *   onError    : callback(message) for errors
 *
 * SOCKET EVENTS:
 *   EMIT: create_room → { game: game.id, player_name }
 *   LISTEN (once):
 *     room_created → navigate to /room/:room_id, store room in roomStore
 *     room_error   → call onError, stop loading
 *
 * FLOW:
 *   1. User clicks "Create Room" button
 *   2. setLoading(true), emit create_room
 *   3a. On room_created: clearRoom(), setRoom(), navigate to /room/:id
 *   3b. On room_error: show error message inline, setLoading(false)
 *
 * NOTE:
 *   Listeners are registered as one-time (.once) to avoid memory leaks
 *   if the modal is closed before the response arrives.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dices, User } from 'lucide-react'
import Modal   from '../ui/Modal'
import Button  from '../ui/Button'
import socket  from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { getLastRoomCode, setLastRoomCode } from '../../utils/localStorage'
import { generateSuggestedRoomId, isValidRoomId } from '../../utils/roomCode'

export default function CreateRoomModal({ isOpen, onClose, game, playerName, onError }) {
  const [roomCode, setRoomCode] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate    = useNavigate()
  const setRoom     = useRoomStore(s => s.setRoom)
  const setPlayers  = useRoomStore(s => s.setPlayers)
  const setColorIndex = usePlayerStore(s => s.setColorIndex)
  const setMessages = useChatStore(s => s.setMessages)

  // Initialize with last used room code, or a fresh random 3-digit code
  useEffect(() => {
    if (isOpen) {
      const saved = getLastRoomCode()
      setRoomCode(saved || generateSuggestedRoomId())
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  function handleShuffle() {
    setRoomCode(generateSuggestedRoomId())
    setError('')
  }

  function handleCreate(e) {
    e?.preventDefault()
    if (!playerName) { setError('Set a name first'); return }

    const code = roomCode.trim()
    if (!isValidRoomId(code)) {
      setError('Room code must be 3 to 6 digits or letters')
      return
    }

    if (!socket.connected) {
      socket.connect()
    }
    setLoading(true)
    setError('')

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Connection timeout. Please check your backend server (it may take ~30s if waking up from sleep on Render).')
    }, 15000)

    function onCreated(data) {
      clearTimeout(timeoutId)
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      // Save created room code in localStorage for future prefill
      setLastRoomCode(data.room_id)
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers([data.player])
      setColorIndex(data.player.color_index)
      setMessages([])
      navigate(`/${data.game}/room/${data.room_id}`)
    }

    function onRoomError(data) {
      clearTimeout(timeoutId)
      socket.off(EVENTS.ROOM_CREATED, onCreated)
      setError(data.message)
      setLoading(false)
    }

    socket.once(EVENTS.ROOM_CREATED, onCreated)
    socket.once(EVENTS.ROOM_ERROR, onRoomError)
    socket.emit(EVENTS.CREATE_ROOM, {
      game: game.id,
      player_name: playerName,
      room_id: code,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${game.emoji} Create ${game.name} Room`}>
      <form onSubmit={handleCreate} className="space-y-4">
        {/* Host identity badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-blue-400" />
            Host: <strong className="text-white font-semibold">{playerName}</strong>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Room Creator
          </span>
        </div>

        {/* Room Number Customization */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-300">Room Code</label>
            <span className="text-[11px] text-zinc-500">Customizable (3-6 chars)</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))
                setError('')
              }}
              placeholder="e.g. 742"
              maxLength={6}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xl font-bold text-white tracking-widest text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
              autoFocus
            />
            <button
              type="button"
              onClick={handleShuffle}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all flex items-center justify-center group"
              title="Generate Random Code"
            >
              <Dices className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-xs">
          Share this room code with friends to let them join your lobby.
        </p>

        {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-2 rounded-xl">{error}</p>}

        <Button type="submit" variant="primary" loading={loading} className="w-full py-3 text-sm font-bold">
          Create Room
        </Button>
      </form>
    </Modal>
  )
}
