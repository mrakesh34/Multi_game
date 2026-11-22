/**
 * FILE: frontend/src/games/_shared/ScorePanel.jsx
 * PURPOSE: Sidebar showing all players with their current scores/status.
 *          Rendered in the right area of the game layout (or above the chat).
 *
 * PROPS:
 *   players     : array of player objects from roomStore
 *   scores      : object { [name]: score }  — optional, game-specific
 *   currentName : string — name of the player whose turn it is (highlighted)
 *
 * USAGE:
 *   <ScorePanel players={players} scores={{ BlueFox: 2, RedTiger: 0 }} currentName="BlueFox" />
 *
 * NOTE:
 *   For games without explicit scores (Chess), pass scores={} and the panel
 *   just shows player names and connection status.
 */

import Avatar from '../../components/ui/Avatar'

export default function ScorePanel({ players = [], scores = {}, currentName }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Players</h3>
      {players.map(p => (
        <div
          key={p.socket_id}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
            p.name === currentName ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/3'
          }`}
        >
          <Avatar name={p.name} index={p.color_index} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{p.name}</p>
            {scores[p.name] !== undefined && (
              <p className="text-xs text-slate-400 font-mono">{scores[p.name]} pts</p>
            )}
          </div>
          {!p.is_connected && <span className="text-xs text-red-400">●</span>}
          {p.name === currentName && <span className="text-xs text-green-400">▶</span>}
        </div>
      ))}
    </div>
  )
}
