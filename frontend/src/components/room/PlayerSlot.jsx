/**
 * FILE: frontend/src/components/room/PlayerSlot.jsx
 * PURPOSE: Renders a single player entry in the room lobby player list.
 *          Shows avatar, name, host badge, ready badge, and connection status.
 *          Empty slots (when room isn't full) show a "Waiting..." placeholder.
 *
 * PROPS:
 *   player   : Player object from server, or null if this slot is empty
 *   index    : slot index (0 = first player = host)
 *   isMe     : boolean — true if this player is the local user (highlights row)
 *
 * PLAYER OBJECT SHAPE:
 *   { socket_id, name, slot, is_host, is_ready, is_connected, color_index }
 *
 * USAGE:
 *   {slots.map((player, i) => (
 *     <PlayerSlot key={i} player={player} index={i} isMe={player?.socket_id === mySocketId} />
 *   ))}
 */

import Avatar from '../ui/Avatar'
import Badge  from '../ui/Badge'

export default function PlayerSlot({ player, index, isMe }) {
  if (!player) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/10">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-slate-600 text-lg">➕</div>
        <span className="text-slate-600 italic">Waiting for player...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isMe ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5 border border-white/5'}`}>
      <Avatar name={player.name} index={player.color_index} size="md" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{player.name}</span>
          {isMe && <span className="text-xs text-blue-400 font-medium">(you)</span>}
        </div>
      </div>
      <div className="flex gap-2">
        {player.is_host  && <Badge variant="host" />}
        {player.is_ready && <Badge variant="ready" />}
        {!player.is_connected && <Badge variant="disconnected" />}
      </div>
    </div>
  )
}
