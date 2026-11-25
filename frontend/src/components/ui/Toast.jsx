/**
 * FILE: frontend/src/components/ui/Toast.jsx
 * PURPOSE: Tactile hardware status toast notification with LED indicator.
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const TYPE_STYLES = {
  error:   'bg-[#171a21] border-[#d9482b]/60 text-[#fde8e4]',
  success: 'bg-[#171a21] border-[#10b981]/50 text-[#ecfdf5]',
  info:    'bg-[#171a21] border-[#e07a22]/50 text-[#f2ece1]',
}

const DOT_STYLES = {
  error:   'bg-[#d9482b] shadow-[0_0_8px_rgba(217,72,43,0.8)]',
  success: 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]',
  info:    'bg-[#e07a22] shadow-[0_0_8px_rgba(224,122,34,0.8)]',
}

export default function Toast({ message, type = 'info', onDone }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onDone?.(), 3000)
    return () => clearTimeout(t)
  }, [message, onDone])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={clsx(
            'fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl border shadow-[0_14px_34px_rgba(0,0,0,0.65)] max-w-sm flex items-center gap-2.5 text-xs font-mono',
            TYPE_STYLES[type] || TYPE_STYLES.info
          )}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        >
          <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', DOT_STYLES[type] || DOT_STYLES.info)} />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
