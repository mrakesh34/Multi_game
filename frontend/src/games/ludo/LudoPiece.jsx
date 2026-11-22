/**
 * FILE: frontend/src/games/ludo/LudoPiece.jsx
 * PURPOSE: Animated token on the Ludo board rendered with Framer Motion.
 *
 * PROPS:
 *   pieceId     : number (0..3)
 *   colorIndex  : number (0=Red, 1=Green, 2=Yellow, 3=Blue)
 *   coords      : { row, col } (grid coordinates on 15x15 board)
 *   isSelectable: boolean (true if this piece has a valid move with current dice)
 *   onClick     : function callback when piece is clicked
 */

import { motion } from 'framer-motion'
import { COLOR_HEX, COLORS } from './constants'

export default function LudoPiece({ pieceId, colorIndex, coords, isSelectable, onClick }) {
  const colorName = COLORS[colorIndex]
  const hex = COLOR_HEX[colorName] || '#ffffff'

  // Convert 15x15 grid coordinates to percentages (each square is 100/15 %)
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
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="absolute flex items-center justify-center cursor-pointer select-none z-20"
      style={{
        width: `${sizePct}%`,
        height: `${sizePct}%`,
      }}
      onClick={isSelectable ? onClick : undefined}
    >
      <div
        className={`w-4/5 h-4/5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform ${
          isSelectable ? 'animate-bounce ring-4 ring-yellow-300 scale-110 z-30' : ''
        }`}
        style={{ backgroundColor: hex }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      </div>
    </motion.div>
  )
}
