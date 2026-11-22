/**
 * FILE: frontend/src/components/ui/Toast.jsx
 * PURPOSE: Slide-up notification toast for transient messages.
 *          Auto-dismisses after 3 seconds. Animated with Framer Motion.
 *
 * USAGE PATTERN:
 *   This component is typically managed by a toast manager hook or context.
 *   Render it at the app root (e.g., in GameLayout or HomePage) and trigger
 *   it via a callback.
 *
 *   Example in a component:
 *     const [toast, setToast] = useState(null)
 *     // show: setToast({ message: 'Room not found', type: 'error' })
 *     <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
 *
 * PROPS:
 *   message : string — the text to display
 *   type    : "error" | "success" | "info"  (default: "info")
 *   onDone  : function — called after auto-dismiss (3s) so parent can clear state
 *
 * POSITION: fixed bottom-right corner, z-index 100
 *
 * ANIMATION:
 *   Slides up from below (y: 20 → 0), fades in; fades out on exit.
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const TYPE_STYLES = {
  error:   'bg-red-900/90 border-red-500/50 text-red-100',
  success: 'bg-green-900/90 border-green-500/50 text-green-100',
  info:    'bg-slate-800/90 border-white/10 text-slate-100',
}

export default function Toast({ message, type = 'info', onDone }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onDone?.(), 3000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={clsx(
            'fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl border shadow-2xl max-w-sm',
            TYPE_STYLES[type]
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
