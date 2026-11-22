/**
 * FILE: frontend/src/games/bingo/BingoGame.jsx
 * PURPOSE: Completely redesigned root game component for 1–25 classic paper-and-pen Bingo.
 *          Features minimal dark UI, last-5 called numbers, and a high-impact number call popup.
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Trophy, Users, Check, Sparkles, Volume2 } from 'lucide-react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { useSound } from '../../hooks/useSound'
import CalledNumbers from './CalledNumbers'
import NumberCallPopup from './NumberCallPopup'
import BingoCard from './BingoCard'
import WinScreen from '../_shared/WinScreen'
import { BINGO_LETTERS } from './constants'
import { getWinningLines, countCompletedLines } from './gameLogic'

export default function BingoGame() {
  const { gameState, status, players } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const playSound = useSound('bingo')

  // Number call popup announcement state
  const [announcement, setAnnouncement] = useState(null)
  const lastAnnouncedNumRef = useRef(null)

  // Detect and trigger announcement popup on new number call
  useEffect(() => {
    const curNum = gameState?.current_number
    if (curNum && curNum !== lastAnnouncedNumRef.current) {
      lastAnnouncedNumRef.current = curNum

      // Determine caller name from caller index or action summary
      const callerIdx = gameState.caller_turn_index
      const caller = gameState.players?.[callerIdx]?.name || 'Opponent'

      setAnnouncement({ number: curNum, callerName: caller })
      playSound('number_call')

      // Auto dismiss popup after 2.3 seconds
      const timer = setTimeout(() => {
        setAnnouncement(null)
      }, 2300)

      return () => clearTimeout(timer)
    }
  }, [gameState?.current_number, gameState?.called_numbers?.length])

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-zinc-500 font-mono text-xs">
        Loading Bingo game state...
      </div>
    )
  }

  const callerIdx = gameState.caller_turn_index
  const callerPlayer = gameState.players?.[callerIdx]
  const isMyTurn = callerPlayer?.socket_id === socketId

  // Local player state
  const myPlayerState =
    gameState.players?.find(
      (p) => p.socket_id === socketId || p.name?.toLowerCase() === myName?.toLowerCase()
    ) || gameState.players?.[0]

  const otherPlayers = gameState.players?.filter((p) => p.name !== myPlayerState?.name) || []

  // Completed lines calculation & winning coordinates
  const winningCoords = useMemo(() => {
    if (!myPlayerState?.marked) return new Set()
    const lines = getWinningLines(myPlayerState.marked)
    const set = new Set()
    lines.forEach((line) => line.forEach((pt) => set.add(`${pt.r}-${pt.c}`)))
    return set
  }, [myPlayerState?.marked])

  const myLinesCount = Math.max(
    myPlayerState?.lines_count || 0,
    countCompletedLines(myPlayerState?.marked)
  )

  const canShuffle =
    (gameState.called_numbers?.length || 0) === 0 && !myPlayerState?.is_finished

  // Actions
  function handlePickNumber(num) {
    if (!isMyTurn || myPlayerState?.is_finished || gameState.phase === 'finished') return
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'pick_number',
      payload: { number: num },
    })
  }

  function handleShuffle() {
    if (!canShuffle) return
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'shuffle_card',
      payload: {},
    })
  }

  return (
    <div className="relative flex flex-col items-center justify-between p-4 sm:p-6 w-full max-w-5xl mx-auto min-h-full gap-5">
      {/* ── Top HUD: Turn Banner & B-I-N-G-O Badges ── */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
        {/* Turn Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isMyTurn && !myPlayerState?.is_finished
                ? 'bg-emerald-400 animate-ping'
                : 'bg-zinc-600'
            }`}
          />
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {myPlayerState?.is_finished
                ? 'Status'
                : isMyTurn
                ? 'Your Turn'
                : "Opponent's Turn"}
            </p>
            <p className="text-sm font-bold text-white tracking-tight">
              {myPlayerState?.is_finished
                ? '🎉 You reached BINGO!'
                : isMyTurn
                ? 'Click any uncrossed number on your card'
                : `Waiting for ${callerPlayer?.name || 'opponent'} to pick...`}
            </p>
          </div>
        </div>

        {/* B-I-N-G-O Letter Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {BINGO_LETTERS.map((letter, idx) => {
              const isUnlocked = myLinesCount > idx
              return (
                <motion.div
                  key={letter}
                  animate={isUnlocked ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono transition-all border ${
                    isUnlocked
                      ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-600'
                  }`}
                >
                  {letter}
                </motion.div>
              )
            })}
          </div>

          <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 font-semibold">
              {myLinesCount}/5
            </span>
            {canShuffle && (
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm active:scale-95"
                title="Reshuffle your 1-25 card"
              >
                <Shuffle className="w-3.5 h-3.5 text-blue-400" />
                <span>Reroll</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Last 5 Called Numbers Strip ── */}
      <CalledNumbers numbers={gameState.called_numbers} />

      {/* ── Main Playing Area ── */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 w-full my-auto">
        {/* Main 5×5 Card */}
        <div className="flex flex-col items-center w-full max-w-md">
          <BingoCard
            card={myPlayerState?.card}
            marked={myPlayerState?.marked}
            winningCoords={winningCoords}
            isMyTurn={isMyTurn && !myPlayerState?.is_finished}
            onCellClick={handlePickNumber}
            playerName={myPlayerState?.name}
          />
        </div>

        {/* Opponents Mini Status Strip */}
        {otherPlayers.length > 0 && (
          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold uppercase tracking-wider px-1">
              <Users className="w-3.5 h-3.5" />
              <span>Opponents ({otherPlayers.length})</span>
            </div>

            <div className="flex flex-col gap-2">
              {otherPlayers.map((op) => (
                <div
                  key={op.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold text-zinc-200 truncate font-mono">
                      {op.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {op.lines_count || 0}/5 lines
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {BINGO_LETTERS.map((letter, idx) => {
                      const isComplete = (op.lines_count || 0) > idx
                      return (
                        <span
                          key={letter}
                          className={`w-5 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center border ${
                            isComplete
                              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                              : 'bg-zinc-950/50 border-zinc-800/60 text-zinc-700'
                          }`}
                        >
                          {letter}
                        </span>
                      )
                    })}

                    {op.has_bingo && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
                        <Trophy className="w-3 h-3" />
                        <span>#{op.rank || 1}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Unique Number Call Pop-Up Announcement ── */}
      <NumberCallPopup
        announcement={announcement}
        onDismiss={() => setAnnouncement(null)}
      />

      {/* ── Game Over Screen ── */}
      {status === 'finished' && (
        <WinScreen
          winnerName={gameState.winners?.[0]?.name || 'Winner'}
          reason="5 lines completed (BINGO!)"
        />
      )}
    </div>
  )
}
