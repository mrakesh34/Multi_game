/**
 * FILE: frontend/src/games/bingo/TurnStatusBar.tsx
 * PURPOSE: Unified hardware tabletop HUD combining LED Turn Status,
 *          mechanical B-I-N-G-O indicator lamps, and the 4-ball ceramic tray.
 *          Engineered with Teen-Engineering aesthetics, tactile spring animations,
 *          and zero clutter.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { TACTILE_SPRING } from './BingoTile'

export interface TurnStatusBarProps {
  isMyTurn: boolean
  callerName: string
  isFinished: boolean
  hasBingo: boolean
  linesCount: number
  canShuffle: boolean
  onShuffle?: () => void
  calledNumbers?: number[]
  totalPossible?: number
}

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const

export const TurnStatusBar: React.FC<TurnStatusBarProps> = ({
  isMyTurn,
  callerName,
  isFinished,
  hasBingo,
  linesCount,
  canShuffle,
  onShuffle,
  calledNumbers = [],
  totalPossible = 25,
}) => {
  // Exactly 4 recent balls, reversed so index 0 is newest (leftmost)
  const recentBalls = [...calledNumbers].slice(-4).reverse()
  const totalCalled = calledNumbers.length

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-2.5 p-3 sm:px-4 sm:py-3 rounded-2xl bg-[#171a21] border border-white/[0.05] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] select-none">
      {/* ── Top Strip: Turn Status (Left) & B-I-N-G-O Lamps + Reroll (Right) ── */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left: LED Bezel & Hardware Status Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#12151c] border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] flex items-center justify-center flex-shrink-0">
            <motion.span
              animate={
                isFinished
                  ? { scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }
                  : isMyTurn
                  ? { scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }
                  : { scale: 1, opacity: 0.55 }
              }
              transition={{
                duration: isFinished ? 1.4 : isMyTurn ? 1.6 : 0.2,
                repeat: isFinished || isMyTurn ? Infinity : 0,
                ease: 'easeInOut',
              }}
              className={`w-2.5 h-2.5 rounded-full block transition-colors ${
                isFinished
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : isMyTurn
                  ? 'bg-[#059669] shadow-[0_0_8px_rgba(5,150,105,0.85)]'
                  : 'bg-[#71717a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span
              className={`text-[11px] font-mono font-bold tracking-wider uppercase truncate ${
                isFinished
                  ? 'text-amber-400'
                  : isMyTurn
                  ? 'text-emerald-400'
                  : 'text-zinc-400'
                }`}
            >
              {isFinished
                ? hasBingo
                  ? 'BINGO ACHIEVED'
                  : 'ROUND FINISHED'
                : isMyTurn
                ? 'YOUR TURN'
                : callerName
                ? `${callerName}'S TURN`
                : "OPPONENT'S TURN"}
            </span>

            <span
              className="text-[10px] font-mono px-1.5 py-0.2 rounded border flex-shrink-0"
              style={{
                fontVariantNumeric: 'tabular-nums',
                backgroundColor: isMyTurn ? 'rgba(5, 150, 105, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: isMyTurn ? 'rgba(5, 150, 105, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                color: isMyTurn ? '#a7f3d0' : '#71717a',
              }}
            >
              {isMyTurn ? 'LIVE' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Right: B-I-N-G-O Indicator Keycaps, Tally & Optional Reroll */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl bg-[#111318] border border-white/[0.04]">
            {BINGO_LETTERS.map((letter, idx) => {
              const isUnlocked = linesCount > idx
              return (
                <motion.div
                  key={letter}
                  animate={
                    isUnlocked
                      ? { scale: [1, 1.15, 1], transition: { duration: 0.35, ease: 'easeOut' } }
                      : { scale: 1 }
                  }
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center font-mono font-bold text-xs select-none transition-all ${
                    isUnlocked
                      ? 'border border-amber-500/50 text-[#fffbeb] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_4px_rgba(0,0,0,0.5)]'
                      : 'bg-[#171a21] border border-white/[0.04] text-[#475569] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]'
                  }`}
                  style={
                    isUnlocked
                      ? { background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)' }
                      : undefined
                  }
                >
                  {letter}
                </motion.div>
              )
            })}
          </div>

          <span
            className="text-xs font-mono font-bold text-zinc-400 select-none px-0.5"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {linesCount}/5
          </span>

          {canShuffle && onShuffle && (
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95, y: 2 }}
              transition={TACTILE_SPRING}
              onClick={onShuffle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold text-[#e2e8f0] border border-white/[0.08] select-none cursor-pointer outline-none"
              style={{
                background: 'linear-gradient(180deg, #282e3d 0%, #202531 100%)',
                boxShadow: '0 2px 0 #12151c, 0 3px 5px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
              title="Reroll card numbers before the game starts"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>Reroll</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Hairline Divider ── */}
      <div className="h-[1px] bg-white/[0.04] w-full" />

      {/* ── Bottom Strip: Ball Tray Header & 4 Ceramic Spheres ── */}
      <div className="flex items-center justify-between gap-3 w-full min-h-[44px]">
        {/* Left: Tray Label + Progress Counter */}
        <div className="flex items-center gap-2 text-zinc-400 select-none flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(217,119,6,0.5)]" />
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-zinc-400">
            Ball Tray
          </span>
          <span
            className="text-[11px] font-mono font-bold text-zinc-300 ml-0.5 px-1.5 py-0.5 rounded bg-[#111318] border border-white/[0.04]"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {totalCalled}/{totalPossible}
          </span>
        </div>

        {/* Right: Max 4 Ceramic Spheres (Latest on left with amber highlight) */}
        <div className="flex items-center gap-2 px-1 overflow-x-auto scrollbar-none justify-end">
          {recentBalls.length === 0 ? (
            <span className="text-[11px] font-mono text-zinc-500 italic select-none py-1">
              Awaiting first ball call...
            </span>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {recentBalls.map((num, idx) => {
                const isLatest = idx === 0
                return (
                  <motion.div
                    key={num}
                    layout
                    initial={{ x: -28, scale: 0.4, opacity: 0, rotate: -30 }}
                    animate={{
                      x: 0,
                      scale: isLatest ? 1 : 0.85,
                      opacity: isLatest ? 1 : 0.7,
                      rotate: 0,
                    }}
                    exit={{ x: 24, scale: 0.35, opacity: 0 }}
                    transition={TACTILE_SPRING}
                    className="relative flex items-center justify-center flex-shrink-0 select-none cursor-default group"
                    title={isLatest ? `Latest Call: #${num}` : `Called ${idx} turns ago: #${num}`}
                  >
                    {/* Soft Diffused Contact Shadow */}
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all ${
                        isLatest ? 'w-8 h-1.5 bg-black/60 blur-[2px]' : 'w-6 h-1 bg-black/50 blur-[2px]'
                      }`}
                    />

                    {/* Matte Ceramic Sphere */}
                    <div
                      className={`rounded-full flex items-center justify-center font-mono font-bold transition-all relative overflow-hidden ${
                        isLatest
                          ? 'w-10 h-10 sm:w-11 sm:h-11 text-xs sm:text-sm border border-amber-400/40'
                          : 'w-8 h-8 sm:w-9 sm:h-9 text-[11px] sm:text-xs border border-white/[0.08]'
                      }`}
                      style={{
                        fontVariantNumeric: 'tabular-nums',
                        background: isLatest
                          ? 'radial-gradient(circle at 35% 32%, #f59e0b 0%, #d97706 50%, #92400e 100%)'
                          : 'radial-gradient(circle at 35% 32%, #3a4254 0%, #262c38 60%, #1a1e28 100%)',
                        color: isLatest ? '#fffbeb' : '#e2e8f0',
                        boxShadow: isLatest
                          ? 'inset 0 1px 2px rgba(255,255,255,0.3), 0 3px 5px -1px rgba(0,0,0,0.6)'
                          : 'inset 0 1px 1px rgba(255,255,255,0.12), 0 2px 4px -1px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Inner concave diffuse lighting reflection */}
                      <div
                        className="absolute -top-1 -left-1 w-3/5 h-3/5 rounded-full pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.35) 0%, transparent 70%)',
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
    </div>
  )
}

export default TurnStatusBar
