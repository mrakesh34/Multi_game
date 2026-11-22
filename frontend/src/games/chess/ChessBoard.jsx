/**
 * FILE: frontend/src/games/chess/ChessBoard.jsx
 * PURPOSE: Renders the 8x8 standard chess board, piece placements, highlights for
 *          selected squares, legal move targets, last moves, and king check.
 *
 * PROPS:
 *   fen          : FEN string representing board state
 *   myColor      : 'white' | 'black' (determines board orientation)
 *   selectedSquare : string ('e2') | null
 *   legalMoves   : array of target square strings ['e3', 'e4']
 *   lastMove     : { from, to } | null
 *   isCheck      : boolean
 *   onSquareClick: function(square)
 */

import { useRef } from 'react'
import { parseFenBoard } from './gameLogic'
import { FILES, RANKS, SQUARE_COLORS } from './constants'
import ChessPiece from './ChessPiece'

export default function ChessBoard({
  fen,
  myColor = 'white',
  selectedSquare,
  legalMoves = [],
  lastMove,
  isCheck,
  onSquareClick,
}) {
  const boardRef = useRef(null)
  const isFlipped = myColor === 'black'
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS

  const boardMatrix = parseFenBoard(fen) // 8x8 row 0=rank 8, col 0=file a

  return (
    <div
      ref={boardRef}
      className="chess-board-container mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10 grid grid-cols-8 grid-rows-8 relative select-none"
    >
      {displayRanks.map((rank, rIdx) =>
        displayFiles.map((file, fIdx) => {
          const square = `${file}${rank}`
          const isLight = (FILES.indexOf(file) + parseInt(rank)) % 2 !== 0
          const bgBase = isLight ? SQUARE_COLORS.light : SQUARE_COLORS.dark

          const isSelected = selectedSquare === square
          const isTarget = legalMoves.includes(square)
          const isLastFrom = lastMove?.from === square
          const isLastTo = lastMove?.to === square

          // Determine square piece from boardMatrix
          const rawRow = 8 - parseInt(rank)
          const rawCol = FILES.indexOf(file)
          const piece = boardMatrix?.[rawRow]?.[rawCol]

          return (
            <div
              key={square}
              className="chess-square transition-colors cursor-pointer"
              style={{
                backgroundColor: isSelected
                  ? SQUARE_COLORS.selected
                  : isLastFrom || isLastTo
                  ? SQUARE_COLORS.lastMove
                  : bgBase,
              }}
              onClick={() => onSquareClick(square)}
            >
              {/* Rank & File corner label */}
              {fIdx === 0 && (
                <span className="absolute top-1 left-1 text-[10px] font-bold opacity-60 text-slate-700">
                  {rank}
                </span>
              )}
              {rIdx === 7 && (
                <span className="absolute bottom-1 right-1 text-[10px] font-bold opacity-60 text-slate-700">
                  {file}
                </span>
              )}

              {/* Target Move Indicator Dot / Ring */}
              {isTarget && (
                <div
                  className={`absolute z-10 pointer-events-none rounded-full ${
                    piece
                      ? 'w-full h-full border-4 border-green-500/80 animate-pulse'
                      : 'w-4 h-4 bg-green-500/80'
                  }`}
                />
              )}

              {/* Chess Piece */}
              {piece && (
                <ChessPiece
                  piece={piece}
                  isDraggable={false}
                  onSelect={() => onSquareClick(square)}
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
