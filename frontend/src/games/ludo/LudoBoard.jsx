/**
 * FILE: frontend/src/games/ludo/LudoBoard.jsx
 * PURPOSE: SVG-based 15x15 Ludo board rendered inside a TE-01 hardware chassis
 *          using warm anodized tabletop pigments (no neon blue/slate slop).
 */

import { SAFE_SQUARES, BOARD_PATH } from './constants'

export default function LudoBoard({ children }) {
  return (
    <div className="relative chassis-card p-2.5 sm:p-3.5 rounded-2xl mx-auto">
      <div className="relative ludo-board-container mx-auto bg-[#0c0e13] rounded-xl overflow-hidden recessed-well">
        <svg
          viewBox="0 0 15 15"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Recessed Track Surface */}
          <rect x="0" y="0" width="15" height="15" fill="#0d0f14" />

          {/* --- Yards (6x6 corners) --- */}
          {/* Red Yard (Top-Left) */}
          <rect x="0" y="0" width="6" height="6" fill="#d9482b" />
          <rect x="0.9" y="0.9" width="4.2" height="4.2" fill="#f5efe6" rx="0.55" />
          <circle cx="2" cy="2" r="0.58" fill="#d9482b" />
          <circle cx="4" cy="2" r="0.58" fill="#d9482b" />
          <circle cx="2" cy="4" r="0.58" fill="#d9482b" />
          <circle cx="4" cy="4" r="0.58" fill="#d9482b" />

          {/* Green Yard (Top-Right) */}
          <rect x="9" y="0" width="6" height="6" fill="#059669" />
          <rect x="9.9" y="0.9" width="4.2" height="4.2" fill="#f5efe6" rx="0.55" />
          <circle cx="11" cy="2" r="0.58" fill="#059669" />
          <circle cx="13" cy="2" r="0.58" fill="#059669" />
          <circle cx="11" cy="4" r="0.58" fill="#059669" />
          <circle cx="13" cy="4" r="0.58" fill="#059669" />

          {/* Yellow/Amber Yard (Bottom-Right) */}
          <rect x="9" y="9" width="6" height="6" fill="#d97706" />
          <rect x="9.9" y="9.9" width="4.2" height="4.2" fill="#f5efe6" rx="0.55" />
          <circle cx="11" cy="11" r="0.58" fill="#d97706" />
          <circle cx="13" cy="11" r="0.58" fill="#d97706" />
          <circle cx="11" cy="13" r="0.58" fill="#d97706" />
          <circle cx="13" cy="13" r="0.58" fill="#d97706" />

          {/* Slate-Cobalt Yard (Bottom-Left) */}
          <rect x="0" y="9" width="6" height="6" fill="#3b6e8c" />
          <rect x="0.9" y="9.9" width="4.2" height="4.2" fill="#f5efe6" rx="0.55" />
          <circle cx="2" cy="11" r="0.58" fill="#3b6e8c" />
          <circle cx="4" cy="11" r="0.58" fill="#3b6e8c" />
          <circle cx="2" cy="13" r="0.58" fill="#3b6e8c" />
          <circle cx="4" cy="13" r="0.58" fill="#3b6e8c" />

          {/* --- Outer Track Grid Cells --- */}
          {BOARD_PATH.map((cell, idx) => {
            const isSafe = SAFE_SQUARES.includes(idx)
            let cellFill = '#171a21'
            if (idx === 0) cellFill = '#d9482b'
            else if (idx === 13) cellFill = '#059669'
            else if (idx === 26) cellFill = '#d97706'
            else if (idx === 39) cellFill = '#3b6e8c'

            return (
              <g key={`track-${idx}`}>
                <rect
                  x={cell.col}
                  y={cell.row}
                  width="1"
                  height="1"
                  fill={cellFill}
                  stroke="#2a303d"
                  strokeWidth="0.045"
                />
                {isSafe && idx !== 0 && idx !== 13 && idx !== 26 && idx !== 39 && (
                  <text
                    x={cell.col + 0.5}
                    y={cell.row + 0.68}
                    fontSize="0.55"
                    textAnchor="middle"
                    fill="#e07a22"
                    fontWeight="bold"
                  >
                    ★
                  </text>
                )}
              </g>
            )
          })}

          {/* --- Home Columns (5 per color) --- */}
          {[1, 2, 3, 4, 5].map(c => (
            <rect key={`rh-${c}`} x={c} y="7" width="1" height="1" fill="#d9482b" stroke="#2a303d" strokeWidth="0.045" />
          ))}
          {[1, 2, 3, 4, 5].map(r => (
            <rect key={`gh-${r}`} x="7" y={r} width="1" height="1" fill="#059669" stroke="#2a303d" strokeWidth="0.045" />
          ))}
          {[9, 10, 11, 12, 13].map(c => (
            <rect key={`yh-${c}`} x={c} y="7" width="1" height="1" fill="#d97706" stroke="#2a303d" strokeWidth="0.045" />
          ))}
          {[9, 10, 11, 12, 13].map(r => (
            <rect key={`bh-${r}`} x="7" y={r} width="1" height="1" fill="#3b6e8c" stroke="#2a303d" strokeWidth="0.045" />
          ))}

          {/* --- Center Finish Triangles --- */}
          <polygon points="6,6 9,6 7.5,7.5" fill="#059669" stroke="#0d0f14" strokeWidth="0.04" />
          <polygon points="9,6 9,9 7.5,7.5" fill="#d97706" stroke="#0d0f14" strokeWidth="0.04" />
          <polygon points="9,9 6,9 7.5,7.5" fill="#3b6e8c" stroke="#0d0f14" strokeWidth="0.04" />
          <polygon points="6,9 6,6 7.5,7.5" fill="#d9482b" stroke="#0d0f14" strokeWidth="0.04" />
        </svg>

        {/* Layer for animated pieces */}
        <div className="absolute inset-0 pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
