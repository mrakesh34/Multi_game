/**
 * FILE: frontend/src/games/_shared/WinScreen.jsx
 * PURPOSE: Full-screen overlay shown when the game ends.
 *          Shows winner name, fires confetti, and provides navigation buttons.
 *
 * PROPS:
 *   winnerName : string | null — winning player's name, or null for a draw
 *   reason     : string — "normal" | "forfeit" | "stalemate" | "draw" | "resigned"
 *   onPlayAgain: function — called when "Play Again" is clicked (host only)
 *   onGoHome   : function — called when "Go Home" is clicked
 *
 * CONFETTI (see IMPLEMENTATION_PLAN.md §10):
 *   canvas-confetti fires on mount:
 *   confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } })
 *
 * ANIMATION:
 *   Framer Motion scales in with spring (stiffness 300).
 *   Background: semi-transparent dark overlay, z-index 999.
 *
 * DISPLAY (see IMPLEMENTATION_PLAN.md §9.10):
 *   🎉
 *   {winnerName} Wins!  (or "It's a Draw!" if null)
 *   [Play Again]  [Go Home]
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Home, Clock } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useRoomStore, usePlayerStore } from '../../store'
import Button from '../../components/ui/Button'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'

export default function WinScreen({ winnerName, reason }) {
  const navigate  = useNavigate()
  const { players, roomId, game } = useRoomStore()
  const clearRoom = useRoomStore(s => s.clearRoom)
  const { socketId, name: myName } = usePlayerStore()

  const [requestingReplay, setRequestingReplay] = useState(false)

  const me = players.find(
    (p) => p.socket_id === socketId || (myName && p.name.toLowerCase() === myName.toLowerCase())
  )
  const isHost = me?.is_host ?? false

  useEffect(() => {
    if (winnerName) {
      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } })
    }
  }, [winnerName])

  function handlePlayAgain() {
    setRequestingReplay(true)
    socket.emit(EVENTS.PLAY_AGAIN, {})
  }

  function goHome() {
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-[999] backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass-card p-8 sm:p-10 text-center max-w-sm w-full border border-zinc-800 shadow-2xl rounded-3xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-6xl mb-4">{winnerName ? '🎉' : '🤝'}</div>
        <h1 className="font-game text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
          {winnerName ? `${winnerName} Wins!` : "It's a Draw!"}
        </h1>
        {reason && reason !== 'normal' && (
          <p className="text-zinc-400 text-xs sm:text-sm mb-6 capitalize">{reason}</p>
        )}

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5 justify-center mt-6">
          {isHost ? (
            <Button
              variant="primary"
              loading={requestingReplay}
              onClick={handlePlayAgain}
              className="w-full py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
              <span>Waiting for Host to start rematch...</span>
            </div>
          )}

          <Button variant="ghost" onClick={goHome} className="w-full flex items-center justify-center gap-2">
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Go Home</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
