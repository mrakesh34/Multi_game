/**
 * FILE: frontend/src/games/bingo/BingoBoard.tsx
 * PURPOSE: Recessed chassis board (5×5) holding tactile PBT keycaps.
 *          Engineers domino wave physics, specular light-sweeps,
 *          machined hex screws, and localized low-velocity confetti.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react'
import confetti from 'canvas-confetti'
import BingoTile from './BingoTile'
import { getWinningLines, countCompletedLines } from './gameLogic'

export interface BingoBoardProps {
  card: number[][] // 5x5 numbers
  marked: boolean[][] // 5x5 booleans
  winningCoords?: Set<string>
  isMyTurn: boolean
  onTileClick?: (num: number) => void
  playerName?: string
  isMini?: boolean
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
  onLineComplete,
}) => {
  const prevLinesCountRef = useRef<number>(0)
  const [dominoTrigger, setDominoTrigger] = useState<number>(0)
  const [activeSweepCells, setActiveSweepCells] = useState<Map<string, number>>(new Map())

  // Calculate current completed lines
  const currentLinesCount = useMemo(() => {
    return countCompletedLines(marked)
  }, [marked])

  // Detect newly completed winning lines to trigger domino wave + sweep + confetti
  useEffect(() => {
    if (!marked || marked.length !== 5) return

    const prevCount = prevLinesCountRef.current
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

    prevLinesCountRef.current = currentLinesCount
  }, [currentLinesCount, marked, isMini, onLineComplete])

  if (!card || card.length !== 5) return null

  return (
    <div
      className={`relative select-none flex flex-col items-center mx-auto transition-all ${
        isMini ? 'max-w-[210px] w-full p-2.5' : 'w-full max-w-md sm:max-w-lg p-4 sm:p-6'
      }`}
    >
      {/* ── Recessed Board Chassis (Machined Tray) ── */}
      <div
        className="relative w-full rounded-3xl p-3.5 sm:p-5 flex flex-col gap-3"
        style={{
          backgroundColor: '#171a21',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Subtle Machined Corner Hex Screws (Teenage Engineering Hardware Touch) */}
        {!isMini && (
          <>
            <div
              className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full border border-white/[0.08]"
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
            <div
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-white/[0.08]"
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
            <div
              className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full border border-white/[0.08]"
              style={{
                background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
              }}
              title="M2 Mounting Screw"
            />
            <div
              className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full border border-white/[0.08]"
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
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/[0.05] px-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="text-xs font-mono font-semibold tracking-wide text-zinc-300 truncate">
                {playerName}
              </span>
            </div>

            {isMyTurn && !isMini && (
              <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Active Turn
              </span>
            )}
          </div>
        )}

        {/* 5×5 PBT Keycap Grid */}
        <div
          className="grid grid-cols-5 gap-2 sm:gap-2.5 w-full flex-1"
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
                  isClickable={isMyTurn && !isMini && !isMarked}
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
      </div>
    </div>
  )
}

export default BingoBoard
