/**
 * FILE: frontend/src/games/bingo/CalledNumbers.jsx
 * PURPOSE: Renders the last 5 called numbers with progressive size scaling
 *          (large to small) and decreasing density/visibility.
 *          The most recent number is highlighted prominently.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Hash } from 'lucide-react'

// Configuration ladder for the 5 slots (from newest to oldest)
const SLOT_STYLES = [
  // Slot 0: Latest (Large, 100% density, highlighted)
  {
    dim: 'w-12 h-12 sm:w-14 sm:h-14',
    font: 'text-lg sm:text-xl font-black font-mono',
    opacity: 'opacity-100',
    containerClass:
      'bg-blue-600 text-white border-2 border-blue-400 ring-2 ring-blue-400/50 shadow-xl shadow-blue-600/40 z-20',
  },
  // Slot 1: 1 call ago (Medium-large, 80% density)
  {
    dim: 'w-10 h-10 sm:w-11 sm:h-11',
    font: 'text-sm sm:text-base font-bold font-mono',
    opacity: 'opacity-80',
    containerClass:
      'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-md z-10',
  },
  // Slot 2: 2 calls ago (Medium, 60% density)
  {
    dim: 'w-9 h-9 sm:w-9.5 sm:h-9.5',
    font: 'text-xs sm:text-sm font-semibold font-mono',
    opacity: 'opacity-60',
    containerClass:
      'bg-zinc-850 text-zinc-300 border border-zinc-750/70 z-5',
  },
  // Slot 3: 3 calls ago (Small, 40% density)
  {
    dim: 'w-8 h-8 sm:w-8.5 sm:h-8.5',
    font: 'text-[11px] sm:text-xs font-medium font-mono',
    opacity: 'opacity-40',
    containerClass:
      'bg-zinc-900 text-zinc-400 border border-zinc-800/60 z-0',
  },
  // Slot 4: 4 calls ago (Smallest, 25% density)
  {
    dim: 'w-7 h-7 sm:w-7.5 sm:h-7.5',
    font: 'text-[10px] sm:text-[11px] font-normal font-mono',
    opacity: 'opacity-25',
    containerClass:
      'bg-zinc-950 text-zinc-500 border border-zinc-900/50 z-0',
  },
]

export default function CalledNumbers({ numbers = [] }) {
  // Take strictly the last 5 numbers in reverse-chronological order (newest first)
  const lastFive = [...numbers].slice(-5).reverse()
  const totalCount = numbers.length

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider flex-shrink-0">
        <Hash className="w-3.5 h-3.5 text-blue-400" />
        <span>Recent Calls ({totalCount}/25):</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none min-h-[58px] px-1">
        {lastFive.length === 0 ? (
          <span className="text-xs text-zinc-500 italic py-2">
            No numbers called yet. Active caller picks first.
          </span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {lastFive.map((num, idx) => {
              const cfg = SLOT_STYLES[idx] || SLOT_STYLES[SLOT_STYLES.length - 1]
              const isLatest = idx === 0

              return (
                <motion.div
                  key={num}
                  layout
                  initial={{ scale: 0.3, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.2, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  className={`relative flex items-center justify-center rounded-2xl transition-all select-none ${cfg.dim} ${cfg.font} ${cfg.opacity} ${cfg.containerClass}`}
                  title={
                    isLatest
                      ? `Latest called: ${num}`
                      : `Called ${idx} turns ago: ${num}`
                  }
                >
                  {num}
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
