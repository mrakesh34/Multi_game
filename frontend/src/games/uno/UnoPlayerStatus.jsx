/**
 * FILE: frontend/src/games/uno/UnoPlayerStatus.jsx
 * PURPOSE: Hardware opponent status pills with hand counts and UNO alert tags.
 */

import Avatar from '../../components/ui/Avatar'

export default function UnoPlayerStatus({ players = [], currentIdx }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
      {players.map((p, idx) => {
        const isCurrent = idx === currentIdx
        const hasUno = p.hand_count === 1

        return (
          <div
            key={p.name}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
              isCurrent
                ? 'bg-[#1f2430] border-[#e07a22]/55 shadow-[0_8px_18px_rgba(224,122,34,0.16)] scale-[1.03]'
                : 'chassis-card'
            }`}
          >
            <Avatar name={p.name} index={idx} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-[#f2ece1]">{p.name}</span>
              <span className="text-[10px] text-[#8a919e] font-mono">
                {p.hand_count} {p.hand_count === 1 ? 'card' : 'cards'}
              </span>
            </div>
            {hasUno && (
              <span className="bg-[#d9482b] text-[#fffaf0] font-mono font-black text-[10px] px-2 py-0.5 rounded-md border border-red-300/30 animate-bounce uppercase">
                UNO!
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
