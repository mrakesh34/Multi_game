/**
 * FILE: frontend/src/games/uno/ColorPicker.jsx
 * PURPOSE: Modal overlay prompting player to pick a color after playing a Wild card.
 *
 * PROPS:
 *   isOpen : boolean
 *   onSelectColor: function('red'|'green'|'blue'|'yellow')
 */

import Modal from '../../components/ui/Modal'
import { CARD_COLORS } from './constants'

export default function ColorPicker({ isOpen, onSelectColor }) {
  const choices = ['red', 'green', 'blue', 'yellow']

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Choose Wild Color">
      <div className="grid grid-cols-2 gap-4 py-4">
        {choices.map(color => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className="h-20 rounded-xl font-game font-bold text-lg text-white shadow-lg uppercase tracking-wider transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: CARD_COLORS[color] }}
          >
            {color}
          </button>
        ))}
      </div>
    </Modal>
  )
}
