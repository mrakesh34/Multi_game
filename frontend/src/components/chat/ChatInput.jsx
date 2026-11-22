/**
 * FILE: frontend/src/components/chat/ChatInput.jsx
 * PURPOSE: Transparent, glassmorphic chat input bar for the overlay drawer.
 */

import { useState } from 'react'
import { Send } from 'lucide-react'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'

export default function ChatInput() {
  const [text, setText] = useState('')

  function send() {
    const trimmed = text.trim()
    if (!trimmed) return
    socket.emit(EVENTS.CHAT_MESSAGE, { text: trimmed })
    setText('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="border-t border-white/10 p-3 bg-white/[0.03] backdrop-blur-md">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all backdrop-blur-sm"
          placeholder="Send a message..."
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className="p-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white transition-all disabled:opacity-30 disabled:hover:bg-blue-600 shadow-sm active:scale-95 flex items-center justify-center flex-shrink-0"
          onClick={send}
          disabled={!text.trim()}
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
