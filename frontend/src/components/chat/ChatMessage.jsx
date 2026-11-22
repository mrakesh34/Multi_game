/**
 * FILE: frontend/src/components/chat/ChatMessage.jsx
 * PURPOSE: Transparent glass chat bubble with smooth spring animation.
 */

import { motion } from 'framer-motion'
import { usePlayerStore } from '../../store'
import Avatar from '../ui/Avatar'

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts * 1000)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message }) {
  const { from_name, text, timestamp } = message
  const myName = usePlayerStore((s) => s.name)
  const isMe = myName && from_name?.toLowerCase() === myName.toLowerCase()

  const colorIndex = (from_name?.charCodeAt(0) || 0) % 6

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 26 }}
      className={`flex flex-col gap-1 w-full ${isMe ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isMe && <Avatar name={from_name} index={colorIndex} size="xs" />}
        <span className={`text-[11px] font-semibold ${isMe ? 'text-blue-400' : 'text-zinc-300'}`}>
          {isMe ? 'You' : from_name}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">{formatTime(timestamp)}</span>
      </div>

      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm backdrop-blur-md ${
          isMe
            ? 'bg-blue-600/30 border border-blue-400/40 text-white rounded-tr-sm'
            : 'bg-white/[0.08] border border-white/15 text-zinc-100 rounded-tl-sm'
        }`}
      >
        {text}
      </div>
    </motion.div>
  )
}
