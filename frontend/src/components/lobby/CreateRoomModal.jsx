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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal   from '../ui/Modal'
import Button  from '../ui/Button'
import socket  from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'

export default function CreateRoomModal({ isOpen, onClose, game, playerName, onError }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const navigate    = useNavigate()
  const setRoom     = useRoomStore(s => s.setRoom)
  const setPlayers  = useRoomStore(s => s.setPlayers)
  const setColorIndex = usePlayerStore(s => s.setColorIndex)
  const setMessages = useChatStore(s => s.setMessages)

  function handleCreate() {
    if (!playerName) { setError('Set a name first'); return }
    if (!socket.connected) {
      socket.connect()
    }
    setLoading(true)
    setError('')

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Connection timeout. Please check your backend server.')
    }, 6000)

    function onCreated(data) {
      clearTimeout(timeoutId)
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers([data.player])
      setColorIndex(data.player.color_index)
      setMessages([])
      navigate(`/room/${data.room_id}`)
    }

    function onRoomError(data) {
      clearTimeout(timeoutId)
      socket.off(EVENTS.ROOM_CREATED, onCreated)
      setError(data.message)
      setLoading(false)
    }

    socket.once(EVENTS.ROOM_CREATED, onCreated)
    socket.once(EVENTS.ROOM_ERROR, onRoomError)
    socket.emit(EVENTS.CREATE_ROOM, { game: game.id, player_name: playerName })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${game.emoji} Create ${game.name} Room`}>
      <p className="text-slate-400 mb-5 text-sm">
        You'll be the host. Share the room code with friends after creation.
      </p>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <Button variant="primary" loading={loading} onClick={handleCreate} className="w-full">
        Create Room as "{playerName}"
      </Button>
    </Modal>
  )
}
