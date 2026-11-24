/**
 * FILE: frontend/src/games/bingo/BingoGame.tsx
 * PURPOSE: Root game component for tactile 1–25 paper-and-pen Bingo.
 *          Engineered with Teenage Engineering / mechanical keyboard tabletop aesthetics,
 *          zero AI slop, procedural Web Audio API sounds, and clean WebSocket connectivity.
 */

import React, { useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore, usePlayerStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { getWinningLines, countCompletedLines } from './gameLogic'
import { useGameAudio } from './useGameAudio'
import BingoBoard from './BingoBoard'
import TurnStatusBar from './TurnStatusBar'
import WinScreen from '../_shared/WinScreen'

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const

export const BingoGame: React.FC = () => {
  const { gameState, status, roomId } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()

  // Procedural Web Audio API Hook (zero dependencies)
  const audio = useGameAudio()

  // Track called numbers for procedural ball clack sound
  const lastCalledNumberRef = useRef<number | null>(null)

  useEffect(() => {
    const curNum = gameState?.current_number
    if (curNum && curNum !== lastCalledNumberRef.current) {
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

  return (
    <div
      className="relative flex flex-col items-center justify-between w-full min-h-full px-3 sm:px-6 py-4 select-none overflow-x-hidden"
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
      <div className="w-full relative z-10 flex flex-col items-center">
        <TurnStatusBar
          isMyTurn={isMyTurn && !myPlayerState?.is_finished}
          callerName={callerPlayer?.name || 'Opponent'}
          isFinished={!!myPlayerState?.is_finished}
          hasBingo={!!myPlayerState?.has_bingo}
          linesCount={myLinesCount}
          canShuffle={canShuffle}
          onShuffle={handleShuffle}
          calledNumbers={gameState.called_numbers || []}
          totalPossible={25}
        />
      </div>

      {/* ── Main Playing Area: 5×5 Board as Centerpiece ── */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-auto py-2">
        {/* Central 5×5 Recessed Board */}
        <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg">
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

      {/* ── Tabletop Quiet Footer: Hardware Specs ── */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-center pt-2 px-2 text-[11px] font-mono text-zinc-500 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <span>ROOM #{roomId || 'LOCAL'}</span>
          <span>•</span>
          <span>SPEC: 1–25 PBT</span>
        </div>
      </div>

      {/* ── Game Over Screen (podium finish) ── */}
      {(status === 'finished' || gameState.phase === 'finished') && (
        <WinScreen
          winnerName={gameState.winners?.[0]?.name || 'Winner'}
          reason="5 lines stamped (BINGO!)"
        />
      )}
    </div>
  )
}

export default BingoGame
