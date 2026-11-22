/**
 * FILE: frontend/src/games/uno/UnoHand.jsx
 * PURPOSE: Fan layout of player's hand cards with rotation angle calculation.
 *
 * PROPS:
 *   cards       : array of Card objects
 *   discardTop  : current discard pile top Card
 *   activeColor : currently declared color
 *   isMyTurn    : boolean
 *   onPlayCard  : function(card)
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
  const maxSpread = Math.min(count * 8, 50)
  const stepAngle = count > 1 ? (maxSpread * 2) / (count - 1) : 0

  return (
    <div className="relative flex justify-center items-end h-44 w-full select-none overflow-x-auto py-2">
      <div className="flex items-center justify-center -space-x-8">
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
              className="transition-transform duration-200"
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
