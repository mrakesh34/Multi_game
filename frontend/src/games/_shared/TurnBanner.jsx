/**
 * FILE: frontend/src/games/_shared/TurnBanner.jsx
 * PURPOSE: Shows whose turn it currently is at the top of the game board area.
 *          Pulses green when it's the local player's turn; muted otherwise.
 *
 * PROPS:
 *   isMyTurn    : boolean — true when the local player should act
 *   playerName  : string — the name of whoever's turn it is
 *
 * STYLING (see IMPLEMENTATION_PLAN.md §9.9):
 *   Your turn   → green glow + "🎯 Your Turn!" + pulse animation
 *   Other's turn → muted grey + "{name}'s turn..."
 *
 * USAGE:
 *   <TurnBanner isMyTurn={currentPlayer.socket_id === mySocketId} playerName={currentPlayer.name} />
 */

import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function TurnBanner({ isMyTurn, playerName }) {
  return (
    <div className="flex justify-center py-3">
      <motion.div
        className={clsx(
          'px-6 py-2 rounded-full font-semibold text-sm',
          isMyTurn
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-white/5 border border-white/10 text-slate-400'
        )}
        animate={isMyTurn ? { boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 8px rgba(34,197,94,0.15)', '0 0 0 0 rgba(34,197,94,0)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isMyTurn ? '🎯 Your Turn!' : `${playerName || 'Waiting'}\'s turn...`}
      </motion.div>
    </div>
  )
}
