/**
 * FILE: frontend/src/games/chess/ChessPiece.jsx
 * PURPOSE: Tactile chess piece using crisp Unicode typography and spring motion.
 */

import { motion } from 'framer-motion'
import { PIECE_UNICODE } from './constants'

export default function ChessPiece({ piece, isDraggable, onSelect }) {
  if (!piece) return null
  const key = `${piece.color}${piece.type.toUpperCase()}`
  const unicode = PIECE_UNICODE[key] || ''

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 480, damping: 30 }}
      className={`text-3xl sm:text-5xl leading-none font-normal select-none ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-110' : 'cursor-pointer'
      } ${
        piece.color === 'w'
          ? 'text-[#fffaf0] drop-shadow-[0_2px_3px_rgba(0,0,0,0.75)]'
          : 'text-[#14171f] drop-shadow-[0_1px_0_rgba(255,255,255,0.3)]'
      }`}
      drag={isDraggable}
      dragElastic={0.1}
      dragMomentum={false}
      whileHover={isDraggable ? { scale: 1.12 } : { scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      onClick={onSelect}
    >
      {unicode}
    </motion.div>
  )
}
