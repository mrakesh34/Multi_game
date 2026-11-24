/**
 * FILE: frontend/src/games/bingo/BingoTile.tsx
 * PURPOSE: PBT keycap Bingo tile engineered with layered CSS depth,
 *          tactile spring micro-interactions, and 100% legible marked numbers.
 *
 * ANTI-SLOP RULES HONORED:
 *   - No pure black (#000000) or pure white (#FFFFFF).
 *   - No linear CSS transitions for gameplay interactions.
 *   - No checkmarks, X's, or strikethroughs placed over numbers.
 *   - Recessed corner dot indicator for stamped/marked state.
 */

import React, { useMemo } from 'react'
import { motion, type Transition } from 'framer-motion'

export const TACTILE_SPRING: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
  mass: 0.8,
}

export interface BingoTileProps {
  value: number
  row: number
  col: number
  isMarked: boolean
  isWinningCell: boolean
  isClickable: boolean
  dominoWaveTrigger?: number // timestamp or counter to trigger domino wave
  dominoDelay?: number // staggered delay in seconds (e.g. idx * 0.05)
  hasLightSweep?: boolean
  onClick?: (val: number) => void
  disabled?: boolean
  size?: 'normal' | 'mini'
}

export const BingoTile: React.FC<BingoTileProps> = ({
  value,
  row,
  col,
  isMarked,
  isWinningCell,
  isClickable,
  dominoWaveTrigger = 0,
  dominoDelay = 0,
  hasLightSweep = false,
  onClick,
  disabled = false,
  size = 'normal',
}) => {
  const isMini = size === 'mini'

  // Dynamic animation target based on marked state and domino wave
  const animationVariants = useMemo(() => {
    if (dominoWaveTrigger > 0 && isWinningCell) {
      return {
        y: [isMarked ? 3 : 0, -6, isMarked ? 3 : 0],
        transition: {
          delay: dominoDelay,
          duration: 0.35,
          ease: [0.25, 1, 0.5, 1],
        },
      }
    }

    return {
      y: isMarked ? 3 : 0,
      transition: TACTILE_SPRING,
    }
  }, [isMarked, dominoWaveTrigger, dominoDelay, isWinningCell])

  // Keycap physical box-shadows matching mechanical keyboard specifications
  const keycapStyle = useMemo(() => {
    if (isMarked) {
      if (isWinningCell) {
        // Winning cell: warm amber-gold stamped inlay with subtle edge definition
        return {
          background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
          color: '#fffbeb',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        }
      }
      // Stamped marked state: flush / depressed with soft inset shadow
      return {
        background: 'linear-gradient(180deg, #b45309 0%, #92400e 100%)',
        color: '#fffbeb',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.38), 0 1px 0 rgba(255,255,255,0.08)',
        border: '1px solid rgba(217, 119, 6, 0.35)',
      }
    }

    // Resting unmarked PBT keycap
    return {
      background: 'linear-gradient(180deg, #282e3d 0%, #202531 100%)',
      color: '#e2e8f0',
      boxShadow: '0 5px 0 #12151c, 0 8px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.06)',
    }
  }, [isMarked, isWinningCell])

  return (
    <motion.button
      type="button"
      data-row={row}
      data-col={col}
      disabled={disabled || !isClickable || isMarked}
      animate={animationVariants}
      whileHover={
        isClickable && !isMarked
          ? {
              y: -1,
              boxShadow:
                '0 6px 0 #12151c, 0 10px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.12)',
              transition: TACTILE_SPRING,
            }
          : undefined
      }
      whileTap={
        isClickable && !isMarked
          ? {
              scale: 0.96,
              y: 4,
              boxShadow: '0 1px 0 #12151c, 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: { duration: 0.05 },
            }
          : undefined
      }
      onClick={() => {
        if (isClickable && !isMarked) {
          onClick?.(value)
        }
      }}
      className={`relative aspect-square flex items-center justify-center rounded-xl select-none outline-none overflow-hidden ${
        isMini ? 'h-8 sm:h-9 text-xs' : 'h-13 sm:h-16 w-full text-lg sm:text-2xl'
      } ${
        isClickable && !isMarked
          ? 'cursor-pointer'
          : isMarked
          ? 'cursor-default'
          : 'cursor-not-allowed opacity-90'
      }`}
      style={keycapStyle}
    >
      {/* Tabular digit representation (zero horizontal jitter, 100% legible) */}
      <span
        className="font-mono font-bold tracking-tight select-none pointer-events-none"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>

      {/* Recessed corner dot indicator for marked state (NO lines/checks over digits) */}
      {isMarked && (
        <span
          className={`absolute top-1.5 right-1.5 rounded-full pointer-events-none ${
            isMini ? 'w-1 h-1' : 'w-2 h-2'
          }`}
          style={{
            background: isWinningCell ? '#fef3c7' : '#78350f',
            boxShadow: isWinningCell
              ? '0 0 3px rgba(254, 243, 199, 0.9), inset 0 1px 1px rgba(0,0,0,0.2)'
              : 'inset 0 1px 2px rgba(0,0,0,0.7), 0 0.5px 0 rgba(255,255,255,0.15)',
          }}
          title={isWinningCell ? 'Winning Line Tile' : 'Marked Tile'}
        />
      )}

      {/* Specular Light-Sweep for newly completed rows/columns */}
      {hasLightSweep && (
        <motion.div
          initial={{ x: '-150%', opacity: 0 }}
          animate={{ x: '150%', opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.65, delay: dominoDelay, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.22) 50%, transparent 80%)',
          }}
        />
      )}

      {/* Subtle concave inner highlight rim */}
      {!isMarked && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.button>
  )
}

export default BingoTile
