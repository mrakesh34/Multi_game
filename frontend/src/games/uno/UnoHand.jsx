/**
 * FILE: frontend/src/games/uno/UnoHand.jsx
 * PURPOSE: Fan layout of player's hand cards with smooth spring positioning.
 */

import { sortHand, isPlayable } from './gameLogic'
import UnoCard from './UnoCard'

export default function UnoHand({
  cards = [],
  discardTop,
  activeColor,
  isMyTurn,
  onPlayCard,
}) {
  const sorted = sortHand(cards)
  const count = sorted.length
  const maxSpread = Math.min(count * 6.5, 42)
  const stepAngle = count > 1 ? (maxSpread * 2) / (count - 1) : 0

  return (
    <div className="relative flex justify-center items-end h-44 w-full select-none overflow-x-auto py-3 px-4">
      <div className="flex items-center justify-center -space-x-6 sm:-space-x-5">
        {sorted.map((card, i) => {
          const rotation = count > 1 ? -maxSpread + i * stepAngle : 0
          const canPlay = isMyTurn && isPlayable(card, discardTop, activeColor)

          return (
            <div
              key={card.id}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'bottom center',
                zIndex: i,
              }}
              className="transition-transform duration-200 hover:z-40"
            >
              <UnoCard
                card={card}
                isPlayable={canPlay}
                onClick={() => onPlayCard(card)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
