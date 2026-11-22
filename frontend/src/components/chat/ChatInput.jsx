/**
 * FILE: frontend/src/components/chat/ChatInput.jsx
 * PURPOSE: Chat message text input at the bottom of the ChatDrawer.
 *
 * BEHAVIOR:
 *   - Controlled input, max 200 characters (enforced by maxLength + slice)
 *   - Pressing Enter sends the message (Shift+Enter = newline not supported)
 *   - Pressing the Send button sends the message
 *   - After sending: clears input field
 *   - Empty messages are not sent
 *
 * SOCKET EVENT:
 *   EMIT: chat_message → { text: string }
 *
 * USAGE:
 *   Rendered inside ChatDrawer at the bottom. No props needed.
 */

import { useState } from 'react'
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
    <div className="border-t border-white/10 p-3 flex gap-2">
      <input
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Say something..."
        value={text}
        maxLength={200}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
      />
      <button
        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-40"
        onClick={send}
        disabled={!text.trim()}
      >
        ↑
      </button>
    </div>
  )
}
