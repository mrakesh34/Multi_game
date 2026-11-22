/**
 * FILE: frontend/src/games/bingo/NumberCallPopup.jsx
 * PURPOSE: Smooth floating announcement for newly called numbers.
 *          Positioned at the top of the viewport so it NEVER covers the 5x5 board.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Radio, X } from 'lucide-react'

export default function NumberCallPopup({ announcement, onDismiss }) {
  if (!announcement) return null

  const { number, callerName } = announcement

  return (
    <AnimatePresence>
      <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center w-full max-w-sm px-4">
        <motion.div
          key={number}
          initial={{ opacity: 0, y: -25, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={onDismiss}
          className="pointer-events-auto flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-zinc-950/85 border border-blue-500/40 shadow-2xl shadow-blue-900/30 backdrop-blur-xl cursor-pointer group"
          title="Click to dismiss"
        >
          {/* Animated pulsing dot / signal icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex-shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>

          {/* Caller information */}
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider font-mono">
              Number Called
            </span>
            <span className="text-xs font-medium text-zinc-200 truncate">
              {callerName ? `${callerName} picked` : 'Just called'}
            </span>
          </div>

          {/* Prominent Number Badge */}
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white font-mono font-black text-xl shadow-lg shadow-blue-500/40 border border-blue-300/40 flex-shrink-0"
          >
            {number}
          </motion.div>

          {/* Subtle Dismiss button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
