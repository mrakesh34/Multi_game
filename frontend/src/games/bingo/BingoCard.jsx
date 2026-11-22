/**
 * FILE: frontend/src/games/bingo/BingoCard.jsx
 * PURPOSE: Renders a player's 5×5 Bingo card (numbers 1 to 25).
 *          Clicking an uncrossed number on your turn calls/picks that number!
 *
 * PROPS:
 *   card         : 5x5 array of numbers 1..25
 *   marked       : 5x5 array of booleans
 *   winningCoords: Set of string keys "r-c" indicating cells in completed lines
 *   isMyTurn     : boolean (whether local player can click uncrossed numbers)
 *   onCellClick  : function(number) callback when an uncrossed cell is clicked
 *   isMini       : boolean (for preview cards of opponents)
 *   playerName   : string
 */

import { motion } from 'framer-motion'
import clsx from 'clsx'

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
    <div className={clsx('glass-card p-4 rounded-2xl flex flex-col', isMini ? 'max-w-[190px]' : 'max-w-md w-full')}>
      {playerName && (
        <h4 className="text-xs font-semibold text-slate-300 mb-2 truncate text-center">
          {playerName}'s Card
        </h4>
      )}

      {/* 5×5 Cell Grid */}
      <div className="grid grid-cols-5 gap-2 flex-1">
        {card.map((row, r) =>
          row.map((val, c) => {
            const isMarked = marked?.[r]?.[c]
            const isWinCell = winningCoords.has?.(`${r}-${c}`)
            const canClick = !isMini && isMyTurn && !isMarked

            return (
              <motion.div
                key={`${r}-${c}`}
                className={clsx(
                  'bingo-cell rounded-xl font-mono font-bold transition-all relative overflow-hidden select-none border',
                  isMini ? 'text-[11px] p-1 h-8' : 'text-lg sm:text-xl h-14',
                  isWinCell
                    ? 'bg-yellow-400 text-slate-950 font-black ring-2 ring-yellow-200 shadow-lg shadow-yellow-500/50 border-yellow-300'
                    : isMarked
                    ? 'bg-slate-800 text-slate-500 line-through border-white/5 opacity-80'
                    : canClick
                    ? 'bg-blue-600/20 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 border-blue-400/50'
                    : 'bg-white/5 text-slate-200 border-white/10 cursor-default'
                )}
                whileHover={canClick ? { scale: 1.08 } : {}}
                whileTap={canClick ? { scale: 0.95 } : {}}
                onClick={() => canClick && onCellClick?.(val)}
              >
                <span>{val}</span>

                {/* Strikethrough diagonal slash on marked numbers */}
                {isMarked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-0.5 bg-red-500 transform -rotate-45" />
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
