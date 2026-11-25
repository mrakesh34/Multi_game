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
    <div className="pt-1.5 bg-transparent">
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#111318]/55 border border-white/[0.08] backdrop-blur-md">
        <input
          className="flex-1 bg-transparent px-2.5 py-1.5 text-xs font-mono text-[#e2e8f0] placeholder-zinc-500 focus:outline-none"
          placeholder="Message..."
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          type="button"
          className="p-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-[#111318] transition-colors disabled:opacity-30 disabled:hover:bg-amber-500/80 flex items-center justify-center flex-shrink-0 cursor-pointer"
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
