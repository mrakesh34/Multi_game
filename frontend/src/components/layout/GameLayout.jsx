/**
 * FILE: frontend/src/components/layout/GameLayout.jsx
 * PURPOSE: Minimal, responsive in-game layout wrapper styled in TE-01 Tactile Console.
 *          Maintains a centered game viewport that never shifts or resizes
 *          when the transparent chat panel is toggled.
 */

import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate, useParams } from 'react-router-dom'
import { Volume2, VolumeX, MessageSquare, ArrowLeft, Copy, Check } from 'lucide-react'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { GAMES_MAP } from '../../config/games'
import { getSoundEnabled, setSoundEnabled } from '../../utils/localStorage'
import { playKeyThock } from '../../utils/uiAudio'
import Spinner from '../ui/Spinner'
import ChatDrawer from '../chat/ChatDrawer'
import { useRoom } from '../../hooks/useRoom'
import Toast from '../ui/Toast'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'

const GAME_LOADERS = {
  ludo: lazy(() => import('../../games/ludo/index.jsx')),
  bingo: lazy(() => import('../../games/bingo/index.jsx')),
  chess: lazy(() => import('../../games/chess/index.jsx')),
  uno: lazy(() => import('../../games/uno/index.jsx')),
}

export default function GameLayout() {
  const { game: routeGame, roomId: routeRoomId } = useParams()
  const { roomId: storeRoomId, game: storeGame, players } = useRoomStore()
  const setRoom = useRoomStore((s) => s.setRoom)
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const { isOpen: chatOpen, setOpen: setChatOpen, unreadCount } = useChatStore()
  const navigate = useNavigate()

  const [toast, setToast] = useState(null)
  const [soundOn, setSoundOn] = useState(getSoundEnabled())
  const [copiedCode, setCopiedCode] = useState(false)
  const leftExplicitlyRef = useRef(false)
  const unmountLeaveTimerRef = useRef(null)

  const roomId = storeRoomId || routeRoomId
  const game = storeGame || routeGame || 'bingo'

  useEffect(() => {
    if (routeRoomId && (!storeRoomId || !storeGame)) {
      setRoom({ roomId: routeRoomId, game: routeGame || 'bingo', status: 'playing' })
    }
  }, [routeRoomId, routeGame, storeRoomId, storeGame, setRoom])

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
        if (!leftExplicitlyRef.current && !stillInRoomOrGame && store.roomId) {
          socket.emit(EVENTS.LEAVE_ROOM, {})
          store.clearRoom()
        }
      }, 80)
    }
  }, [routeRoomId])

  useRoom({
    onError: (code, msg) => setToast({ message: msg, type: 'error' }),
  })

  if (!roomId) return <Navigate to="/" replace />

  const gameConfig = GAMES_MAP[game] || {}
  const GameComponent = GAME_LOADERS[game]

  function toggleSound() {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
    if (next) playKeyThock(195)
  }

  function handleGoHome() {
    playKeyThock(150)
    leftExplicitlyRef.current = true
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  function copyRoomCode() {
    playKeyThock(200)
    navigator.clipboard?.writeText(roomId)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-[#111318] text-[#f2ece1] selection:bg-[#e07a22] selection:text-[#fffaf0]">
      {/* Hardware Console Top Strip */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#13161d] border-b border-white/[0.06] z-20 flex-shrink-0">
        {/* Left: Back + Game Badge + Room Code */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1a1e27] hover:bg-[#232834] border border-white/[0.07] text-[#8a919e] hover:text-[#f2ece1] transition-all group cursor-pointer"
            title="Leave to Home"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-mono font-semibold hidden sm:inline">Home</span>
          </button>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          <div className="flex items-center gap-2">
            {gameConfig.image ? (
              <img
                src={gameConfig.image}
                alt={gameConfig.name}
                className="w-6 h-6 rounded-md object-cover border border-white/10"
              />
            ) : (
              <span className="text-base">{gameConfig.emoji}</span>
            )}
            <span className="font-bold text-sm text-[#f2ece1] tracking-tight">{gameConfig.name}</span>
          </div>

          {/* Room Code Pill */}
          <button
            type="button"
            onClick={copyRoomCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c0e13] hover:bg-[#171a21] border border-white/[0.07] text-xs font-mono text-[#8a919e] transition-all group cursor-pointer"
            title="Click to copy room code"
          >
            <span className="text-[10px] uppercase">Room</span>
            <span className="font-bold text-[#f2ece1]">{roomId}</span>
            {copiedCode ? (
              <Check className="w-3 h-3 text-[#10b981] ml-0.5" />
            ) : (
              <Copy className="w-3 h-3 text-[#8a919e] group-hover:text-[#f2ece1] ml-0.5" />
            )}
          </button>
        </div>

        {/* Center: Connected Players LED Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {players.map((p, idx) => (
            <div
              key={p.socket_id || p.name || idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                p.is_connected
                  ? 'bg-[#171a21] border-white/[0.07] text-[#f2ece1]'
                  : 'bg-[#0c0e13]/60 border-white/[0.04] text-zinc-600 line-through'
              }`}
              title={p.is_connected ? `${p.name} (Connected)` : `${p.name} (Disconnected)`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  p.is_connected ? 'bg-[#10b981]' : 'bg-zinc-600'
                }`}
              />
              <span className="truncate max-w-[90px]">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Right: Audio Toggle & Chat Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#1a1e27] hover:bg-[#232834] border border-white/[0.07] text-[#8a919e] hover:text-[#f2ece1] transition-all cursor-pointer"
            title={soundOn ? 'Mute sound' : 'Unmute sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#e07a22]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <button
            type="button"
            onClick={() => {
              playKeyThock(175)
              setChatOpen(!chatOpen)
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
              chatOpen
                ? 'bg-[#e07a22]/15 border-[#e07a22]/40 text-amber-300'
                : 'bg-[#1a1e27] hover:bg-[#232834] border-white/[0.07] text-[#f2ece1]'
            }`}
            title="Toggle room chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chat</span>
            {!chatOpen && unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#e07a22] text-[#fffaf0] text-[10px] font-mono flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Body with Fixed Board Layout and Floating Transparent Chat */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <main className="w-full h-full overflow-hidden relative flex flex-col">
          {GameComponent ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Spinner size="lg" />
                </div>
              }
            >
              <GameComponent />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full font-mono text-xs text-[#8a919e]">
              Unknown game: {game}
            </div>
          )}
        </main>

        <ChatDrawer />
      </div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
