/**
 * FILE: frontend/src/games/uno/UnoCard.jsx
 * PURPOSE: Renders an individual UNO card with authentic styling, numbers/action symbols,
 *          and playable glowing indicators.
 *
 * PROPS:
 *   card      : { id, color, type, value }
 *   isPlayable: boolean
 *   onClick   : function callback
 */

import { motion } from 'framer-motion'
import { CARD_COLORS, TYPE_SYMBOLS } from './constants'
import clsx from 'clsx'

export default function UnoCard({ card, isPlayable = false, onClick }) {
  if (!card) return null

  const isWild = card.color === 'wild'
  const bg = CARD_COLORS[card.color] || '#333'
  const symbol = card.type === 'number' ? card.value : TYPE_SYMBOLS[card.type] || ''

  return (
    <motion.div
      className={clsx(
        'uno-card cursor-pointer border-2 border-white select-none transition-shadow',
        isWild && 'uno-wild-quadrants',
        isPlayable
          ? 'hover:-translate-y-4 hover:shadow-2xl hover:shadow-yellow-400/50 ring-2 ring-yellow-400'
          : 'opacity-70 hover:opacity-90'
      )}
      style={{ backgroundColor: isWild ? undefined : bg }}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* Center White Oval */}
      <div className="uno-card-center-oval shadow-inner">
        <span
          className="font-black text-3xl font-game transform -rotate-[25deg]"
          style={{ color: isWild ? '#1e1e2f' : bg }}
        >
          {symbol}
        </span>
      </div>

      {/* Mini corner indices */}
      <span className="absolute top-1 left-2 font-bold text-xs text-white">{symbol}</span>
      <span className="absolute bottom-1 right-2 font-bold text-xs text-white transform rotate-180">{symbol}</span>
    </motion.div>
  )
}
