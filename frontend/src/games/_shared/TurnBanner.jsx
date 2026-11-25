/**
 * FILE: frontend/src/games/_shared/TurnBanner.jsx
 * PURPOSE: Hardware LED turn status indicator pill matching TE-01 Tactile Console.
 */

import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function TurnBanner({ isMyTurn, playerName }) {
  return (
    <div className="flex justify-center py-2">
      <div
        className={clsx(
          'inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider shadow-[inset_0_2px_5px_rgba(0,0,0,0.55)]',
          isMyTurn
            ? 'bg-[#171a21] border-emerald-500/35 text-emerald-300'
            : 'bg-[#171a21] border-white/[0.07] text-[#8a919e]'
        )}
      >
        <motion.span
          className={clsx(
            'w-2.5 h-2.5 rounded-full flex-shrink-0',
            isMyTurn
              ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.85)]'
              : 'bg-zinc-600'
          )}
          animate={isMyTurn ? { scale: [1, 1.28, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, repeat: isMyTurn ? Infinity : 0, ease: 'easeInOut' }}
        />
        <span>{isMyTurn ? 'Your Turn — Make a Move' : `${playerName || 'Waiting'}'s Turn`}</span>
      </div>
    </div>
  )
}
