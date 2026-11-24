/**
 * FILE: frontend/src/components/layout/GameLayout.jsx
 * PURPOSE: Minimal, responsive in-game layout wrapper.
 *          Maintains a centered game viewport that never shifts or resizes
 *          when the transparent chat panel is toggled.
 */

import { lazy, Suspense, useState, useEffect } from 'react'
import { useNavigate, Navigate, useParams } from 'react-router-dom'
import { Volume2, VolumeX, MessageSquare, ArrowLeft, Gamepad2, Copy, Check } from 'lucide-react'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { GAMES_MAP } from '../../config/games'
import { getSoundEnabled, setSoundEnabled } from '../../utils/localStorage'
import Spinner from '../ui/Spinner'
import ChatDrawer from '../chat/ChatDrawer'
import { useRoom } from '../../hooks/useRoom'
import Toast from '../ui/Toast'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'

// Lazy-load game components by game id
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
  const { name: myName } = usePlayerStore()
  const { isOpen: chatOpen, setOpen: setChatOpen, unreadCount } = useChatStore()
  const navigate = useNavigate()

  const [toast, setToast] = useState(null)
  const [soundOn, setSoundOn] = useState(getSoundEnabled())
  const [copiedCode, setCopiedCode] = useState(false)

  const roomId = storeRoomId || routeRoomId
  const game = storeGame || routeGame || 'bingo'

  useEffect(() => {
    if (routeRoomId && (!storeRoomId || !storeGame)) {
      setRoom({ roomId: routeRoomId, game: routeGame || 'bingo', status: 'playing' })
    }
  }, [routeRoomId, routeGame, storeRoomId, storeGame, setRoom])

  // Register room-level socket listeners
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
  }

  function handleGoHome() {
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  function copyRoomCode() {
    navigator.clipboard?.writeText(roomId)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Sleek Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-zinc-950 border-b border-zinc-900 z-20 flex-shrink-0">
        {/* Left: Back / Home + Game Label */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all group"
            title="Leave to Home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold hidden sm:inline">Home</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800" />

          <div className="flex items-center gap-2">
            <span className="text-base">{gameConfig.emoji}</span>
            <span className="font-bold text-sm text-white tracking-tight">{gameConfig.name}</span>
          </div>

          {/* Room Code Badge */}
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 transition-all group"
            title="Click to copy room code"
          >
            <span className="text-zinc-500 font-sans text-[11px]">Room</span>
            <span className="font-bold text-white">{roomId}</span>
            {copiedCode ? (
              <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 ml-0.5" />
            )}
          </button>
        </div>

        {/* Center: Connected Players Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {players.map((p, idx) => (
            <div
              key={p.socket_id || p.name || idx}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium transition-all ${p.is_connected
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600 line-through'
                }`}
              title={p.is_connected ? `${p.name} (Connected)` : `${p.name} (Disconnected)`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${p.is_connected ? 'bg-emerald-500' : 'bg-zinc-600'}`}
              />
              <span className="truncate max-w-[90px]">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Right: Audio Toggle & Chat Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title={soundOn ? 'Mute sound' : 'Unmute sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${chatOpen
              ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
              : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            title="Toggle room chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chat</span>
            {!chatOpen && unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Body with Fixed Board Layout and Floating Transparent Chat */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Game Viewport: occupies 100% width and height, completely centered */}
        <main className="w-full h-full overflow-auto relative flex flex-col">
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
            <div className="flex items-center justify-center h-full text-zinc-500">
              Unknown game: {game}
            </div>
          )}
        </main>

        {/* Floating Transparent Chat Drawer (overlays without resizing main viewport) */}
        <ChatDrawer />
      </div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
