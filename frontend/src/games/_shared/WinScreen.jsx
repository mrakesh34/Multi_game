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

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useRoomStore } from '../../store'
import Button from '../../components/ui/Button'

export default function WinScreen({ winnerName, reason }) {
  const navigate  = useNavigate()
  const clearRoom = useRoomStore(s => s.clearRoom)

  useEffect(() => {
    if (winnerName) {
      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } })
    }
  }, [])

  function goHome() {
    clearRoom()
    navigate('/')
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass-card p-10 text-center max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-6xl mb-4">{winnerName ? '🎉' : '🤝'}</div>
        <h1 className="font-game text-4xl font-black text-white mb-2">
          {winnerName ? `${winnerName} Wins!` : "It's a Draw!"}
        </h1>
        {reason && reason !== 'normal' && (
          <p className="text-slate-400 text-sm mb-6 capitalize">{reason}</p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="ghost" onClick={goHome}>Go Home</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
