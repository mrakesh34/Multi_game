/**
 * FILE: frontend/src/components/ui/Modal.jsx
 * PURPOSE: Minimal animated modal overlay using Framer Motion AnimatePresence.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal panel */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 pointer-events-auto shadow-2xl overflow-hidden"
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
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
