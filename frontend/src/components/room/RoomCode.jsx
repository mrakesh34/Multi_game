/**
 * FILE: frontend/src/components/room/RoomCode.jsx
 * PURPOSE: Tactile TE-01 keycap 3-digit room code display with copy feedback and audio.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Link as LinkIcon } from 'lucide-react'
import { getRoomDigits } from '../../utils/roomCode'
import { playKeyThock } from '../../utils/uiAudio'

export default function RoomCode({ roomId, game }) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const digits = getRoomDigits(roomId)

  function handleCopyCode() {
    playKeyThock(200)
    navigator.clipboard?.writeText(roomId).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  function handleCopyLink() {
    playKeyThock(210)
    const gamePath = game ? `${game}/room/${roomId}` : `room/${roomId}`
    const inviteUrl = `${window.location.origin}/${gamePath}`
    navigator.clipboard?.writeText(inviteUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  return (
    <div className="flex flex-col items-center text-center recessed-well rounded-2xl p-4">
      <span className="text-[10px] font-mono font-bold text-[#8a919e] uppercase tracking-[0.2em] mb-3">
        Room Code
      </span>

      {/* Keycap Code Digits */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-4">
        {digits.map((d, i) => (
          <motion.div
            key={`${i}-${d}`}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 28, delay: i * 0.04 }}
            className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center rounded-xl bg-[#202531] border border-white/[0.09] font-mono text-2xl sm:text-3xl font-black text-[#fffaf0] shadow-[0_4px_0_#0b0d12,inset_0_1px_0_rgba(255,255,255,0.14)]"
          >
            {d}
          </motion.div>
        ))}
      </div>

      {/* Copy Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleCopyCode}
          className="keycap-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold cursor-pointer"
          title="Copy Code"
        >
          {copiedCode ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[#10b981]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#8a919e]" />
              <span>Copy Code</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e07a22]/15 hover:bg-[#e07a22]/25 border border-[#e07a22]/40 text-xs font-mono font-semibold text-amber-200 transition-all active:translate-y-[1px] cursor-pointer"
          title="Copy Shareable Direct Link"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[#10b981]">Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5 text-[#e07a22]" />
              <span>Copy Invite Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
