/**
 * FILE: frontend/src/games/ludo/LudoBoard.jsx
 * PURPOSE: SVG-based standard 15x15 Ludo board renderer.
 *          Renders yards, tracks, safe stars, home columns, and center triangles.
 *
 * PROPS:
 *   children: pieces or overlays rendered on top of the board
 */

import { SAFE_SQUARES, BOARD_PATH } from './constants'

export default function LudoBoard({ children }) {
  return (
    <div className="relative ludo-board-container mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <svg
        viewBox="0 0 15 15"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect x="0" y="0" width="15" height="15" fill="#0f172a" />

        {/* --- Yards (6x6 corners) --- */}
        {/* Red Yard (Top-Left) */}
        <rect x="0" y="0" width="6" height="6" fill="#ef4444" />
        <rect x="1" y="1" width="4" height="4" fill="#ffffff" rx="0.5" />
        <circle cx="2" cy="2" r="0.6" fill="#ef4444" />
        <circle cx="4" cy="2" r="0.6" fill="#ef4444" />
        <circle cx="2" cy="4" r="0.6" fill="#ef4444" />
        <circle cx="4" cy="4" r="0.6" fill="#ef4444" />

        {/* Green Yard (Top-Right) */}
        <rect x="9" y="0" width="6" height="6" fill="#22c55e" />
        <rect x="10" y="1" width="4" height="4" fill="#ffffff" rx="0.5" />
        <circle cx="11" cy="2" r="0.6" fill="#22c55e" />
        <circle cx="13" cy="2" r="0.6" fill="#22c55e" />
        <circle cx="11" cy="4" r="0.6" fill="#22c55e" />
        <circle cx="13" cy="4" r="0.6" fill="#22c55e" />

        {/* Yellow Yard (Bottom-Right) */}
        <rect x="9" y="9" width="6" height="6" fill="#eab308" />
        <rect x="10" y="10" width="4" height="4" fill="#ffffff" rx="0.5" />
        <circle cx="11" cy="11" r="0.6" fill="#eab308" />
        <circle cx="13" cy="11" r="0.6" fill="#eab308" />
        <circle cx="11" cy="13" r="0.6" fill="#eab308" />
        <circle cx="13" cy="13" r="0.6" fill="#eab308" />

        {/* Blue Yard (Bottom-Left) */}
        <rect x="0" y="9" width="6" height="6" fill="#3b82f6" />
        <rect x="1" y="10" width="4" height="4" fill="#ffffff" rx="0.5" />
        <circle cx="2" cy="11" r="0.6" fill="#3b82f6" />
        <circle cx="4" cy="11" r="0.6" fill="#3b82f6" />
        <circle cx="2" cy="13" r="0.6" fill="#3b82f6" />
        <circle cx="4" cy="13" r="0.6" fill="#3b82f6" />

        {/* --- Outer Track Grid Cells --- */}
        {BOARD_PATH.map((cell, idx) => {
          const isSafe = SAFE_SQUARES.includes(idx)
          let cellFill = '#1e293b'
          if (idx === 0) cellFill = '#ef4444' // Red start
          else if (idx === 13) cellFill = '#22c55e' // Green start
          else if (idx === 26) cellFill = '#eab308' // Yellow start
          else if (idx === 39) cellFill = '#3b82f6' // Blue start

          return (
            <g key={`track-${idx}`}>
              <rect
                x={cell.col}
                y={cell.row}
                width="1"
                height="1"
                fill={cellFill}
                stroke="#334155"
                strokeWidth="0.04"
              />
              {isSafe && idx !== 0 && idx !== 13 && idx !== 26 && idx !== 39 && (
                <text
                  x={cell.col + 0.5}
                  y={cell.row + 0.7}
                  fontSize="0.5"
                  textAnchor="middle"
                  fill="#f59e0b"
                >
                  ⭐
                </text>
              )}
            </g>
          )
        })}

        {/* --- Home Columns (5 per color) --- */}
        {/* Red Home column */}
        {[1, 2, 3, 4, 5].map(c => (
          <rect key={`rh-${c}`} x={c} y="7" width="1" height="1" fill="#ef4444" stroke="#334155" strokeWidth="0.04" />
        ))}
        {/* Green Home column */}
        {[1, 2, 3, 4, 5].map(r => (
          <rect key={`gh-${r}`} x="7" y={r} width="1" height="1" fill="#22c55e" stroke="#334155" strokeWidth="0.04" />
        ))}
        {/* Yellow Home column */}
        {[9, 10, 11, 12, 13].map(c => (
          <rect key={`yh-${c}`} x={c} y="7" width="1" height="1" fill="#eab308" stroke="#334155" strokeWidth="0.04" />
        ))}
        {/* Blue Home column */}
        {[9, 10, 11, 12, 13].map(r => (
          <rect key={`bh-${r}`} x="7" y={r} width="1" height="1" fill="#3b82f6" stroke="#334155" strokeWidth="0.04" />
        ))}

        {/* --- Center Finish Triangles (Center 6,6 to 8,8) --- */}
        <polygon points="6,6 9,6 7.5,7.5" fill="#22c55e" />
        <polygon points="9,6 9,9 7.5,7.5" fill="#eab308" />
        <polygon points="9,9 6,9 7.5,7.5" fill="#3b82f6" />
        <polygon points="6,9 6,6 7.5,7.5" fill="#ef4444" />
      </svg>

      {/* Layer for animated pieces */}
      <div className="absolute inset-0 pointer-events-auto">
        {children}
      </div>
    </div>
  )
}
