/**
 * FILE: frontend/src/games/bingo/BingoGame.tsx
 * PURPOSE: Root game component for tactile 1–25 paper-and-pen Bingo.
 *          Engineered with Teenage Engineering / mechanical keyboard tabletop aesthetics,
 *          zero AI slop, procedural Web Audio API sounds, and clean WebSocket connectivity.
 */

import React, { useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, MessageSquare } from 'lucide-react'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import { getWinningLines, countCompletedLines } from './gameLogic'
import { useGameAudio } from './useGameAudio'
import BingoBoard from './BingoBoard'
import RecentCallsTray from './RecentCallsTray'
import TurnStatusBar from './TurnStatusBar'
import WinScreen from '../_shared/WinScreen'

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const

export const BingoGame: React.FC = () => {
  const { gameState, status, roomId } = useRoomStore()
  const { socketId, name: myName } = usePlayerStore()
  const { isOpen: isChatOpen, setOpen: setChatOpen, unreadCount } = useChatStore()

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

  // Opponent player states
  const otherPlayers = useMemo(() => {
    if (!gameState?.players) return []
    return gameState.players.filter((p) => p.name !== myPlayerState?.name)
  }, [gameState?.players, myPlayerState?.name])

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

      {/* ── Top Hardware Strip: LED Status Pill & Tally Lamps ── */}
      <div className="w-full relative z-10 flex flex-col items-center gap-3">
        <TurnStatusBar
          isMyTurn={isMyTurn && !myPlayerState?.is_finished}
          callerName={callerPlayer?.name || 'Opponent'}
          isFinished={!!myPlayerState?.is_finished}
          hasBingo={!!myPlayerState?.has_bingo}
          linesCount={myLinesCount}
          canShuffle={canShuffle}
          onShuffle={handleShuffle}
          isMuted={audio.isMuted}
          onToggleMute={audio.toggleMute}
        />

        {/* ── Recent Calls Ceramic Ball Tray ── */}
        <RecentCallsTray
          calledNumbers={gameState.called_numbers || []}
          totalPossible={25}
        />
      </div>

      {/* ── Main Playing Area: 5×5 Board as Centerpiece ── */}
      <div className="relative z-10 w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-10 my-auto py-2">
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

        {/* Tactile Opponents Sub-Display Rail */}
        {otherPlayers.length > 0 && (
          <div className="flex flex-col gap-2.5 w-full max-w-xs select-none">
            <div className="flex items-center gap-1.5 px-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Opponent Monitors ({otherPlayers.length})</span>
            </div>

            <div className="flex flex-col gap-2">
              {otherPlayers.map((op) => (
                <div
                  key={op.name}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#171a21] border border-white/[0.05] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-mono font-bold text-[#e2e8f0] truncate">
                      {op.name}
                    </span>
                    <span
                      className="text-[11px] font-mono text-zinc-400"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {op.lines_count || 0}/5 lines stamped
                    </span>
                  </div>

                  {/* Opponent Mini B-I-N-G-O Indicator Keycaps */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {BINGO_LETTERS.map((letter, idx) => {
                      const isComplete = (op.lines_count || 0) > idx
                      return (
                        <span
                          key={letter}
                          className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center border transition-all ${
                            isComplete
                              ? 'bg-[#b45309] border-amber-600/50 text-[#fffbeb] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                              : 'bg-[#12151c] border-white/[0.04] text-[#475569]'
                          }`}
                        >
                          {letter}
                        </span>
                      )
                    })}

                    {op.has_bingo && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-0.5">
                        <Trophy className="w-3 h-3 text-amber-400" />
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

      {/* ── Tabletop Quiet Footer: Hardware Specs & Chat Toggle ── */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-between pt-2 px-2 text-[11px] font-mono text-zinc-500 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <span>ROOM #{roomId || 'LOCAL'}</span>
          <span>•</span>
          <span>SPEC: 1–25 PBT</span>
        </div>

        <button
          type="button"
          onClick={() => setChatOpen(!isChatOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#171a21] hover:bg-[#202531] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Toggle Room Chat Drawer"
        >
          <MessageSquare className="w-3 h-3 text-amber-400" />
          <span>Chat</span>
          {!isChatOpen && unreadCount > 0 && (
            <span
              className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[#111318] text-[9px] font-bold"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {unreadCount}
            </span>
          )}
        </button>
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
