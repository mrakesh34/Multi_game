/**
 * FILE: frontend/src/games/bingo/RecentCallsTray.tsx
 * PURPOSE: Tactile recessed ball tray displaying recently called numbers.
 *          Features matte ceramic spheres, off-center diffuse lighting,
 *          soft contact shadows, and spring-based roll-in physics from the left.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TACTILE_SPRING } from './BingoTile'

export interface RecentCallsTrayProps {
  calledNumbers: number[]
  totalPossible?: number
}

export const RecentCallsTray: React.FC<RecentCallsTrayProps> = ({
  calledNumbers = [],
  totalPossible = 25,
}) => {
  // Take the last 5 called numbers, reversed so index 0 is newest (leftmost)
  const recentBalls = [...calledNumbers].slice(-5).reverse()
  const totalCalled = calledNumbers.length

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#171a21] border border-white/[0.05] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
      {/* Recessed Tray Header */}
      <div className="flex items-center gap-2 text-zinc-400 select-none flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(217,119,6,0.5)]" />
        <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-zinc-400">
          Ball Tray
        </span>
        <span
          className="text-xs font-mono font-bold text-zinc-300 ml-1 px-1.5 py-0.5 rounded bg-[#111318] border border-white/[0.04]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {totalCalled}/{totalPossible}
        </span>
      </div>

      {/* Recessed Rail Track holding the Ceramic Spheres */}
      <div className="flex items-center gap-2.5 min-h-[52px] px-2 py-1 overflow-x-auto scrollbar-none w-full sm:w-auto justify-center sm:justify-end">
        {recentBalls.length === 0 ? (
          <span className="text-xs font-mono text-zinc-500 italic select-none py-1">
            Tray empty. Awaiting first ball call...
          </span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {recentBalls.map((num, idx) => {
              const isLatest = idx === 0

              return (
                <motion.div
                  key={num}
                  layout
                  initial={{ x: -36, scale: 0.4, opacity: 0, rotate: -30 }}
                  animate={{
                    x: 0,
                    scale: isLatest ? 1 : 0.85,
                    opacity: isLatest ? 1 : 0.7,
                    rotate: 0,
                  }}
                  exit={{ x: 28, scale: 0.35, opacity: 0 }}
                  transition={TACTILE_SPRING}
                  className="relative flex items-center justify-center flex-shrink-0 select-none cursor-default group"
                  title={
                    isLatest
                      ? `Latest Call: #${num}`
                      : `Called ${idx} turns ago: #${num}`
                  }
                >
                  {/* Soft Diffused Contact Shadow Underneath (Grounding on Tray) */}
                  <div
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all ${isLatest
                      ? 'w-9 h-2 bg-black/60 blur-[2px]'
                      : 'w-7 h-1.5 bg-black/50 blur-[2px]'
                      }`}
                  />

                  {/* Matte Ceramic Sphere */}
                  <div
                    className={`rounded-full flex items-center justify-center font-mono font-bold transition-all relative overflow-hidden ${isLatest
                      ? 'w-11 h-11 sm:w-12 sm:h-12 text-sm sm:text-base border border-amber-400/40'
                      : 'w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm border border-white/[0.08]'
                      }`}
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      // Subtle off-center radial gradient (matte finish, no cheap plastic gloss)
                      background: isLatest
                        ? 'radial-gradient(circle at 35% 32%, #f59e0b 0%, #d97706 50%, #92400e 100%)'
                        : 'radial-gradient(circle at 35% 32%, #3a4254 0%, #262c38 60%, #1a1e28 100%)',
                      color: isLatest ? '#fffbeb' : '#e2e8f0',
                      boxShadow: isLatest
                        ? 'inset 0 1px 2px rgba(255,255,255,0.3), 0 4px 6px -1px rgba(0,0,0,0.6)'
                        : 'inset 0 1px 1px rgba(255,255,255,0.12), 0 3px 5px -1px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Inner concave diffuse lighting reflection */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                      }}
                    />

                    <span className="relative z-10">{num}</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default RecentCallsTray
