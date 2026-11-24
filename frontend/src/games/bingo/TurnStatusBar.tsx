/**
 * FILE: frontend/src/games/bingo/TurnStatusBar.tsx
 * PURPOSE: Hardware-style LED turn status bar and B-I-N-G-O progress display.
 *          Features physical LED diodes, spring transitions, PBT reroll button,
 *          and mechanical tally lamps.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Shuffle, Volume2, VolumeX } from 'lucide-react'
import { TACTILE_SPRING } from './BingoTile'

export interface TurnStatusBarProps {
  isMyTurn: boolean
  callerName: string
  isFinished: boolean
  hasBingo: boolean
  linesCount: number
  canShuffle: boolean
  onShuffle?: () => void
  isMuted?: boolean
  onToggleMute?: () => void
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
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#171a21] border border-white/[0.05] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
      {/* ── Hardware LED Status Pill ── */}
      <motion.div
        layout
        transition={TACTILE_SPRING}
        className="flex items-center gap-3 w-full sm:w-auto"
      >
        {/* Recessed LED Bezel */}
        <div className="w-8 h-8 rounded-xl bg-[#12151c] border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] flex items-center justify-center flex-shrink-0">
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
            className={`w-3 h-3 rounded-full block transition-colors ${
              isFinished
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                : isMyTurn
                ? 'bg-[#059669] shadow-[0_0_8px_rgba(5,150,105,0.85)]'
                : 'bg-[#71717a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
            }`}
          />
        </div>

        {/* Status Callout */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono font-bold tracking-wider uppercase ${
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
                : "OPPONENT'S TURN"}
            </span>

            {/* Turn badge */}
            <span
              className="text-[10px] font-mono px-1.5 py-0.2 rounded border"
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

          <p className="text-xs sm:text-sm font-semibold text-[#e2e8f0] truncate mt-0.5 tracking-tight font-sans">
            {isFinished
              ? 'All 5 winning lines stamped!'
              : isMyTurn
              ? 'Select any uncrossed number on your card'
              : `Waiting for ${callerName || 'opponent'} to pick...`}
          </p>
        </div>
      </motion.div>

      {/* ── B-I-N-G-O Mechanical Indicator Lamps ── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111318] border border-white/[0.04]">
          {BINGO_LETTERS.map((letter, idx) => {
            const isUnlocked = linesCount > idx

            return (
              <motion.div
                key={letter}
                animate={
                  isUnlocked
                    ? {
                        scale: [1, 1.15, 1],
                        transition: { duration: 0.35, ease: 'easeOut' },
                      }
                    : { scale: 1 }
                }
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm select-none transition-all ${
                  isUnlocked
                    ? 'border border-amber-500/50 text-[#fffbeb] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_4px_rgba(0,0,0,0.5)]'
                    : 'bg-[#171a21] border border-white/[0.04] text-[#475569] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]'
                }`}
                style={
                  isUnlocked
                    ? {
                        background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                      }
                    : undefined
                }
              >
                {letter}
              </motion.div>
            )
          })}
        </div>

        {/* Numerical Tally */}
        <span
          className="text-xs font-mono font-bold text-zinc-400 select-none px-1"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {linesCount}/5
        </span>

        {/* Shuffling / Reroll PBT Keycap Button */}
        {canShuffle && onShuffle && (
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95, y: 2 }}
            transition={TACTILE_SPRING}
            onClick={onShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-[#e2e8f0] border border-white/[0.08] select-none cursor-pointer outline-none"
            style={{
              background: 'linear-gradient(180deg, #282e3d 0%, #202531 100%)',
              boxShadow: '0 3px 0 #12151c, 0 4px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
            title="Reroll card numbers before the game starts"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Reroll</span>
          </motion.button>
        )}

        {/* Audio Mute Mini Toggle (if onToggleMute passed) */}
        {onToggleMute && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92, y: 1 }}
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-[#12151c] hover:bg-[#1a1e28] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] cursor-pointer"
            title={isMuted ? 'Unmute procedural audio' : 'Mute procedural audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default TurnStatusBar
