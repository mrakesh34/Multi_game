/**
 * FILE: frontend/src/games/bingo/NumberBall.jsx
 * PURPOSE: Animated ball dropping from top to reveal the newly called number.
 *
 * PROPS:
 *   number: number | null (1 to 75)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { getColumnForNumber, COLUMN_COLORS } from './constants'

export default function NumberBall({ number }) {
  if (!number) return null
  const colLetter = getColumnForNumber(number)
  const bg = COLUMN_COLORS[colLetter] || '#3b82f6'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={number}
        className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-4 border-white/80"
        style={{ backgroundColor: bg }}
        initial={{ y: -100, scale: 0.2, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      >
        <span className="text-xs font-bold uppercase tracking-widest opacity-90">{colLetter}</span>
        <span className="text-3xl font-mono font-black">{number}</span>
      </motion.div>
    </AnimatePresence>
  )
}
