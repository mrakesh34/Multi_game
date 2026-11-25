/**
 * FILE: frontend/src/components/lobby/CreateRoomModal.jsx
 * PURPOSE: Tactile modal for creating a new room for a selected game.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dices, User } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { getLastRoomCode, setLastRoomCode } from '../../utils/localStorage'
import { generateSuggestedRoomId, isValidRoomId } from '../../utils/roomCode'
import { playFlipClack, playKeyThock } from '../../utils/uiAudio'

export default function CreateRoomModal({ isOpen, onClose, game, playerName, onError }) {
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setRoom = useRoomStore(s => s.setRoom)
  const setPlayers = useRoomStore(s => s.setPlayers)
  const setColorIndex = usePlayerStore(s => s.setColorIndex)
  const setMessages = useChatStore(s => s.setMessages)

  useEffect(() => {
    if (isOpen) {
      const saved = getLastRoomCode()
      setRoomCode(saved || generateSuggestedRoomId())
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  function handleShuffle() {
    playFlipClack()
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
    playKeyThock(200)
    setLoading(true)
    setError('')

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Connection timeout. Please check your backend server (it may take ~30s if waking up from sleep on Render).')
    }, 15000)

    function onCreated(data) {
      clearTimeout(timeoutId)
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Create ${game.name} Room`}>
      <form onSubmit={handleCreate} className="space-y-4">
        {/* Game + Host Preview Strip */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl recessed-well text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={game.image}
              alt={game.name}
              className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
            />
            <span className="flex items-center gap-1.5 text-[#8a919e] truncate">
              <User className="w-3.5 h-3.5 text-[#e07a22] flex-shrink-0" />
              Host: <strong className="text-[#f2ece1] font-mono truncate">{playerName}</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase flex-shrink-0">
            Host
          </span>
        </div>

        {/* Room Code Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8a919e]">
              Room Code
            </label>
            <span className="text-[11px] font-mono text-[#8a919e]">3–6 chars</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))
                setError('')
              }}
              placeholder="e.g. 742"
              maxLength={6}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0c0e13] border border-white/[0.08] font-mono text-xl font-black text-[#f2ece1] tracking-widest text-center focus:outline-none focus:border-[#e07a22] focus:ring-1 focus:ring-[#e07a22]/40 shadow-[inset_0_2px_6px_rgba(0,0,0,0.65)]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleShuffle}
              className="keycap-btn px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-[#f2ece1] flex items-center justify-center group cursor-pointer"
              title="Generate Random Code"
            >
              <Dices className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>

        <p className="text-[#8a919e] text-xs">
          Share this code or invite link with friends to jump into your lobby.
        </p>

        {error && (
          <p className="text-[#fde8e4] text-xs font-mono bg-[#d9482b]/15 border border-[#d9482b]/40 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" loading={loading} silent className="w-full py-3 text-xs font-mono uppercase tracking-wider">
          Create Room
        </Button>
      </form>
    </Modal>
  )
}
