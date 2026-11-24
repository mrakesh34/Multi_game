/**
 * FILE: frontend/src/hooks/useRoom.js
 * PURPOSE: Registers all room-level socket event listeners and syncs them
 *          into the roomStore and chatStore automatically.
 *
 * EVENTS HANDLED:
 *   player_joined        → updates roomStore.players
 *   player_left          → updates roomStore.players
 *   player_ready_changed → updates roomStore.players
 *   player_disconnected  → marks player as disconnected in players list
 *   player_reconnected   → marks player as connected again
 *   game_started         → sets roomStore.status = "playing", sets gameState
 *   game_state_update    → updates roomStore.gameState
 *   game_over            → sets roomStore.status = "finished"
 *   chat_broadcast       → adds message to chatStore
 *   room_error           → triggers a toast notification (via onError callback)
 *
 * USAGE:
 *   useRoom({ onError: (code, msg) => showToast(msg) })
 *   Call this in RoomLobby and GameLayout — not in both simultaneously
 *   (it registers listeners; calling twice = double-handling).
 *
 * RETURNS: nothing (all state goes into stores)
 *
 * LIFECYCLE:
 *   Sets up listeners on mount, tears them all down on unmount.
 *   Safe to call in any component that gets mounted once per page.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../socket/socket'
import { EVENTS } from '../socket/events'
import { useRoomStore, useChatStore } from '../store'

export function useRoom({ onError } = {}) {
  const navigate    = useNavigate()
  const setPlayers  = useRoomStore(s => s.setPlayers)
  const setStatus   = useRoomStore(s => s.setStatus)
  const setGameState= useRoomStore(s => s.setGameState)
  const addMessage  = useChatStore(s => s.addMessage)

  useEffect(() => {
    function onPlayerJoined(data)       { setPlayers(data.players) }
    function onPlayerLeft(data)         { setPlayers(data.players) }
    function onReadyChanged(data)       { setPlayers(data.players) }
    function onPlayerDisconnected(data) {
      // Mark player as disconnected without removing them
      setPlayers(useRoomStore.getState().players.map(p =>
        p.name === data.player_name ? { ...p, is_connected: false } : p
      ))
    }
    function onPlayerReconnected(data) {
      if (data.players) {
        setPlayers(data.players)
      } else {
        setPlayers(useRoomStore.getState().players.map(p =>
          p.name === data.player_name ? { ...p, is_connected: true, socket_id: data.socket_id } : p
        ))
      }
    }
    function onGameStarted(data) {
      setStatus('playing')
      setGameState(data.game_state)
      const roomId = useRoomStore.getState().roomId
      const game = useRoomStore.getState().game || 'bingo'
      navigate(`/${game}/play/${roomId}`)
    }
    function onRoomReset(data) {
      setStatus('waiting')
      setGameState(null)
      if (data.players) setPlayers(data.players)
      const rId = data.room_id || useRoomStore.getState().roomId
      const g = data.game || useRoomStore.getState().game
      navigate(`/${g}/room/${rId}`)
    }
    function onGameStateUpdate(data) { setGameState(data.game_state) }
    function onGameOver(data)        { setStatus('finished') }
    function onChatBroadcast(msg)    { addMessage(msg) }
    function onRoomError(data)       { onError?.(data.code, data.message) }

    socket.on(EVENTS.PLAYER_JOINED,        onPlayerJoined)
    socket.on(EVENTS.PLAYER_LEFT,          onPlayerLeft)
    socket.on(EVENTS.PLAYER_READY_CHANGED, onReadyChanged)
    socket.on(EVENTS.PLAYER_DISCONNECTED,  onPlayerDisconnected)
    socket.on(EVENTS.PLAYER_RECONNECTED,   onPlayerReconnected)
    socket.on(EVENTS.GAME_STARTED,         onGameStarted)
    socket.on(EVENTS.ROOM_RESET,           onRoomReset)
    socket.on(EVENTS.GAME_STATE_UPDATE,    onGameStateUpdate)
    socket.on(EVENTS.GAME_OVER,            onGameOver)
    socket.on(EVENTS.CHAT_BROADCAST,       onChatBroadcast)
    socket.on(EVENTS.ROOM_ERROR,           onRoomError)

    return () => {
      socket.off(EVENTS.PLAYER_JOINED,        onPlayerJoined)
      socket.off(EVENTS.PLAYER_LEFT,          onPlayerLeft)
      socket.off(EVENTS.PLAYER_READY_CHANGED, onReadyChanged)
      socket.off(EVENTS.PLAYER_DISCONNECTED,  onPlayerDisconnected)
      socket.off(EVENTS.PLAYER_RECONNECTED,   onPlayerReconnected)
      socket.off(EVENTS.GAME_STARTED,         onGameStarted)
      socket.off(EVENTS.ROOM_RESET,           onRoomReset)
      socket.off(EVENTS.GAME_STATE_UPDATE,    onGameStateUpdate)
      socket.off(EVENTS.GAME_OVER,            onGameOver)
      socket.off(EVENTS.CHAT_BROADCAST,       onChatBroadcast)
      socket.off(EVENTS.ROOM_ERROR,           onRoomError)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps
}
