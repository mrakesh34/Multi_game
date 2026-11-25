/**
 * FILE: frontend/src/games/uno/ColorPicker.jsx
 * PURPOSE: Hardware tactile color selector modal after playing a Wild card.
 */

import Modal from '../../components/ui/Modal'
import { CARD_COLORS } from './constants'
import { playKeyThock } from '../../utils/uiAudio'

export default function ColorPicker({ isOpen, onSelectColor }) {
  const choices = ['red', 'green', 'blue', 'yellow']

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Choose Wild Color">
      <div className="grid grid-cols-2 gap-3.5 py-2">
        {choices.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => {
              playKeyThock(210)
              onSelectColor(color)
            }}
            className="h-20 rounded-xl font-mono font-extrabold text-sm text-[#fffaf0] border-2 border-[#f5efe6]/70 shadow-[0_4px_0_rgba(0,0,0,0.45)] uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-[3px] cursor-pointer"
            style={{ backgroundColor: CARD_COLORS[color] }}
          >
            {color}
          </button>
        ))}
      </div>
    </Modal>
  )
}
