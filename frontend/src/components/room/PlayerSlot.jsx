/**
 * FILE: frontend/src/components/room/PlayerSlot.jsx
 * PURPOSE: Hardware bay player row in the non-Bingo room lobby roster.
 */

import { Crown, CheckCircle2, UserX } from 'lucide-react'
import Avatar from '../ui/Avatar'

export default function PlayerSlot({ player, index, isMe }) {
  if (!player) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-white/[0.08] text-[#8a919e] bg-[#0c0e13]/60">
        <div className="w-8 h-8 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-xs font-mono">
          +
        </div>
        <span className="text-xs font-mono italic">Open player bay...</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all border ${
        isMe
          ? 'bg-[#1f2430] border-[#e07a22]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-[#12151c] border-white/[0.07]'
      }`}
    >
      <Avatar name={player.name} index={player.color_index} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs text-[#f2ece1] truncate font-mono">
            {player.name}
          </span>
          {isMe && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e07a22]/20 text-amber-300 font-mono font-bold uppercase">
              You
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {player.is_host && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
            <Crown className="w-3 h-3" />
            <span>Host</span>
          </span>
        )}
        {player.is_ready && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </span>
        )}
        {!player.is_connected && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#d9482b]/15 border border-[#d9482b]/35 text-red-300 text-[10px] font-mono font-bold uppercase">
            <UserX className="w-3 h-3" />
            <span>Away</span>
          </span>
        )}
      </div>
    </div>
  )
}
