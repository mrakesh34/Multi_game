/**
 * FILE: frontend/src/games/_shared/WinScreen.jsx
 * PURPOSE: Tactile hardware victory overlay shown when Chess, Ludo, or UNO finishes.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Home, Clock, Trophy, Handshake } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useRoomStore, usePlayerStore } from '../../store'
import { playWarmChime, playKeyThock } from '../../utils/uiAudio'
import Button from '../../components/ui/Button'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'

export default function WinScreen({ winnerName, reason }) {
  const navigate = useNavigate()
  const { players } = useRoomStore()
  const clearRoom = useRoomStore(s => s.clearRoom)
  const { socketId, name: myName } = usePlayerStore()

  const [requestingReplay, setRequestingReplay] = useState(false)

  const me = players.find(
    (p) => p.socket_id === socketId || (myName && p.name.toLowerCase() === myName.toLowerCase())
  )
  const isHost = me?.is_host ?? false

  useEffect(() => {
    if (winnerName) {
      playWarmChime()
      try {
        confetti({
          particleCount: 110,
          spread: 68,
          origin: { y: 0.6 },
          colors: ['#e07a22', '#f59e0b', '#10b981', '#f2ece1', '#d9482b'],
        })
      } catch {
        // Safe fallback if canvas confetti unavailable
      }
    }
  }, [winnerName])

  function handlePlayAgain() {
    playKeyThock(200)
    setRequestingReplay(true)
    socket.emit(EVENTS.PLAY_AGAIN, {})
  }

  function goHome() {
    playKeyThock(150)
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  return (
    <motion.div
      className="fixed inset-0 bg-[#090a0d]/82 flex items-center justify-center z-[999] backdrop-blur-[4px] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="relative chassis-card p-8 text-center max-w-sm w-full rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.75)]"
        initial={{ scale: 0.9, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} w-2 h-2 rounded-full bg-[#242935] border border-white/[0.08] pointer-events-none`}
          />
        ))}

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl recessed-well flex items-center justify-center text-[#e07a22]">
          {winnerName ? <Trophy className="w-8 h-8" /> : <Handshake className="w-8 h-8 text-[#8a919e]" />}
        </div>

        <span className="inline-block text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded bg-[#0c0e13] border border-white/[0.07] text-[#e07a22] mb-2">
          Match Complete
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f2ece1] mb-1.5 tracking-tight">
          {winnerName ? `${winnerName} Wins!` : "It's a Draw!"}
        </h1>

        {reason && reason !== 'normal' && (
          <p className="text-[#8a919e] font-mono text-xs mb-4 capitalize">{reason}</p>
        )}

        <div className="flex flex-col gap-2.5 justify-center mt-6">
          {isHost ? (
            <Button
              variant="primary"
              loading={requestingReplay}
              onClick={handlePlayAgain}
              silent
              className="w-full py-3 font-mono text-xs uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl recessed-well text-xs font-mono text-[#8a919e]">
              <Clock className="w-3.5 h-3.5 text-[#e07a22] animate-spin" />
              <span>Waiting for Host rematch...</span>
            </div>
          )}

          <Button variant="secondary" onClick={goHome} silent className="w-full font-mono text-xs uppercase tracking-wider">
            <Home className="w-4 h-4 text-[#8a919e]" />
            <span>Go Home</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
