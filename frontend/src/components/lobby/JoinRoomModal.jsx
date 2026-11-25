/**
 * FILE: frontend/src/components/lobby/JoinRoomModal.jsx
 * PURPOSE: Tactile modal for joining an existing room by its 3-digit code.
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { isValidRoomId } from '../../utils/roomCode'
import { playKeyThock } from '../../utils/uiAudio'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'

export default function JoinRoomModal({ isOpen, onClose, game, playerName, onError }) {
  const [digits, setDigits] = useState(['', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = [useRef(), useRef(), useRef()]
  const navigate = useNavigate()
  const setRoom = useRoomStore(s => s.setRoom)
  const setPlayers = useRoomStore(s => s.setPlayers)
  const setColorIndex = usePlayerStore(s => s.setColorIndex)
  const setMessages = useChatStore(s => s.setMessages)

  function handleDigit(index, value) {
    const d = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = d
    setDigits(next)
    if (d) playKeyThock(210 + index * 20)
    if (d && index < 2) inputRefs[index + 1].current?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  function handleJoin(e) {
    e?.preventDefault()
    const code = digits.join('')
    if (!isValidRoomId(code)) { setError('Enter a valid 3-digit code'); return }
    if (!playerName) { setError('Set a name first'); return }
    if (!socket.connected) socket.connect()
    playKeyThock(190)
    setLoading(true)
    setError('')

    function onJoined(data) {
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers(data.players)
      setMessages(data.chat_log || [])
      const me = data.players.find(p => p.name === playerName)
      if (me) setColorIndex(me.color_index)
      navigate(`/${data.game}/room/${data.room_id}`)
    }

    function onRoomError(data) {
      socket.off(EVENTS.ROOM_JOINED, onJoined)
      setError(data.message)
      setLoading(false)
    }

    socket.once(EVENTS.ROOM_JOINED, onJoined)
    socket.once(EVENTS.ROOM_ERROR, onRoomError)
    socket.emit(EVENTS.JOIN_ROOM, { room_id: code, player_name: playerName })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Join ${game.name} Room`}>
      <form onSubmit={handleJoin} className="space-y-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl recessed-well">
          <img
            src={game.image}
            alt={game.name}
            className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
          />
          <p className="text-[#8a919e] text-xs">
            Enter the 3-digit room code shared by the host.
          </p>
        </div>

        {/* 3-digit keycap input */}
        <div className="flex gap-3 justify-center py-1">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              className="w-16 h-16 text-center text-3xl font-mono font-black bg-[#0c0e13] border border-white/[0.1] rounded-2xl text-[#f2ece1] focus:outline-none focus:border-[#e07a22] focus:ring-1 focus:ring-[#e07a22]/50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)] transition-all"
              value={d}
              maxLength={1}
              inputMode="numeric"
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {error && (
          <p className="text-[#fde8e4] text-xs font-mono text-center bg-[#d9482b]/15 border border-[#d9482b]/40 p-2 rounded-xl">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" loading={loading} silent className="w-full py-3 text-xs font-mono uppercase tracking-wider">
          Join Room
        </Button>
      </form>
    </Modal>
  )
}
