/**
 * FILE: frontend/src/games/bingo/BingoCard.jsx
 * PURPOSE: Minimal, high-contrast 5×5 Bingo card component.
 */

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function BingoCard({
  card,
  marked,
  winningCoords = new Set(),
  isMyTurn = false,
  onCellClick,
  isMini = false,
  playerName,
}) {
  if (!card) return null

  return (
    <div
      className={`relative flex flex-col bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden ${
        isMini ? 'p-3 max-w-[200px]' : 'p-4 sm:p-5 max-w-md w-full'
      }`}
    >
      {playerName && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
          <span className="text-xs font-semibold text-zinc-300 truncate font-mono">
            {playerName}'s Card
          </span>
          {isMyTurn && !isMini && (
            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
              Your Turn to Call
            </span>
          )}
        </div>
      )}

      {/* 5×5 Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 flex-1">
        {card.map((row, r) =>
          row.map((val, c) => {
            const isMarked = marked?.[r]?.[c]
            const isWinCell = winningCoords.has?.(`${r}-${c}`)
            const canClick = !isMini && isMyTurn && !isMarked

            return (
              <motion.button
                key={`${r}-${c}`}
                type="button"
                disabled={!canClick}
                whileHover={canClick ? { scale: 1.06, y: -1 } : {}}
                whileTap={canClick ? { scale: 0.94 } : {}}
                onClick={() => canClick && onCellClick?.(val)}
                className={`relative aspect-square flex items-center justify-center rounded-xl font-mono font-bold transition-all select-none border ${
                  isMini
                    ? 'text-[11px] h-8'
                    : 'text-base sm:text-xl h-12 sm:h-14'
                } ${
                  isWinCell
                    ? 'bg-amber-500/20 border-amber-500/70 text-amber-300 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/20'
                    : isMarked
                    ? 'bg-zinc-950/60 border-zinc-800/40 text-zinc-600 line-through opacity-70'
                    : canClick
                    ? 'bg-zinc-800/90 hover:bg-zinc-750 border-blue-500/40 hover:border-blue-400 text-white cursor-pointer shadow-sm hover:shadow-blue-500/20 ring-1 ring-blue-500/20'
                    : 'bg-zinc-950/70 border-zinc-800/60 text-zinc-300 cursor-default'
                }`}
              >
                <span>{val}</span>

                {/* Strikethrough diagonal indicator for marked cell */}
                {isMarked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[80%] h-[1.5px] bg-red-500/60 transform -rotate-45" />
                  </div>
                )}

                {/* Subdued checkmark for completed winning cells */}
                {isWinCell && (
                  <div className="absolute top-1 right-1 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 block" />
                  </div>
                )}
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}
