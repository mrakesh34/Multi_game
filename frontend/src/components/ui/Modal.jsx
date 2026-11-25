/**
 * FILE: frontend/src/components/ui/Modal.jsx
 * PURPOSE: Machined hardware modal dialog using Framer Motion tactile spring.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { playKeyThock } from '../../utils/uiAudio'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#090a0d]/80 backdrop-blur-[4px] z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playKeyThock(135)
              onClose?.()
            }}
          />

          {/* Machined Chassis Panel */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              className="relative w-full max-w-md rounded-2xl bg-[#171a21] border border-white/[0.08] p-6 pointer-events-auto shadow-[0_24px_60px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.07)] overflow-hidden"
              initial={{ scale: 0.93, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 460, damping: 32 }}
            >
              {/* Subtle corner screws */}
              {['top-2.5 left-2.5', 'top-2.5 right-2.5', 'bottom-2.5 left-2.5', 'bottom-2.5 right-2.5'].map((pos) => (
                <span
                  key={pos}
                  className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-[#242935] border border-white/[0.08] pointer-events-none`}
                />
              ))}

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e07a22] shadow-[0_0_6px_rgba(224,122,34,0.7)]" />
                  <h2 className="text-sm sm:text-base font-bold text-[#f2ece1] tracking-tight font-mono uppercase">
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playKeyThock(140)
                    onClose?.()
                  }}
                  className="w-7 h-7 rounded-lg keycap-btn flex items-center justify-center text-zinc-400 hover:text-[#f2ece1] cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
