/**
 * FILE: frontend/src/components/room/PlayerSlot.jsx
 * PURPOSE: Minimal, responsive player row in the room lobby player list.
 */

import { Crown, CheckCircle2, UserX } from 'lucide-react'
import Avatar from '../ui/Avatar'

export default function PlayerSlot({ player, index, isMe }) {
  if (!player) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-zinc-800 text-zinc-600 bg-zinc-950/30">
        <div className="w-8 h-8 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-xs">
          +
        </div>
        <span className="text-xs italic">Empty slot...</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all border ${
        isMe
          ? 'bg-blue-600/10 border-blue-500/30'
          : 'bg-zinc-950/60 border-zinc-800/80'
      }`}
    >
      <Avatar name={player.name} index={player.color_index} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-xs text-white truncate font-mono">
            {player.name}
          </span>
          {isMe && <span className="text-[10px] text-blue-400 font-sans font-medium">(you)</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {player.is_host && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
            <Crown className="w-3 h-3" />
            <span>Host</span>
          </span>
        )}
        {player.is_ready && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </span>
        )}
        {!player.is_connected && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold">
            <UserX className="w-3 h-3" />
            <span>Away</span>
          </span>
        )}
      </div>
    </div>
  )
}
