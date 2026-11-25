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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-0.5 w-full ${isMe ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isMe && <Avatar name={from_name} index={colorIndex} size="sm" />}
        <span className={`text-[10px] font-mono font-semibold ${isMe ? 'text-amber-300/90' : 'text-zinc-300/90'}`}>
          {isMe ? 'You' : from_name}
        </span>
        <span className="text-[9px] text-zinc-500 font-mono">{formatTime(timestamp)}</span>
      </div>

      <div
        className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-xs leading-relaxed break-words backdrop-blur-[4px] ${
          isMe
            ? 'bg-amber-500/15 border border-amber-400/25 text-[#fffbeb] rounded-tr-sm'
            : 'bg-[#171a21]/60 border border-white/[0.08] text-zinc-100 rounded-tl-sm'
        }`}
      >
        {text}
      </div>
    </motion.div>
  )
}
