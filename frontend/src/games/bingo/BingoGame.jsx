/**
 * FILE: frontend/src/games/bingo/BingoGame.jsx
 * PURPOSE: Root game component for 1–25 classic paper-and-pen Bingo.
 *
 * HOW IT WORKS:
 *   - Each player has a 5×5 card with numbers 1 to 25.
 *   - Players take turns. When it's your turn, click any uncrossed number on your card.
 *   - Completing any 5-in-a-row (horizontal, vertical, diagonal) lights up B, I, N, G, O.
 *   - First to reach 5 lines wins! In 3+ player games, remaining players continue playing.
 *   - Includes "Shuffle Card" button before the first number is called.
 */

import { useMemo, useEffect } from 'react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import CalledNumbers from './CalledNumbers'
import BingoCard from './BingoCard'
import TurnBanner from '../_shared/TurnBanner'
import WinScreen from '../_shared/WinScreen'
import Button from '../../components/ui/Button'
import { BINGO_LETTERS, LETTER_COLORS } from './constants'
import { getWinningLines, countCompletedLines } from './gameLogic'
import './bingo.css'

export default function BingoGame() {
  const { gameState, status, players } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const playSound = useSound('bingo')

  // Sound triggers on new number called
  useEffect(() => {
    if (gameState?.current_number) {
      playSound('number_call')
    }
  }, [gameState?.current_number])

  if (!gameState) {
    return <div className="p-8 text-center text-slate-400">Loading Bingo game...</div>
  }

  const callerIdx = gameState.caller_turn_index
  const callerPlayer = gameState.players?.[callerIdx]
  const isMyTurn = callerPlayer?.socket_id === socketId

  // Own player card state (matched by socket_id or name)
  const myPlayerState =
    gameState.players?.find(p => p.socket_id === socketId || p.name?.toLowerCase() === myName?.toLowerCase()) ||
    gameState.players?.[0]

  const otherPlayers = gameState.players?.filter(p => p.name !== myPlayerState?.name) || []

  // Completed lines calculation & winning coordinates
  const winningCoords = useMemo(() => {
    if (!myPlayerState?.marked) return new Set()
    const lines = getWinningLines(myPlayerState.marked)
    const set = new Set()
    lines.forEach(line => line.forEach(pt => set.add(`${pt.r}-${pt.c}`)))
    return set
  }, [myPlayerState?.marked])

  const myLinesCount = Math.max(myPlayerState?.lines_count || 0, countCompletedLines(myPlayerState?.marked))
  const canShuffle = (gameState.called_numbers?.length || 0) === 0 && !myPlayerState?.is_finished

  // Handle clicking an uncrossed number directly on the card
  function handlePickNumber(num) {
    if (!isMyTurn || myPlayerState?.is_finished || gameState.phase === 'finished') return
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'pick_number',
      payload: { number: num },
    })
  }

  // Handle shuffling card before first move
  function handleShuffle() {
    if (!canShuffle) return
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'shuffle_card',
      payload: {},
    })
  }

  return (
    <div className="flex flex-col items-center justify-between p-4 h-full max-w-5xl mx-auto gap-4">
      {/* Top Turn & Notification Banner */}
      <TurnBanner
        isMyTurn={isMyTurn && !myPlayerState?.is_finished}
        playerName={myPlayerState?.is_finished ? 'You reached BINGO!' : callerPlayer?.name}
      />

      {/* B-I-N-G-O Letters Progress Tracker */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-3">
          {BINGO_LETTERS.map((letter, idx) => {
            const isCompleted = myLinesCount > idx
            const col = LETTER_COLORS[letter]
            return (
              <div
                key={letter}
                className="bingo-letter-box"
                style={{
                  backgroundColor: isCompleted ? col : 'rgba(255, 255, 255, 0.05)',
                  color: isCompleted ? '#ffffff' : '#64748b',
                  boxShadow: isCompleted ? `0 0 16px ${col}80` : 'none',
                  border: isCompleted ? `2px solid ${col}` : '1px solid rgba(255, 255, 255, 0.1)',
                  transform: isCompleted ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {letter}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">
            {myLinesCount} of 5 lines completed
          </span>
          {canShuffle && (
            <button
              onClick={handleShuffle}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-400 hover:text-white transition-colors"
            >
              🔀 Shuffle Card
            </button>
          )}
        </div>
      </div>

      {/* History of called numbers */}
      <CalledNumbers numbers={gameState.called_numbers} />

      {/* Playing Area */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full my-auto">
        {/* Main Card */}
        <div className="flex flex-col items-center gap-2">
          {isMyTurn && !myPlayerState?.is_finished && (
            <p className="text-xs font-bold text-yellow-400 animate-pulse">
              👉 Click any uncrossed number on your card to call it!
            </p>
          )}
          <BingoCard
            card={myPlayerState?.card}
            marked={myPlayerState?.marked}
            winningCoords={winningCoords}
            isMyTurn={isMyTurn && !myPlayerState?.is_finished}
            onCellClick={handlePickNumber}
            playerName={myPlayerState?.name}
          />
        </div>

        {/* Other Players' Progress */}
        {otherPlayers.length > 0 && (
          <div className="flex flex-col gap-3 min-w-[220px]">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">
              Opponents
            </h3>
            {otherPlayers.map((op) => (
              <div
                key={op.name}
                className="glass-card p-3 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white truncate">{op.name}</p>
                  <p className="text-xs font-mono text-slate-400">
                    {op.lines_count || 0}/5 lines
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {BINGO_LETTERS.map((letter, idx) => (
                    <span
                      key={letter}
                      className="w-5 h-5 rounded text-[10px] font-black flex items-center justify-center"
                      style={{
                        backgroundColor: (op.lines_count || 0) > idx ? LETTER_COLORS[letter] : 'rgba(255,255,255,0.05)',
                        color: (op.lines_count || 0) > idx ? '#fff' : '#475569',
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                  {op.has_bingo && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40">
                      🏆 #{op.rank || 1}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Win announcement when the entire game concludes */}
      {status === 'finished' && (
        <WinScreen
          winnerName={gameState.winners?.[0]?.name || 'Winner'}
          reason="5 lines completed (BINGO!)"
        />
      )}
    </div>
  )
}
