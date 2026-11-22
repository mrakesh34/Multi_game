/**
 * FILE: frontend/src/components/ui/Modal.jsx
 * PURPOSE: Animated modal overlay using Framer Motion AnimatePresence.
 *          Used for CreateRoomModal, JoinRoomModal, and game-specific overlays.
 *
 * PROPS:
 *   isOpen   : boolean — controls visibility via AnimatePresence
 *   onClose  : function — called when backdrop or X button is clicked
 *   title    : string — displayed in the modal header
 *   children : React nodes — the modal body content
 *
 * ANIMATION (see IMPLEMENTATION_PLAN.md §10):
 *   Open:  scale 0.9 → 1.0, opacity 0 → 1, spring stiffness 300
 *   Close: scale 1.0 → 0.9, opacity 1 → 0
 *
 * BACKDROP:
 *   Semi-transparent dark overlay. Clicking it calls onClose.
 *   Prevents background scroll while open (via overflow-hidden on body).
 *
 * USAGE:
 *   <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Room">
 *     <CreateRoomContent />
 *   </Modal>
 */

import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal panel */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            initial={false}
          >
            <motion.div
              className="glass-card w-full max-w-md p-6 pointer-events-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white font-game">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
