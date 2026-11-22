/**
 * FILE: frontend/src/games/uno/gameLogic.js
 * PURPOSE: Client-side validation for card playability and card sorting helpers.
 */

export function isPlayable(card, discardTop, activeColor) {
  if (!card || !discardTop) return false
  if (card.type === 'wild' || card.type === 'wild_draw_four') return true
  if (card.color === activeColor) return true
  if (card.type === 'number' && discardTop.type === 'number' && card.value === discardTop.value) return true
  if (card.type !== 'number' && card.type === discardTop.type) return true
  return false
}

export function sortHand(cards = []) {
  const colorOrder = { red: 0, green: 1, blue: 2, yellow: 3, wild: 4 }
  return [...cards].sort((a, b) => {
    if (colorOrder[a.color] !== colorOrder[b.color]) {
      return colorOrder[a.color] - colorOrder[b.color]
    }
    const valA = a.value ?? 99
    const valB = b.value ?? 99
    return valA - valB
  })
}
