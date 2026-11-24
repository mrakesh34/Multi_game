/**
 * FILE: frontend/src/socket/socket.js
 * PURPOSE: Socket.IO client singleton instance.
 *          Import `socket` from here anywhere you need to emit or listen.
 *
 * WHY A SINGLETON:
 *   Creating multiple socket instances would open multiple WebSocket connections
 *   to the backend, breaking the room system. One instance for the whole app.
 *
 * CONFIGURATION:
 *   autoConnect: false
 *     The socket does NOT connect automatically on import.
 *     Connection is initiated explicitly in useSocket.js (the hook that manages
 *     the socket lifecycle tied to the React component tree).
 *
 *   transports: ["websocket"]
 *     Skip Socket.IO's HTTP long-polling fallback. We require WebSocket directly.
 *     This avoids extra round-trips and matches the server's expectation.
 *
 *   VITE_BACKEND_URL:
 *     Set in frontend/.env as VITE_BACKEND_URL=http://localhost:8000
 *     Vite replaces import.meta.env.VITE_* at build time.
 *
 * USAGE:
 *   import socket from '../socket/socket'
 *   socket.emit('create_room', { game: 'ludo', player_name: 'BlueFox' })
 *   socket.on('room_created', handler)
 *   socket.off('room_created', handler)   // ← always clean up in useEffect
 */

import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})

export default socket
