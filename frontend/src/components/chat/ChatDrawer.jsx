/**
 * FILE: frontend/src/components/chat/ChatDrawer.jsx
 * PURPOSE: Lightweight, transparent floating chat overlay blended into the background.
 *          No opaque sidebar box; uses internal scrollTop only so opening never shakes the screen.
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'
import { useChatStore } from '../../store'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function ChatDrawer() {
  const { messages, isOpen, setOpen, markRead } = useChatStore()
  const scrollContainerRef = useRef(null)

  // Scroll ONLY the internal overlay message list (never call scrollIntoView, which shifts parent viewports)
  useEffect(() => {
    if (!isOpen) return
    markRead()
    const el = scrollContainerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isOpen, markRead])

  return (
    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 pointer-events-none flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-[min(310px,calc(100vw-24px))] max-h-[min(340px,52dvh)] flex flex-col bg-transparent"
          >
            {/* Minimal floating control pill (no heavy sidebar header box) */}
            <div className="flex items-center justify-end gap-2 px-1 pb-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#111318]/55 backdrop-blur-sm border border-white/[0.06] text-[10px] font-mono text-zinc-400">
                <MessageSquare className="w-3 h-3 text-amber-400/85" />
                <span>Chat ({messages.length})</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-0.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Hide chat overlay"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Transparent floating messages list fading softly at the top */}
            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-1 py-2 flex flex-col gap-2 scrollbar-none bg-transparent"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 14%, black 100%)',
              }}
            >
              {messages.length === 0 ? (
                <div className="py-4 px-2 text-right select-none">
                  <p className="text-[11px] font-mono text-zinc-500">
                    No messages yet — say hi to the room.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
              )}
            </div>

            {/* Compact transparent input bar */}
            <ChatInput />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
