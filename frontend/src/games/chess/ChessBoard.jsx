/**
 * FILE: frontend/src/games/chess/ChessBoard.jsx
 * PURPOSE: Renders the 8x8 Chess board inside a machined TE-01 hardware chassis.
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

  const boardMatrix = parseFenBoard(fen)

  return (
    <div className="relative chassis-card p-2.5 sm:p-3.5 rounded-2xl w-full max-w-[min(64dvh,520px)] mx-auto">
      <div
        ref={boardRef}
        className="chess-board-container mx-auto rounded-xl overflow-hidden recessed-well grid grid-cols-8 grid-rows-8 relative select-none"
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

            const rawRow = 8 - parseInt(rank)
            const rawCol = FILES.indexOf(file)
            const piece = boardMatrix?.[rawRow]?.[rawCol]
            const isKingInCheck = isCheck && piece?.type === 'k'

            return (
              <div
                key={square}
                className="chess-square transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: isSelected
                    ? SQUARE_COLORS.selected
                    : isKingInCheck
                    ? SQUARE_COLORS.check
                    : isLastFrom || isLastTo
                    ? SQUARE_COLORS.lastMove
                    : bgBase,
                }}
                onClick={() => onSquareClick(square)}
              >
                {fIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] font-mono font-bold ${
                      isLight ? 'text-[#434a57]/75' : 'text-[#e6dccb]/75'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[9px] font-mono font-bold ${
                      isLight ? 'text-[#434a57]/75' : 'text-[#e6dccb]/75'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {isTarget && (
                  <div
                    className={`absolute z-10 pointer-events-none rounded-full ${
                      piece
                        ? 'w-[88%] h-[88%] border-[3px] border-[#10b981] animate-pulse'
                        : 'w-3.5 h-3.5 bg-[#10b981]/85 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    }`}
                  />
                )}

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
    </div>
  )
}
