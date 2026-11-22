/**
 * FILE: frontend/src/components/lobby/JoinRoomModal.jsx
 * PURPOSE: Modal for joining an existing room by its 3-digit code.
 *
 * PROPS:
 *   isOpen     : boolean
 *   onClose    : function
 *   game       : game config object { id, name, emoji }
 *   playerName : current local player's name
 *   onError    : callback(message) for errors
 *
 * INPUT VALIDATION:
 *   - Room code must be exactly 3 numeric digits (enforced by isValidRoomId)
 *   - Digits only: input filtered to [0-9]
 *   - Each digit typed into a separate single-character input field for UX
 *     (auto-focus next field on each keypress, backspace goes back)
 *
 * SOCKET EVENTS:
 *   EMIT: join_room → { room_id: "742", player_name }
 *   LISTEN (once):
 *     room_joined  → store room state, navigate to /room/:id
 *     room_error   → show inline error, stop loading
 *
 * ERROR CODES TO HANDLE:
 *   ROOM_NOT_FOUND → "Room does not exist"
 *   ROOM_FULL      → "Room is full"
 *   ROOM_STARTED   → "Game already in progress"
 *   NAME_TAKEN     → "Name already taken in this room"
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal  from '../ui/Modal'
import Button from '../ui/Button'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { isValidRoomId } from '../../utils/roomCode'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'

export default function JoinRoomModal({ isOpen, onClose, game, playerName, onError }) {
  const [digits,  setDigits]  = useState(['', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputRefs = [useRef(), useRef(), useRef()]
  const navigate  = useNavigate()
  const setRoom   = useRoomStore(s => s.setRoom)
  const setPlayers= useRoomStore(s => s.setPlayers)
  const setColorIndex = usePlayerStore(s => s.setColorIndex)
  const setMessages   = useChatStore(s => s.setMessages)

  function handleDigit(index, value) {
    const d = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = d
    setDigits(next)
    if (d && index < 2) inputRefs[index + 1].current?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  function handleJoin() {
    const code = digits.join('')
    if (!isValidRoomId(code)) { setError('Enter a valid 3-digit code'); return }
    if (!playerName) { setError('Set a name first'); return }
    setLoading(true)
    setError('')

    function onJoined(data) {
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers(data.players)
      setMessages(data.chat_log || [])
      const me = data.players.find(p => p.name === playerName)
      if (me) setColorIndex(me.color_index)
      navigate(`/room/${data.room_id}`)
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
    <Modal isOpen={isOpen} onClose={onClose} title={`${game.emoji} Join ${game.name} Room`}>
      <p className="text-slate-400 text-sm mb-5">Enter the 3-digit room code.</p>

      {/* 3-digit input */}
      <div className="flex gap-3 justify-center mb-5">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            className="w-16 h-16 text-center text-3xl font-mono font-black bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
            value={d}
            maxLength={1}
            inputMode="numeric"
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

      <Button variant="primary" loading={loading} onClick={handleJoin} className="w-full">
        Join Room
      </Button>
    </Modal>
  )
}
