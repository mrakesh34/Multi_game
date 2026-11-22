/**
 * FILE: frontend/src/components/room/RoomCode.jsx
 * PURPOSE: Displays the 3-digit room code prominently with a copy button.
 *          This component is shown in RoomLobby for sharing.
 *
 * PROPS:
 *   roomId : string — 3-digit room code, e.g. "742"
 *
 * DISPLAY (see IMPLEMENTATION_PLAN.md §9.6):
 *   Each digit in its own box with large monospace font and glow on hover.
 *   [Copy] button copies the code to the clipboard.
 *
 * USAGE:
 *   <RoomCode roomId="742" />
 */

import { useState } from 'react'
import { getRoomDigits } from '../../utils/roomCode'

export default function RoomCode({ roomId }) {
  const [copied, setCopied] = useState(false)
  const digits = getRoomDigits(roomId)

  function handleCopy() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="text-center">
      <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest">Room Code</p>
      <div className="flex gap-3 justify-center mb-3">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-16 h-16 flex items-center justify-center rounded-xl bg-white/5 border border-white/20 font-mono text-4xl font-bold text-white hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            {d}
          </div>
        ))}
      </div>
      <button
        onClick={handleCopy}
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        {copied ? '✓ Copied!' : 'Copy Code'}
      </button>
    </div>
  )
}
