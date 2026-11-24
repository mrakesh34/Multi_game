/**
 * FILE: frontend/src/components/chat/ChatDrawer.jsx
 * PURPOSE: Tactile, collapsible side drawer for room chat.
 *          Clean dark-mode hardware aesthetic with zero heavy glassmorphism.
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'
import { useChatStore } from '../../store'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function ChatDrawer() {
  const { messages, isOpen, unreadCount, setOpen, markRead } = useChatStore()
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      markRead()
    }
  }, [messages, isOpen])

  return (
    <div className="absolute top-0 right-0 bottom-0 z-40 pointer-events-none flex justify-end">
      {/* Floating Toggle Tab when closed */}
      {!isOpen && (
        <button
          className="pointer-events-auto absolute right-4 top-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171a21] hover:bg-[#202531] border border-white/[0.08] text-[#e2e8f0] shadow-lg transition-colors text-xs font-mono font-medium group active:scale-95"
          onClick={() => setOpen(true)}
          title="Open room chat"
        >
          <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Chat</span>
          {unreadCount > 0 && (
            <span
              className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[#111318] text-[10px] font-mono font-bold"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Sleek Hardware Collapsible Drawer Panel (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="pointer-events-auto w-80 sm:w-88 h-full bg-[#171a21] border-l border-white/[0.06] shadow-2xl flex flex-col"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.8 }}
          >
            {/* Machined Hardware Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#13151b]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-[#e2e8f0] text-xs font-mono tracking-tight">Room Comm Channel</span>
                <span
                  className="text-[10px] text-zinc-400 font-mono"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  ({messages.length})
                </span>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                onClick={() => setOpen(false)}
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin bg-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 my-auto select-none">
                  <div className="w-10 h-10 rounded-2xl bg-[#12151c] border border-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center mb-2">
                    <MessageSquare className="w-5 h-5 text-zinc-500" />
                  </div>
                  <p className="text-xs font-medium text-zinc-300 font-mono">No transmissions logged.</p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Send a message to room players.</p>
                </div>
              ) : (
                messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Footer */}
            <ChatInput />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
