/**
 * FILE: frontend/src/hooks/useSocket.js
 * PURPOSE: Manages the Socket.IO connection lifecycle — connect on mount,
 *          disconnect on unmount.
 *
 * WHAT IT DOES:
 *   - Calls socket.connect() when the component that uses this hook mounts.
 *   - Calls socket.disconnect() on unmount (component unmount = navigation away).
 *   - Listens for 'connect' and 'disconnect' events to update local state.
 *   - Saves the socket's ID (sid) into playerStore via setSocketId().
 *
 * RETURNS: { socket, connected }
 *   socket    : The shared Socket.IO instance (from socket/socket.js)
 *   connected : boolean — true when WebSocket handshake is complete
 *
 * USAGE:
 *   const { socket, connected } = useSocket()
 *
 * WHERE TO USE:
 *   Call this once at the top level of a page that needs socket access.
 *   Child components should import the socket singleton directly for event listening.
 *
 * IMPORTANT:
 *   Do NOT call useSocket() in multiple nested components simultaneously —
 *   the disconnect on unmount of any one of them would drop the connection.
 */

import { useEffect, useState } from 'react'
import socket from '../socket/socket'
import { usePlayerStore, useRoomStore } from '../store'
import { EVENTS } from '../socket/events'

export function useSocket() {
  const [connected, setConnected] = useState(socket.connected)
  const setSocketId = usePlayerStore(s => s.setSocketId)

  useEffect(() => {
    function onConnect() {
      setConnected(true)
      setSocketId(socket.id)

      // Auto-reconnect if returning or refreshed within a room
      const roomId = useRoomStore.getState().roomId
      const name = usePlayerStore.getState().name
      if (roomId && name) {
        socket.emit(EVENTS.RECONNECT_ROOM, { room_id: roomId, player_name: name })
      }
    }
    function onDisconnect() {
      setConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // Ensure connection is active
    if (!socket.connected) {
      socket.connect()
    } else {
      onConnect()
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      // Note: Do NOT call socket.disconnect() here so the WebSocket session
      // persists across page routing (HomePage -> RoomLobby -> GameLayout).
    }
  }, [])

  return { socket, connected }
}
