/**
 * FILE: frontend/src/components/chat/ChatDrawer.jsx
 * PURPOSE: Slide-in chat panel on the right side of the in-game layout.
 *          Contains the message list and input field.
 *
 * VISIBILITY:
 *   Controlled by useChatStore().isOpen.
 *   Toggle button in the GameLayout top bar (or inside this component).
 *   When closed: shows just a narrow toggle tab with unread count badge.
 *
 * ANIMATION (see IMPLEMENTATION_PLAN.md §10):
 *   Framer Motion: x: 320 → 0 on open, x: 0 → 320 on close, duration 0.3s ease-out.
 *   Width: 320px fixed.
 *
 * AUTO-SCROLL:
 *   The message list scrolls to the bottom whenever a new message is added.
 *   Implemented with a ref on the last message and scrollIntoView on effect.
 *
 * PROPS: none — reads from chatStore and roomStore directly
 *
 * USAGE:
 *   Rendered once inside GameLayout. Always mounted; visibility is animated.
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../../store'
import ChatMessage from './ChatMessage'
import ChatInput   from './ChatInput'

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
    <div className="relative flex-shrink-0">
      {/* Toggle tab */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-slate-800 border border-white/10 rounded-l-xl px-2 py-4 text-slate-400 hover:text-white transition-colors z-10"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="vertical-text text-xs">💬 Chat</span>
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="w-80 h-full border-l border-white/10 flex flex-col"
            style={{ background: 'var(--bg-secondary)' }}
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-semibold text-white text-sm">💬 Chat</span>
              <button className="text-slate-400 hover:text-white" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-slate-600 text-sm text-center mt-8">No messages yet. Say hi! 👋</p>
              )}
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <ChatInput />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
