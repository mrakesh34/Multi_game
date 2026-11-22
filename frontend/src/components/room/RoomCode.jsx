/**
 * FILE: frontend/src/components/room/RoomCode.jsx
 * PURPOSE: Minimal, crisp 3-digit room code display with copy feedback.
 */

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { getRoomDigits } from '../../utils/roomCode'

export default function RoomCode({ roomId }) {
  const [copied, setCopied] = useState(false)
  const digits = getRoomDigits(roomId)

  function handleCopy() {
    navigator.clipboard?.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
        Invite Code
      </span>

      <div className="flex gap-2.5 justify-center mb-3">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-3xl sm:text-4xl font-black text-white shadow-inner"
          >
            {d}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy Code</span>
          </>
        )}
      </button>
    </div>
  )
}
