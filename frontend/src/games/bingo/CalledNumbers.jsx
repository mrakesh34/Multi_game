/**
 * FILE: frontend/src/games/bingo/CalledNumbers.jsx
 * PURPOSE: Displays horizontal history strip of called numbers (1 to 25).
 *
 * PROPS:
 *   numbers: array of called numbers in order
 */

import { useRef, useEffect } from 'react'

export default function CalledNumbers({ numbers = [] }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [numbers])

  return (
    <div className="w-full glass-card p-2.5 flex items-center gap-3 overflow-hidden max-w-2xl">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex-shrink-0">
        Called ({numbers.length}):
      </span>
      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
        {numbers.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No numbers called yet</span>
        ) : (
          numbers.map((num, i) => (
            <div
              key={i}
              className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold bg-blue-600 text-white shadow-sm flex-shrink-0"
            >
              {num}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
