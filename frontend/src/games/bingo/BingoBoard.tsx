/**
 * FILE: frontend/src/games/bingo/BingoBoard.tsx
 * PURPOSE: Recessed chassis board (5×5) holding tactile PBT keycaps.
 *          Engineers domino wave physics, specular light-sweeps,
 *          machined hex screws, and localized low-velocity confetti.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import BingoTile from './BingoTile'
import { getWinningLines, countCompletedLines } from './gameLogic'

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const
// Cell center coordinates in a 0..500 SVG viewBox accounting for ~2.2% grid gap
const GRID_CENTERS = [45.5, 147.75, 250, 352.25, 454.5] as const

export interface BingoBoardProps {
  card: number[][] // 5x5 numbers
  marked: boolean[][] // 5x5 booleans
  winningCoords?: Set<string>
  isMyTurn: boolean
  onTileClick?: (num: number) => void
  playerName?: string
  isMini?: boolean
  fullWidthMini?: boolean
  readonly?: boolean
  rank?: number | null
  isWinner?: boolean
  isSelf?: boolean
  roleVariant?: 'default' | 'self' | 'opponent'
  compactHeaderBadge?: boolean
  hasBingo?: boolean
  linesCount?: number
  showMiniHeaderLamps?: boolean
  onLineComplete?: () => void
}

export const BingoBoard: React.FC<BingoBoardProps> = ({
  card,
  marked,
  winningCoords = new Set(),
  isMyTurn,
  onTileClick,
  playerName,
  isMini = false,
  fullWidthMini = false,
  readonly = false,
  rank = null,
  isWinner = false,
  isSelf = false,
  roleVariant = 'default',
  compactHeaderBadge = false,
  hasBingo = false,
  linesCount,
  showMiniHeaderLamps = false,
  onLineComplete,
}) => {
  const prevLinesCountRef = useRef<number>(0)
  const [dominoTrigger, setDominoTrigger] = useState<number>(0)
  const [activeSweepCells, setActiveSweepCells] = useState<Map<string, number>>(new Map())

  // Calculate current completed lines and their coordinates for smooth SVG overlay
  const winningLines = useMemo(() => {
    return getWinningLines(marked)
  }, [marked])

  const currentLinesCount = winningLines.length

  const displayLinesCount = Math.max(linesCount ?? 0, currentLinesCount)

  // Detect newly completed winning lines to trigger domino wave + sweep + confetti
  useEffect(() => {
    if (!marked || marked.length !== 5) return

    const prevCount = prevLinesCountRef.current
    prevLinesCountRef.current = currentLinesCount

    if (currentLinesCount === 0) {
      setActiveSweepCells((prev) => (prev.size === 0 ? prev : new Map()))
      return
    }

    if (currentLinesCount > prevCount && !isMini) {
      // Fire localized, restrained low-velocity confetti burst
      try {
        confetti({
          particleCount: 35,
          gravity: 1.2,
          spread: 60,
          origin: { y: 0.62 },
          colors: ['#d97706', '#f59e0b', '#b45309', '#e2e8f0', '#78716c'],
          ticks: 140,
        })
      } catch {
        // Safe fallback if canvas-confetti environment restricts
      }

      // Audio notification callback
      onLineComplete?.()

      // Calculate the specific line that was just completed
      const allLines = getWinningLines(marked)
      const sweepMap = new Map<string, number>()
      allLines.forEach((line) => {
        line.forEach((pt, idx) => {
          sweepMap.set(`${pt.r}-${pt.c}`, idx * 0.05) // 50ms domino stagger
        })
      })

      setActiveSweepCells(sweepMap)
      setDominoTrigger((prev) => prev + 1)

      // Clear specular sweep active state after animation completes
      const timer = setTimeout(() => {
        setActiveSweepCells(new Map())
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentLinesCount, marked, isMini, onLineComplete])

  if (!card || card.length !== 5) return null

  return (
    <div
      className={`relative select-none flex flex-col items-center mx-auto w-full ${isMini
        ? fullWidthMini
          ? 'max-w-full p-0'
          : 'max-w-[210px] p-2'
        : 'max-w-[min(52dvh,440px)] p-1'
        }`}
    >
      {/* ── Recessed Board Chassis (Machined Tray) ── */}
      <div
        className={`relative w-full flex flex-col ${isMini
          ? 'rounded-2xl p-2.5 sm:p-3 gap-2'
          : 'rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 gap-2'
          }`}
        style={{
          backgroundColor:
            roleVariant === 'self'
              ? '#1c212b'
              : roleVariant === 'opponent'
                ? '#14171d'
                : '#171a21',
          backgroundImage:
            roleVariant === 'self'
              ? 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)'
              : isWinner
                ? 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 65%)'
                : undefined,
          boxShadow:
            roleVariant === 'self'
              ? 'inset 0 2px 6px rgba(0,0,0,0.55), 0 0 0 1px rgba(16, 185, 129, 0.34), 0 14px 28px -12px rgba(0,0,0,0.75)'
              : isWinner
                ? 'inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(245, 158, 11, 0.32), 0 10px 24px -10px rgba(217, 119, 6, 0.2)'
                : 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)',
          border:
            roleVariant === 'self'
              ? '1px solid rgba(16, 185, 129, 0.38)'
              : isWinner
                ? '1px solid rgba(245, 158, 11, 0.36)'
                : isSelf && isMini
                  ? '1px solid rgba(16, 185, 129, 0.28)'
                  : '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Subtle Machined Corner Hex Screws (Teenage Engineering Hardware Touch) */}
        {(!isMini || fullWidthMini) && (
          <>
            <div
              className={`absolute top-2 left-2 rounded-full border border-white/[0.08] ${isMini ? 'w-1.5 h-1.5' : 'w-2 h-2'
                }`}
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
            <div
              className={`absolute top-2 right-2 rounded-full border border-white/[0.08] ${isMini ? 'w-1.5 h-1.5' : 'w-2 h-2'
                }`}
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
            <div
              className={`absolute bottom-2 left-2 rounded-full border border-white/[0.08] ${isMini ? 'w-1.5 h-1.5' : 'w-2 h-2'
                }`}
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
            <div
              className={`absolute bottom-2 right-2 rounded-full border border-white/[0.08] ${isMini ? 'w-1.5 h-1.5' : 'w-2 h-2'
                }`}
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
          </>
        )}

        {/* Board Header / Player Tag */}
        {playerName && (
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-0.5 border-b border-white/[0.05] px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {rank ? (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${rank === 1
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                    : rank === 2
                      ? 'bg-slate-400/15 border-slate-400/30 text-slate-200'
                      : rank === 3
                        ? 'bg-orange-600/15 border-orange-500/30 text-orange-300'
                        : 'bg-zinc-800/80 border-white/[0.08] text-zinc-400'
                    }`}
                >
                  #{rank}
                </span>
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isWinner ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-zinc-400'
                    }`}
                />
              )}

              <span className="text-xs font-mono font-semibold tracking-wide text-zinc-200 truncate">
                {playerName}
              </span>

              {isSelf && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex-shrink-0">
                  YOU
                </span>
              )}
            </div>

            {isMyTurn && !isMini ? (
              <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
                Active Turn
              </span>
            ) : showMiniHeaderLamps ? (
              compactHeaderBadge ? (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${hasBingo
                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                    : 'bg-[#111318] border-white/[0.06] text-zinc-400'
                    }`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {hasBingo ? 'BINGO' : `${displayLinesCount}/5`}
                </span>
              ) : (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-[#111318] border border-white/[0.04]">
                    {BINGO_LETTERS.map((letter, idx) => {
                      const isLit = displayLinesCount > idx
                      return (
                        <span
                          key={letter}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] flex items-center justify-center font-mono font-bold text-[8px] sm:text-[9px] ${isLit
                            ? 'text-[#fffbeb] border border-amber-500/50'
                            : 'bg-[#171a21] text-zinc-600 border border-white/[0.04]'
                            }`}
                          style={
                            isLit
                              ? { background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)' }
                              : undefined
                          }
                        >
                          {letter}
                        </span>
                      )
                    })}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold ml-0.5 ${hasBingo ? 'text-amber-400' : 'text-zinc-400'
                      }`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {displayLinesCount}/5
                  </span>
                </div>
              )
            ) : null}
          </div>
        )}

        {/* 5×5 PBT Keycap Grid + Smooth Completed Line Overlay */}
        <div
          className={`relative w-full aspect-square ${roleVariant === 'opponent'
            ? isWinner
              ? 'brightness-[0.94] saturate-[0.94]'
              : 'brightness-[0.84] saturate-[0.86]'
            : ''
            }`}
        >
          <div
            className={`grid grid-cols-5 w-full h-full ${isMini ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2.5'
              }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {card.map((row, r) =>
              row.map((val, c) => {
                const cellKey = `${r}-${c}`
                const isMarked = !!marked?.[r]?.[c]
                const isWinning = winningCoords.has(cellKey)
                const sweepDelay = activeSweepCells.get(cellKey)
                const hasLightSweep = sweepDelay !== undefined

                return (
                  <BingoTile
                    key={cellKey}
                    value={val}
                    row={r}
                    col={c}
                    isMarked={isMarked}
                    isWinningCell={isWinning}
                    isClickable={isMyTurn && !isMini && !readonly && !isMarked}
                    readonly={readonly}
                    dominoWaveTrigger={dominoTrigger}
                    dominoDelay={sweepDelay ?? 0}
                    hasLightSweep={hasLightSweep}
                    onClick={onTileClick}
                    size={isMini ? 'mini' : 'normal'}
                  />
                )
              })
            )}
          </div>

          {/* Smooth, non-harsh SVG line drawn across each completed row, column, or diagonal */}
          {winningLines.length > 0 && (
            <svg
              viewBox="0 0 500 500"
              className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
              aria-hidden="true"
            >
              {winningLines.map((line, idx) => {
                const start = line[0]
                const end = line[line.length - 1]
                if (!start || !end) return null

                const sx = GRID_CENTERS[start.c]
                const sy = GRID_CENTERS[start.r]
                const ex = GRID_CENTERS[end.c]
                const ey = GRID_CENTERS[end.r]

                const dx = ex - sx
                const dy = ey - sy
                const len = Math.hypot(dx, dy) || 1
                const extend = 15
                const x1 = sx - (dx / len) * extend
                const y1 = sy - (dy / len) * extend
                const x2 = ex + (dx / len) * extend
                const y2 = ey + (dy / len) * extend

                const lineKey = `${start.r}-${start.c}_${end.r}-${end.c}`
                const animDelay = isMini ? 0.14 + idx * 0.09 : 0.04

                return (
                  <g key={lineKey}>
                    {/* Soft warm diffused halo */}
                    <motion.line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#fbbf24"
                      strokeOpacity={0.22}
                      strokeWidth={isMini ? 9 : 12}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: 0.48, delay: animDelay, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.2, delay: animDelay },
                      }}
                    />
                    {/* Satin luminous champagne-gold core (keeps digits legible) */}
                    <motion.line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#fef3c7"
                      strokeOpacity={0.56}
                      strokeWidth={isMini ? 3.2 : 4.2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: 0.48, delay: animDelay, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.18, delay: animDelay },
                      }}
                    />
                  </g>
                )
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default BingoBoard
