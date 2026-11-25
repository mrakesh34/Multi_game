/**
 * FILE: frontend/src/games/ludo/LudoPiece.jsx
 * PURPOSE: Tactile spring-animated token on the Ludo board.
 */

import { motion } from 'framer-motion'
import { COLOR_HEX, COLORS } from './constants'

export default function LudoPiece({ pieceId, colorIndex, coords, isSelectable, onClick }) {
  const colorName = COLORS[colorIndex]
  const hex = COLOR_HEX[colorName] || '#f2ece1'

  const leftPct = (coords.col / 15) * 100
  const topPct = (coords.row / 15) * 100
  const sizePct = (1 / 15) * 100

  return (
    <motion.div
      layoutId={`piece-${colorIndex}-${pieceId}`}
      initial={false}
      animate={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="absolute flex items-center justify-center cursor-pointer select-none z-20"
      style={{
        width: `${sizePct}%`,
        height: `${sizePct}%`,
      }}
      onClick={isSelectable ? onClick : undefined}
    >
      <motion.div
        animate={isSelectable ? { y: [0, -4, 0], scale: [1.08, 1.18, 1.08] } : { y: 0, scale: 1 }}
        transition={isSelectable ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        className={`w-4/5 h-4/5 rounded-full border-2 border-[#fffaf0] shadow-[0_3px_6px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center ${
          isSelectable ? 'ring-2 ring-[#e07a22] z-30' : ''
        }`}
        style={{ backgroundColor: hex }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#fffaf0]/85" />
      </motion.div>
    </motion.div>
  )
}
