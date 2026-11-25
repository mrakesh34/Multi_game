/**
 * FILE: frontend/src/games/chess/CapturedPieces.jsx
 * PURPOSE: Hardware tray displaying captured chess pieces for each side.
 */

const SYMBOLS = {
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔',
}

export default function CapturedPieces({ whiteCaptures = [], blackCaptures = [] }) {
  return (
    <div className="flex flex-col gap-2 chassis-card p-3.5 w-full">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-[#8a919e] uppercase w-20 flex-shrink-0">White took</span>
        <div className="flex flex-wrap gap-1 text-lg text-[#f2ece1] min-h-[24px]">
          {whiteCaptures.length === 0 ? (
            <span className="text-xs font-mono text-zinc-600">—</span>
          ) : (
            whiteCaptures.map((sym, i) => <span key={i}>{SYMBOLS[sym] || sym}</span>)
          )}
        </div>
      </div>
      <div className="h-[1px] bg-white/[0.06]" />
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-[#8a919e] uppercase w-20 flex-shrink-0">Black took</span>
        <div className="flex flex-wrap gap-1 text-lg text-[#8a919e] min-h-[24px]">
          {blackCaptures.length === 0 ? (
            <span className="text-xs font-mono text-zinc-600">—</span>
          ) : (
            blackCaptures.map((sym, i) => <span key={i}>{SYMBOLS[sym] || sym}</span>)
          )}
        </div>
      </div>
    </div>
  )
}
