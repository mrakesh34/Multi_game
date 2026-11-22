/**
 * FILE: frontend/src/games/chess/MoveHistory.jsx
 * PURPOSE: Scrollable notation history of all chess moves played in the game.
 *
 * PROPS:
 *   history: array of UCI strings (e.g. ['e2e4', 'e7e5', 'g1f3', ...])
 */

import { useRef, useEffect } from 'react'

export default function MoveHistory({ history = [] }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  // Group into pairs (white, black)
  const rounds = []
  for (let i = 0; i < history.length; i += 2) {
    rounds.push({
      round: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || '',
    })
  }

  return (
    <div className="glass-card p-3 flex flex-col h-48 w-full">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Move History</h4>
      <div className="overflow-y-auto flex-1 font-mono text-xs flex flex-col gap-1 pr-1">
        {rounds.length === 0 ? (
          <span className="text-slate-600 italic">No moves played</span>
        ) : (
          rounds.map(r => (
            <div key={r.round} className="flex justify-between py-0.5 border-b border-white/5">
              <span className="text-slate-500 w-8">{r.round}.</span>
              <span className="text-slate-200 flex-1">{r.white}</span>
              <span className="text-slate-400 flex-1">{r.black}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
