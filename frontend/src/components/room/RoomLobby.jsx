/**
 * FILE: frontend/src/components/room/RoomLobby.jsx
 * PURPOSE: Waiting room page shown after creating or joining a room.
 *          Delegates Bingo directly to untouched BingoLobby; styles all other
 *          game rooms in the matching TE-01 Tactile Console chassis.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Play, Users, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import LobbyLayout from '../layout/LobbyLayout'
import RoomCode from './RoomCode'
import PlayerSlot from './PlayerSlot'
import Toast from '../ui/Toast'
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
import { playKeyThock, playWarmChime } from '../../utils/uiAudio'

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

  // Direct URL joining
  useEffect(() => {
    const targetRoomId = routeRoomId || roomId
    if (!targetRoomId) return

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

  // Game already started
  if (startedError) {
    return renderStateShell(
      <div className="w-full max-w-md rounded-3xl p-7 text-center bg-[#171a21] border border-white/[0.08] shadow-2xl font-mono my-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-3xl">
          🎮
        </div>
        <h2 className="text-xl font-bold text-[#f2ece1] mb-2 tracking-tight">Game Already Started</h2>
        <p className="text-xs text-[#8a919e] mb-6 leading-relaxed">
          The match in room <strong className="text-[#fffbeb] font-mono">#{routeRoomId}</strong> is already in progress.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
            Browse Games
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} className="flex-1">
            Create Room
          </Button>
        </div>
      </div>
    )
  }

  // Room not found or join failed
  if (joinError) {
    return renderStateShell(
      <div className="w-full max-w-md rounded-3xl p-7 text-center bg-[#171a21] border border-white/[0.08] shadow-2xl font-mono my-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#d9482b]/10 border border-[#d9482b]/30 flex items-center justify-center text-[#d9482b]">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#f2ece1] mb-2 tracking-tight">Room Unavailable</h2>
        <p className="text-xs text-[#8a919e] mb-6">{joinError}</p>
        <Button variant="primary" onClick={() => navigate('/')} className="w-full">
          Back to Home
        </Button>
      </div>
    )
  }

  // Loading state when joining via link
  if (joining || (!roomId && routeRoomId)) {
    return renderStateShell(
      <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
        <Spinner className="w-8 h-8 mb-4 text-[#e07a22]" />
        <p className="text-sm font-mono font-medium text-[#8a919e]">
          Joining room <span className="text-[#fffbeb]">#{routeRoomId}</span>...
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

  const maxSlots = gameConfig.maxPlayers || 4
  const slots = Array.from({ length: maxSlots }, (_, i) => players[i] || null)

  function handleReady() {
    playKeyThock(190)
    socket.emit(EVENTS.TOGGLE_READY, {})
  }
  function handleStart() {
    playWarmChime()
    setStarting(true)
    socket.emit(EVENTS.START_GAME, {})
  }
  function handleLeave() {
    playKeyThock(145)
    leftExplicitlyRef.current = true
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  // Bingo keeps its dedicated, untouched BingoLobby
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
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="relative w-full max-w-md chassis-card rounded-3xl p-6 sm:p-7 my-auto"
      >
        {/* Corner hardware screws */}
        {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} w-2 h-2 rounded-full bg-[#242935] border border-white/[0.08] pointer-events-none`}
          />
        ))}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            {gameConfig.image ? (
              <img
                src={gameConfig.image}
                alt={gameConfig.name}
                className="w-11 h-11 rounded-xl object-cover border border-white/[0.1] shadow-md"
              />
            ) : (
              <span className="text-2xl p-2 rounded-xl recessed-well">{gameConfig.emoji}</span>
            )}
            <div>
              <h1 className="text-lg font-extrabold text-[#f2ece1] tracking-tight">
                {gameConfig.name} Room
              </h1>
              <p className="text-[11px] font-mono text-[#8a919e]">{gameConfig.tagline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="keycap-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-zinc-300 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>

        {/* Room Code */}
        <div className="mb-5">
          <RoomCode roomId={roomId} game={game} />
        </div>

        {/* Player Roster */}
        <div className="flex flex-col gap-2.5 mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8a919e] font-bold uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#e07a22]" />
              <span>Player Bays</span>
            </span>
            <span>
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
        <div className="flex flex-col gap-2 pt-1">
          {!isHost && (
            <button
              type="button"
              onClick={handleReady}
              className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                me?.is_ready
                  ? 'bg-gradient-to-b from-[#059669] to-[#047857] border border-emerald-400/40 text-[#ecfdf5] shadow-[0_4px_0_#064e3b] active:translate-y-[3px] active:shadow-[0_1px_0_#064e3b]'
                  : 'keycap-primary'
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
              type="button"
              disabled={!canStart || starting}
              onClick={handleStart}
              className="keycap-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{starting ? 'Starting match...' : 'Start Game'}</span>
            </button>
          )}

          {isHost && !allReady && connectedPlayers.length >= 2 && (
            <p className="text-[11px] font-mono text-[#8a919e] text-center mt-1">
              Waiting for all players to ready up...
            </p>
          )}

          {isHost && connectedPlayers.length < 2 && (
            <p className="text-[11px] font-mono text-[#8a919e] text-center mt-1">
              Need at least 2 players — share the room code or invite link.
            </p>
          )}
        </div>
      </motion.div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
