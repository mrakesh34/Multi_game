/**
 * FILE: frontend/src/games/uno/UnoDiscardPile.jsx
 * PURPOSE: Renders the active top card of the UNO discard pile with active color indicator.
 *
 * PROPS:
 *   topCard     : Card object
 *   activeColor : string ('red' | 'green' | 'blue' | 'yellow')
 */

import UnoCard from './UnoCard'
import { CARD_COLORS } from './constants'

export default function UnoDiscardPile({ topCard, activeColor }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Shadow card underneath */}
        <div className="absolute inset-0 bg-slate-800 rounded-xl transform rotate-6 border border-white/10" />
        <UnoCard card={topCard} isPlayable={false} />
      </div>

      {/* Active Color indicator (especially useful when Wild is played) */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card border border-white/20">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: CARD_COLORS[activeColor] || '#fff' }}
        />
        <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
          {activeColor}
        </span>
      </div>
    </div>
  )
}
