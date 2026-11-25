/**
 * FILE: frontend/src/components/room/RoomLobby.jsx
 * PURPOSE: Minimal, responsive waiting room page shown after creating or joining a room.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Play, Users, CheckCircle2, Circle, AlertCircle, Home } from 'lucide-react'
import LobbyLayout from '../layout/LobbyLayout'
import RoomCode from './RoomCode'
import PlayerSlot from './PlayerSlot'
import Toast from '../ui/Toast'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import BingoLobby from '../../games/bingo/BingoLobby'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { useRoom } from '../../hooks/useRoom'
import { GAMES_MAP } from '../../config/games'
import { getPlayerName, setPlayerName } from '../../utils/localStorage'
import { generateName } from '../../utils/nameGenerator'

export default function RoomLobby() {
  const navigate = useNavigate()
  const { game: routeGame, roomId: routeRoomId } = useParams()

  const { roomId, game, players } = useRoomStore()
  const setRoom = useRoomStore((s) => s.setRoom)
  const setPlayers = useRoomStore((s) => s.setPlayers)
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const setMessages = useChatStore((s) => s.setMessages)

  const { socketId, name: myName, setName, setColorIndex } = usePlayerStore()
  const [toast, setToast] = useState(null)
  const [starting, setStarting] = useState(false)

  // Direct joining states
  const [joining, setJoining] = useState(false)
  const [startedError, setStartedError] = useState(false)
  const [joinError, setJoinError] = useState('')
  const leftExplicitlyRef = useRef(false)
  const unmountLeaveTimerRef = useRef(null)

  useRoom({
    onError: (code, msg) => {
      setToast({ message: msg, type: 'error' })
      setStarting(false)
    },
  })

  // Leave room if user navigates away (e.g. Browser Back) without starting the game.
  // Uses a short timer so React 18 StrictMode double-mount cancels it cleanly.
  useEffect(() => {
    if (unmountLeaveTimerRef.current) {
      clearTimeout(unmountLeaveTimerRef.current)
      unmountLeaveTimerRef.current = null
    }
    leftExplicitlyRef.current = false

    return () => {
      unmountLeaveTimerRef.current = setTimeout(() => {
        const path = window.location.pathname
        const stillInRoomOrGame =
          path.includes('/room/') || path.includes('/play/') || path.includes('/game/')
        const store = useRoomStore.getState()
        if (!leftExplicitlyRef.current && !stillInRoomOrGame && store.roomId && store.status === 'waiting') {
          socket.emit(EVENTS.LEAVE_ROOM, {})
          store.clearRoom()
        }
      }, 80)
    }
  }, [routeRoomId])

  // Direct URL joining: if user lands directly on /:game/room/:roomId or /room/:roomId
  useEffect(() => {
    const targetRoomId = routeRoomId || roomId
    if (!targetRoomId) return

    // If store already has this room loaded, we are good
    if (roomId === targetRoomId && players.length > 0) return

    let activePlayerName = myName || getPlayerName()
    if (!activePlayerName) {
      activePlayerName = generateName()
      setPlayerName(activePlayerName)
      setName(activePlayerName)
    }

    if (!socket.connected) {
      socket.connect()
    }

    setJoining(true)
    setStartedError(false)
    setJoinError('')

    function onJoined(data) {
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      setJoining(false)
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers(data.players)
      setMessages(data.chat_log || [])
      const me = data.players.find(
        (p) => p.name.trim().toLowerCase() === activePlayerName.trim().toLowerCase()
      )
      if (me) setColorIndex(me.color_index)

      // Replace URL with semantic game route if needed
      if (!routeGame || routeGame !== data.game) {
        navigate(`/${data.game}/room/${data.room_id}`, { replace: true })
      }
    }

    function onRoomError(data) {
      socket.off(EVENTS.ROOM_JOINED, onJoined)
      setJoining(false)
      if (data.code === 'ROOM_STARTED') {
        setStartedError(true)
      } else {
        setJoinError(data.message || 'Could not join room')
      }
    }

    // Defer emit by 0ms so React 18 StrictMode's synthetic first mount cancels cleanly
    const joinTimer = setTimeout(() => {
      socket.once(EVENTS.ROOM_JOINED, onJoined)
      socket.once(EVENTS.ROOM_ERROR, onRoomError)
      socket.emit(EVENTS.JOIN_ROOM, { room_id: targetRoomId, player_name: activePlayerName })
    }, 0)

    return () => {
      clearTimeout(joinTimer)
      socket.off(EVENTS.ROOM_JOINED, onJoined)
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
    }
  }, [routeRoomId, roomId, myName])

  const isBingoRoom = game === 'bingo' || routeGame === 'bingo'

  const renderStateShell = (content) => {
    if (!isBingoRoom) {
      return <LobbyLayout>{content}</LobbyLayout>
    }
    return (
      <div
        className="w-screen h-[100dvh] overflow-hidden flex items-center justify-center px-4 select-none"
        style={{
          backgroundColor: '#111318',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, #1c202a 0%, #111318 70%), radial-gradient(circle at 20% 80%, rgba(28, 32, 42, 0.5) 0%, transparent 60%)',
        }}
      >
        {content}
      </div>
    )
  }

  // If game is already started, show friendly dialog
  if (startedError) {
    return renderStateShell(
      <div
        className={`w-full max-w-md rounded-3xl p-7 text-center shadow-2xl ${
          isBingoRoom
            ? 'bg-[#171a21] border border-white/[0.06] font-mono'
            : 'bg-zinc-900 border border-zinc-800 backdrop-blur-xl'
        }`}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
          🎮
        </div>
        <h2 className="text-xl font-bold text-[#e2e8f0] mb-2 tracking-tight">Game Already Started</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          The match in room <strong className="text-[#fffbeb] font-mono">#{routeRoomId}</strong> is already in progress and cannot accept new players right now.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/')} className="flex-1">
            Browse Games
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} className="flex-1">
            Create a Room
          </Button>
        </div>
      </div>
    )
  }

  // If room not found or join failed
  if (joinError) {
    return renderStateShell(
      <div
        className={`w-full max-w-md rounded-3xl p-7 text-center shadow-2xl ${
          isBingoRoom
            ? 'bg-[#171a21] border border-white/[0.06] font-mono'
            : 'bg-zinc-900 border border-zinc-800 backdrop-blur-xl'
        }`}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#e2e8f0] mb-2 tracking-tight">Room Unavailable</h2>
        <p className="text-sm text-zinc-400 mb-6">{joinError}</p>
        <Button variant="primary" onClick={() => navigate('/')} className="w-full">
          Back to Home
        </Button>
      </div>
    )
  }

  // Loading state when joining via link
  if (joining || (!roomId && routeRoomId)) {
    return renderStateShell(
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Spinner className={`w-8 h-8 mb-4 ${isBingoRoom ? 'text-amber-400' : 'text-blue-500'}`} />
        <p className={`text-sm font-medium text-zinc-300 ${isBingoRoom ? 'font-mono' : ''}`}>
          Joining room <span className="font-mono text-[#fffbeb]">#{routeRoomId}</span>...
        </p>
      </div>
    )
  }

  if (!roomId) {
    navigate('/')
    return null
  }

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
    leftExplicitlyRef.current = true
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  if (game === 'bingo') {
    return (
      <>
        <BingoLobby
          roomId={roomId}
          players={players}
          me={me}
          socketId={socketId}
          myName={myName}
          maxPlayers={maxSlots}
          isHost={isHost}
          connectedCount={connectedPlayers.length}
          allReady={allReady}
          canStart={canStart}
          starting={starting}
          onReady={handleReady}
          onStart={handleStart}
          onLeave={handleLeave}
        />
        <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
      </>
    )
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

        {/* Room Code with Copy Link */}
        <div className="py-2">
          <RoomCode roomId={roomId} game={game} />
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
              Need at least 2 players to begin. Share the code or invite link!
            </p>
          )}
        </div>
      </motion.div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
