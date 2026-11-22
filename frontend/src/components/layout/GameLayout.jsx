/**
 * FILE: frontend/src/components/layout/GameLayout.jsx
 * PURPOSE: In-game layout wrapper — split view with game board on the left
 *          and chat drawer on the right. Also lazy-loads the correct game component.
 *
 * LAYOUT (see IMPLEMENTATION_PLAN.md §9.8):
 *   ┌──────────────────── Top Bar ────────────────────┐
 *   │  [GameZone]  Room: 742   Players ● ● ●  [🔇][💬] │
 *   ├──────────────────────────────┬──────────────────┤
 *   │                              │                  │
 *   │   GAME BOARD (lazy-loaded)   │   Chat Drawer    │
 *   │                              │   (320px wide)   │
 *   │                              │                  │
 *   └──────────────────────────────┴──────────────────┘
 *
 * ROUTE PROTECTION:
 *   If roomStore has no active room (roomId is null), redirects to "/".
 *   This prevents direct URL access to /game/xxx without being in a room.
 *
 * LAZY LOADING:
 *   The game component is loaded with React.lazy() based on roomStore.game.
 *   Wrapped in <Suspense fallback={<Spinner />}>.
 *   Game components are in src/games/<name>/index.jsx.
 *
 * SOUND TOGGLE:
 *   Mute button in the top bar toggles setSoundEnabled() in localStorage.
 *   State is local (re-read from LS on each click).
 *
 * WHICH GAME TO LOAD:
 *   const GameComponent = React.lazy(() => import(`../../games/${game}/index.jsx`))
 *   This requires game values to match directory names exactly: ludo/bingo/chess/uno
 */

import { lazy, Suspense, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useRoomStore, usePlayerStore } from '../../store'
import { GAMES_MAP } from '../../config/games'
import { getSoundEnabled, setSoundEnabled } from '../../utils/localStorage'
import Spinner from '../ui/Spinner'
import ChatDrawer from '../chat/ChatDrawer'
import { useRoom } from '../../hooks/useRoom'
import Toast from '../ui/Toast'

// Lazy-load game components by game id
const GAME_LOADERS = {
  ludo:  lazy(() => import('../../games/ludo/index.jsx')),
  bingo: lazy(() => import('../../games/bingo/index.jsx')),
  chess: lazy(() => import('../../games/chess/index.jsx')),
  uno:   lazy(() => import('../../games/uno/index.jsx')),
}

export default function GameLayout() {
  const { roomId, game, players } = useRoomStore()
  const { name: myName } = usePlayerStore()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [soundOn, setSoundOn] = useState(getSoundEnabled())

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

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-white/10 flex-shrink-0">
        <span className="font-game text-xl font-bold text-white cursor-pointer" onClick={() => navigate('/')}>
          🎮 GameZone
        </span>
        <span className="text-slate-400">Room <span className="font-mono text-white">{roomId}</span></span>
        <div className="flex gap-2 ml-2">
          {players.filter(p => p.is_connected).map(p => (
            <span key={p.socket_id} className="w-2 h-2 rounded-full bg-green-400" title={p.name} />
          ))}
        </div>
        <div className="ml-auto flex gap-3">
          <button onClick={toggleSound} className="text-slate-400 hover:text-white transition-colors text-xl" title="Toggle sound">
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Game board area */}
        <main className="flex-1 overflow-auto relative">
          {GameComponent ? (
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>}>
              <GameComponent />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">Unknown game: {game}</div>
          )}
        </main>

        {/* Chat drawer (always rendered; visibility controlled internally) */}
        <ChatDrawer />
      </div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
