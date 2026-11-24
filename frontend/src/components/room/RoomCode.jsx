/**
 * FILE: frontend/src/components/room/RoomCode.jsx
 * PURPOSE: Minimal, crisp 3-digit room code display with copy feedback.
 */

import { useState } from 'react'
import { Copy, Check, Share2, Link as LinkIcon } from 'lucide-react'
import { getRoomDigits } from '../../utils/roomCode'

export default function RoomCode({ roomId, game }) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const digits = getRoomDigits(roomId)

  function handleCopyCode() {
    navigator.clipboard?.writeText(roomId).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  function handleCopyLink() {
    const gamePath = game ? `${game}/room/${roomId}` : `room/${roomId}`
    const inviteUrl = `${window.location.origin}/${gamePath}`
    navigator.clipboard?.writeText(inviteUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
        Room Code
      </span>

      {/* Code Digits Display */}
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-2xl sm:text-3xl font-black text-white shadow-inner"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Share / Copy Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
          title="Copy Code"
        >
          {copiedCode ? (
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

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:text-blue-200 transition-all shadow-sm active:scale-95"
          title="Copy Shareable Direct Link"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Copy Invite Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
