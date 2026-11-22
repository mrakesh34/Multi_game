/**
 * FILE: frontend/src/components/chat/ChatDrawer.jsx
 * PURPOSE: Transparent, floating overlay chat panel.
 *          Does NOT cause layout shifts or resize the game board when open or closed.
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
          className="pointer-events-auto absolute right-4 top-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/15 text-zinc-200 hover:text-white shadow-2xl backdrop-blur-xl transition-all text-xs font-semibold group active:scale-95"
          onClick={() => setOpen(true)}
          title="Open room chat"
        >
          <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>Chat</span>
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-mono font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Transparent Drawer Panel (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="pointer-events-auto w-80 sm:w-88 h-full bg-black/40 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            {/* Transparent Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white text-xs tracking-tight">Room Chat</span>
                <span className="text-[10px] text-zinc-400 font-mono">({messages.length})</span>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body (Transparent) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin bg-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 my-auto">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2">
                    <MessageSquare className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="text-xs font-medium text-zinc-300">No messages yet.</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Say hello to the room!</p>
                </div>
              ) : (
                messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
              )}
              <div ref={bottomRef} />
            </div>

            {/* Transparent Input Footer */}
            <ChatInput />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
