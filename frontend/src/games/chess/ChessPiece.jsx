/**
 * FILE: frontend/src/games/chess/ChessPiece.jsx
 * PURPOSE: Draggable and clickable chess piece using Unicode typography.
 *
 * PROPS:
 *   piece       : { type: 'p'|'n'|'b'|'r'|'q'|'k', color: 'w'|'b' }
 *   isDraggable : boolean
 *   onSelect    : function callback
 */

import { motion } from 'framer-motion'
import { PIECE_UNICODE } from './constants'

export default function ChessPiece({ piece, isDraggable, onSelect }) {
  if (!piece) return null
  const key = `${piece.color}${piece.type.toUpperCase()}`
  const unicode = PIECE_UNICODE[key] || ''

  return (
    <motion.div
      className={`text-4xl sm:text-5xl font-normal select-none ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-110' : 'cursor-default'
      } ${piece.color === 'w' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'}`}
      drag={isDraggable}
      dragElastic={0.1}
      dragMomentum={false}
      whileHover={isDraggable ? { scale: 1.15 } : {}}
      whileTap={isDraggable ? { scale: 0.95 } : {}}
      onClick={onSelect}
    >
      {unicode}
    </motion.div>
  )
}
