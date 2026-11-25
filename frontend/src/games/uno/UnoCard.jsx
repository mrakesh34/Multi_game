/**
 * FILE: frontend/src/games/uno/UnoCard.jsx
 * PURPOSE: Matte cardstock UNO card with tactile spring lift and amber playable highlight.
 */

import { motion } from 'framer-motion'
import { CARD_COLORS, TYPE_SYMBOLS } from './constants'
import clsx from 'clsx'

export default function UnoCard({ card, isPlayable = false, onClick }) {
  if (!card) return null

  const isWild = card.color === 'wild'
  const bg = CARD_COLORS[card.color] || '#232834'
  const symbol = card.type === 'number' ? card.value : TYPE_SYMBOLS[card.type] || ''

  return (
    <motion.div
      className={clsx(
        'uno-card border-[2.5px] border-[#f5efe6] select-none transition-shadow',
        isWild && 'uno-wild-quadrants',
        isPlayable
          ? 'cursor-pointer ring-2 ring-[#e07a22] shadow-[0_10px_24px_rgba(224,122,34,0.28)]'
          : 'cursor-default opacity-80'
      )}
      style={{ backgroundColor: isWild ? undefined : bg }}
      whileHover={isPlayable ? { y: -16, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.94 } : {}}
      transition={{ type: 'spring', stiffness: 460, damping: 28 }}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* Center Bone Oval */}
      <div className="uno-card-center-oval shadow-inner">
        <span
          className="font-black text-3xl font-game transform -rotate-[24deg]"
          style={{ color: isWild ? '#171a21' : bg }}
        >
          {symbol}
        </span>
      </div>

      {/* Mini corner indices */}
      <span className="absolute top-1.5 left-2 font-mono font-bold text-xs text-[#fffaf0] drop-shadow-sm">
        {symbol}
      </span>
      <span className="absolute bottom-1.5 right-2 font-mono font-bold text-xs text-[#fffaf0] drop-shadow-sm transform rotate-180">
        {symbol}
      </span>
    </motion.div>
  )
}
