/**
 * FILE: frontend/src/games/bingo/BingoGame.tsx
 * PURPOSE: Root game component for tactile 1–25 paper-and-pen Bingo.
 *          Engineered with Teenage Engineering / mechanical keyboard tabletop aesthetics,
 *          zero AI slop, procedural Web Audio API sounds, and clean WebSocket connectivity.
 */

import React, { useMemo, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { getWinningLines, countCompletedLines } from './gameLogic'
import { useGameAudio } from './useGameAudio'
import BingoBoard from './BingoBoard'
import TurnStatusBar from './TurnStatusBar'
import BingoWinScreen from './BingoWinScreen'

export const BingoGame: React.FC = () => {
  const { gameState, status } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()

  // Procedural Web Audio API Hook (zero dependencies)
  const audio = useGameAudio()

  // Track called numbers for procedural ball clack sound
  const lastCalledNumberRef = useRef<number | null>(null)

  useEffect(() => {
    const curNum = gameState?.current_number ?? null
    if (!curNum) {
      lastCalledNumberRef.current = null
      return
    }
    if (curNum !== lastCalledNumberRef.current) {
      lastCalledNumberRef.current = curNum
      audio.playBallCalled()
    }
  }, [gameState?.current_number, audio])

  // Caller turn calculation
  const callerIdx = gameState?.caller_turn_index ?? 0
  const callerPlayer = gameState?.players?.[callerIdx]
  const isMyTurn =
    callerPlayer?.socket_id === socketId ||
    Boolean(
      callerPlayer?.name &&
      myName &&
      callerPlayer.name.trim().toLowerCase() === myName.trim().toLowerCase()
    )

  // Local player state
  const myPlayerState = useMemo(() => {
    if (!gameState?.players) return null
    return (
      gameState.players.find(
        (p) => p.socket_id === socketId || p.name?.toLowerCase() === myName?.toLowerCase()
      ) || gameState.players[0]
    )
  }, [gameState?.players, socketId, myName])

  // Completed winning line coordinates for local player's card
  const winningCoords = useMemo(() => {
    if (!myPlayerState?.marked) return new Set<string>()
    const lines = getWinningLines(myPlayerState.marked)
    const set = new Set<string>()
    lines.forEach((line) => line.forEach((pt) => set.add(`${pt.r}-${pt.c}`)))
    return set
  }, [myPlayerState?.marked])

  const myLinesCount = Math.max(
    myPlayerState?.lines_count || 0,
    countCompletedLines(myPlayerState?.marked)
  )

  const canShuffle =
    (gameState?.called_numbers?.length || 0) === 0 && !myPlayerState?.is_finished

  // User Actions
  const handlePickNumber = useCallback(
    (num: number) => {
      if (!isMyTurn || myPlayerState?.is_finished || gameState?.phase === 'finished') return
      audio.playTilePress()
      socket.emit(EVENTS.GAME_ACTION, {
        action_type: 'pick_number',
        payload: { number: num },
      })
    },
    [isMyTurn, myPlayerState?.is_finished, gameState?.phase, audio]
  )

  const handleShuffle = useCallback(() => {
    if (!canShuffle) return
    audio.playTilePress()
    socket.emit(EVENTS.GAME_ACTION, {
      action_type: 'shuffle_card',
      payload: {},
    })
  }, [canShuffle, audio])

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-500 font-mono text-xs select-none">
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 animate-pulse mb-3" />
        CONNECTING HARDWARE TABLETOP...
      </div>
    )
  }

  const isGameOver = status === 'finished' || gameState.phase === 'finished'

  const allPlayers = gameState.players || []
  const winnersList = gameState.winners || []
  const activePlayersCount = allPlayers.filter((p) => !p.is_finished).length
  const showContinuationHud = winnersList.length > 0 || Boolean(myPlayerState?.is_finished)

  return (
    <>
      {isGameOver ? (
        <BingoWinScreen
          players={allPlayers}
          winners={winnersList}
          calledNumbers={gameState.called_numbers || []}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative flex flex-col items-center justify-between w-full h-full px-2 sm:px-4 py-2 select-none overflow-hidden"
          style={{
            backgroundColor: '#111318',
            backgroundImage: `
              radial-gradient(circle at 50% 0%, #1c202a 0%, #111318 70%),
              radial-gradient(circle at 20% 80%, rgba(28, 32, 42, 0.5) 0%, transparent 60%)
            `,
          }}
        >
          {/* ── Ultra-Subtle CSS Noise Texture Overlay (0.03 opacity) ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* ── Top Hardware Strip: Unified Tabletop Control HUD ── */}
          <div className="w-full relative z-10 flex flex-col items-center gap-2">
            <TurnStatusBar
              isMyTurn={isMyTurn && !myPlayerState?.is_finished}
              callerName={callerPlayer?.name || 'Opponent'}
              isFinished={!!myPlayerState?.is_finished}
              hasBingo={!!myPlayerState?.has_bingo}
              myRank={myPlayerState?.rank ?? null}
              linesCount={myLinesCount}
              canShuffle={canShuffle}
              onShuffle={handleShuffle}
              calledNumbers={gameState.called_numbers || []}
              totalPossible={25}
            />

            {/* ── Live 3/4-Player Continuation Strip (Shown once someone hits BINGO while others play on) ── */}
            {showContinuationHud && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-auto flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-[#171a21]/95 border border-amber-500/25 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    {myPlayerState?.is_finished
                      ? `#${myPlayerState.rank ?? 1} Claimed! Waiting for ${activePlayersCount} remaining`
                      : 'Game Continuing for Remaining Ranks'}
                  </span>
                  <span className="text-zinc-400 uppercase">
                    {callerPlayer?.name ? `${callerPlayer.name}'s Turn` : 'In Progress'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {allPlayers.map((p, idx) => {
                    const isCurrentTurn = idx === callerIdx && !p.is_finished
                    const isMe =
                      p.socket_id === socketId ||
                      Boolean(p.name && myName && p.name.trim().toLowerCase() === myName.trim().toLowerCase())

                    return (
                      <div
                        key={p.socket_id || p.name || idx}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono ${
                          p.is_finished
                            ? 'bg-amber-500/15 border-amber-500/35 text-amber-200'
                            : isCurrentTurn
                              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                              : 'bg-[#111318] border-white/[0.06] text-zinc-400'
                        }`}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {p.is_finished ? (
                          <span className="font-bold text-amber-400">#{p.rank}</span>
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCurrentTurn ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                            }`}
                          />
                        )}
                        <span className="truncate max-w-[85px] font-semibold">
                          {p.name}
                          {isMe ? ' (You)' : ''}
                        </span>
                        <span className="text-zinc-500">
                          {p.is_finished ? 'BINGO' : `${p.lines_count || 0}/5`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Main Playing Area: 5×5 Board as Centerpiece ── */}
          <div className="relative z-10 w-full flex-1 min-h-0 flex flex-col items-center justify-center py-1">
            {/* Central 5×5 Recessed Board (fixed position, zero layout-projection wobble) */}
            <div className="flex flex-col items-center w-full max-w-[min(52dvh,440px)]">
              <BingoBoard
                card={myPlayerState?.card}
                marked={myPlayerState?.marked}
                winningCoords={winningCoords}
                isMyTurn={isMyTurn && !myPlayerState?.is_finished}
                onTileClick={handlePickNumber}
                playerName={myPlayerState?.name}
                onLineComplete={audio.playLineComplete}
              />
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default BingoGame
