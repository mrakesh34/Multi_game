/**
 * FILE: frontend/src/games/_shared/ScorePanel.jsx
 * PURPOSE: Hardware roster panel showing players, scores, and live turn LED.
 */

import Avatar from '../../components/ui/Avatar'

export default function ScorePanel({ players = [], scores = {}, currentName }) {
  return (
    <div className="chassis-card flex flex-col gap-2.5 p-4">
      <h3 className="text-[11px] font-mono font-bold text-[#8a919e] uppercase tracking-widest">
        Players
      </h3>
      {players.map(p => {
        const isCurrent = p.name === currentName
        return (
          <div
            key={p.socket_id}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
              isCurrent
                ? 'bg-[#1f2430] border-emerald-500/35'
                : 'bg-[#0c0e13]/70 border-white/[0.05]'
            }`}
          >
            <Avatar name={p.name} index={p.color_index} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-[#f2ece1] truncate">{p.name}</p>
              {scores[p.name] !== undefined && (
                <p className="text-[11px] text-[#8a919e] font-mono">{scores[p.name]} pts</p>
              )}
            </div>
            {!p.is_connected && <span className="w-2 h-2 rounded-full bg-[#d9482b]" title="Away" />}
            {isCurrent && <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />}
          </div>
        )
      })}
    </div>
  )
}
