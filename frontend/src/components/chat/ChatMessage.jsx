/**
 * FILE: frontend/src/components/chat/ChatMessage.jsx
 * PURPOSE: Renders a single chat message row in the ChatDrawer message list.
 *
 * PROPS:
 *   message : ChatMessage object — { from_name: string, text: string, timestamp: number }
 *
 * DISPLAY:
 *   Avatar (initials) + sender name + relative timestamp (top row)
 *   Message text (below, slightly indented)
 *
 * RELATIVE TIMESTAMP:
 *   "just now" for < 60s, "2m ago" for 2 minutes, "1h ago" for 1 hour, etc.
 */

import Avatar from '../ui/Avatar'

function relativeTime(ts) {
  const diff = Math.floor((Date.now() / 1000) - ts)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function ChatMessage({ message }) {
  const { from_name, text, timestamp } = message
  // Use a simple hash of the name for a stable color index
  const colorIndex = from_name.charCodeAt(0) % 6

  return (
    <div className="flex gap-2">
      <Avatar name={from_name} index={colorIndex} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-300 truncate">{from_name}</span>
          <span className="text-xs text-slate-600 flex-shrink-0">{relativeTime(timestamp)}</span>
        </div>
        <p className="text-sm text-slate-200 mt-0.5 break-words">{text}</p>
      </div>
    </div>
  )
}
