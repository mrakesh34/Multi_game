/**
 * FILE: frontend/src/games/uno/UnoDiscardPile.jsx
 * PURPOSE: Renders the active top card of the UNO discard pile with slap-in spring animation.
 */

import { motion, AnimatePresence } from 'framer-motion'
import UnoCard from './UnoCard'
import { CARD_COLORS } from './constants'

export default function UnoDiscardPile({ topCard, activeColor }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative">
        {/* Stacked card underneath */}
        <div className="absolute inset-0 bg-[#171a21] rounded-[14px] transform rotate-6 border border-white/[0.12]" />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={topCard?.id || `${topCard?.color}-${topCard?.type}-${topCard?.value}`}
            initial={{ y: 26, scale: 1.12, rotate: -12, opacity: 0.7 }}
            animate={{ y: 0, scale: 1, rotate: -3, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26 }}
          >
            <UnoCard card={topCard} isPlayable={false} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Active Color LED Pill */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg recessed-well">
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/25"
          style={{ backgroundColor: CARD_COLORS[activeColor] || '#f5efe6' }}
        />
        <span className="text-[11px] font-mono uppercase font-bold text-[#f2ece1] tracking-wider">
          {activeColor}
        </span>
      </div>
    </div>
  )
}
