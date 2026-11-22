/**
 * FILE: frontend/src/games/uno/UnoPlayerStatus.jsx
 * PURPOSE: Shows other opponents' hand card counts, avatars, and "UNO!" alerts.
 *
 * PROPS:
 *   players: array of player state objects
 *   currentIdx: active player index
 */

import Avatar from '../../components/ui/Avatar'

export default function UnoPlayerStatus({ players = [], currentIdx }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
      {players.map((p, idx) => {
        const isCurrent = idx === currentIdx
        const hasUno = p.hand_count === 1

        return (
          <div
            key={p.name}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isCurrent ? 'bg-blue-600/20 border border-blue-500/50 scale-105' : 'glass-card'
            }`}
          >
            <Avatar name={p.name} index={idx} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{p.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {p.hand_count} {p.hand_count === 1 ? 'card' : 'cards'}
              </span>
            </div>
            {hasUno && (
              <span className="bg-red-600 text-white font-game font-black text-xs px-2 py-0.5 rounded-full animate-bounce">
                UNO!
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
