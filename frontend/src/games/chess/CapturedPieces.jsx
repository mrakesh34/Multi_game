/**
 * FILE: frontend/src/games/chess/CapturedPieces.jsx
 * PURPOSE: Displays list of captured chess pieces for each side.
 *
 * PROPS:
 *   whiteCaptures: array of piece symbols ['P', 'N', ...]
 *   blackCaptures: array of piece symbols
 */

const SYMBOLS = {
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔',
}

export default function CapturedPieces({ whiteCaptures = [], blackCaptures = [] }) {
  return (
    <div className="flex flex-col gap-2 glass-card p-3 w-full">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold w-16">White took:</span>
        <div className="flex flex-wrap gap-1 text-lg text-slate-200">
          {whiteCaptures.map((sym, i) => (
            <span key={i}>{SYMBOLS[sym] || sym}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold w-16">Black took:</span>
        <div className="flex flex-wrap gap-1 text-lg text-slate-400">
          {blackCaptures.map((sym, i) => (
            <span key={i}>{SYMBOLS[sym] || sym}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
