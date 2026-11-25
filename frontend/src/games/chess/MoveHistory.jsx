/**
 * FILE: frontend/src/games/chess/MoveHistory.jsx
 * PURPOSE: Scrollable notation log inside a recessed TE-01 hardware panel.
 */

import { useRef, useEffect } from 'react'

export default function MoveHistory({ history = [] }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const rounds = []
  for (let i = 0; i < history.length; i += 2) {
    rounds.push({
      round: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || '',
    })
  }

  return (
    <div className="chassis-card p-3.5 flex flex-col h-48 w-full">
      <h4 className="text-[11px] font-mono font-bold text-[#8a919e] uppercase tracking-widest mb-2">
        Move History
      </h4>
      <div className="recessed-well rounded-xl p-2.5 overflow-y-auto flex-1 font-mono text-xs flex flex-col gap-1">
        {rounds.length === 0 ? (
          <span className="text-zinc-600 italic">No moves played yet</span>
        ) : (
          rounds.map(r => (
            <div key={r.round} className="flex justify-between py-0.5 border-b border-white/[0.05] last:border-0">
              <span className="text-[#8a919e] w-8">{r.round}.</span>
              <span className="text-[#f2ece1] flex-1">{r.white}</span>
              <span className="text-amber-300/80 flex-1">{r.black}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
