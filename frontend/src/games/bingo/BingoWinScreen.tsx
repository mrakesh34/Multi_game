/**
 * FILE: frontend/src/games/bingo/BingoWinScreen.tsx
 * PURPOSE: Compact, viewport-fitted Bingo Game Over screen matching the
 *          mechanical keyboard / Teenage Engineering hardware tabletop design.
 *          - Blended, smoothly animated Winner Banner
 *          - Split layout: Hero "YOUR BOARD" on Left (slides smoothly from center
 *            via Framer Motion layoutId) + "OPPONENTS" zone on Right
 *          - Explicit hardware nameplate badges & subtle opponent chassis dimming
 *          - 100% viewport fit without desktop scrollbars
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Crown, Home, RotateCcw, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'
import { usePlayerStore, useRoomStore } from '../../store'
import socket from '../../socket/socket'
import { EVENTS } from '../../socket/events'
import BingoBoard from './BingoBoard'
import { TACTILE_SPRING } from './BingoTile'
import { countCompletedLines, getWinningLines } from './gameLogic'

export interface BingoPlayerState {
  name: string
  socket_id: string
  card: number[][]
  marked: boolean[][]
  lines_count: number
  letters?: string
  has_bingo: boolean
  is_finished: boolean
  rank: number | null
}

export interface BingoWinScreenProps {
  players: BingoPlayerState[]
  winners?: Array<{ name: string; rank: number }>
  calledNumbers?: number[]
}

function getWinningCoordsSet(marked?: boolean[][]): Set<string> {
  if (!marked) return new Set()
  const lines = getWinningLines(marked)
  const coords = new Set<string>()
  lines.forEach((line) => line.forEach((pt) => coords.add(`${pt.r}-${pt.c}`)))
  return coords
}

function formatOrdinal(rank: number): string {
  if (rank === 1) return '1st'
  if (rank === 2) return '2nd'
  if (rank === 3) return '3rd'
  return `${rank}th`
}

export const BingoWinScreen: React.FC<BingoWinScreenProps> = ({
  players = [],
  winners = [],
}) => {
  const navigate = useNavigate()
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const { socketId, name: myName } = usePlayerStore()
  const [requestingReplay, setRequestingReplay] = useState(false)
  const [hoveredPlayerKey, setHoveredPlayerKey] = useState<string | null>(null)

  const getPlayerKey = useCallback(
    (p: BingoPlayerState, fallbackIdx?: number) =>
      p.socket_id || p.name || String(fallbackIdx ?? 0),
    []
  )

  const isLocalPlayer = useCallback(
    (p: BingoPlayerState) =>
      p.socket_id === socketId ||
      Boolean(p.name && myName && p.name.trim().toLowerCase() === myName.trim().toLowerCase()),
    [socketId, myName]
  )

  // Podium-sorted list for standings & winner banner
  const podiumPlayers = useMemo(() => {
    const rankMap = new Map<string, number>()
    winners.forEach((w) => {
      if (w?.name && w.rank) {
        rankMap.set(w.name.trim().toLowerCase(), w.rank)
      }
    })

    return [...players]
      .map((p, idx) => {
        const computedLines = Math.max(p.lines_count || 0, countCompletedLines(p.marked))
        const mappedRank = p.rank ?? rankMap.get(p.name?.trim().toLowerCase()) ?? null
        return {
          ...p,
          _lines: computedLines,
          _rank: mappedRank,
          _origIndex: idx,
        }
      })
      .sort((a, b) => {
        const ra = a._rank ?? 999
        const rb = b._rank ?? 999
        if (ra !== rb) return ra - rb
        if (b._lines !== a._lines) return b._lines - a._lines
        return a._origIndex - b._origIndex
      })
  }, [players, winners])

  // Split into: My Board (Left Hero) & Opponents (Right Zone)
  const myBoardPlayer = useMemo(() => {
    return podiumPlayers.find((p) => isLocalPlayer(p)) || podiumPlayers[0] || null
  }, [podiumPlayers, isLocalPlayer])

  const opponentPlayers = useMemo(() => {
    if (!myBoardPlayer) return []
    return podiumPlayers.filter((p) => p !== myBoardPlayer)
  }, [podiumPlayers, myBoardPlayer])

  const topWinner = podiumPlayers[0]
  const winnerName = winners[0]?.name || topWinner?.name || 'Winner'
  const amIWinner =
    winnerName && myName && winnerName.trim().toLowerCase() === myName.trim().toLowerCase()

  useEffect(() => {
    function handleRoomError() {
      setRequestingReplay(false)
    }
    socket.on(EVENTS.ROOM_ERROR, handleRoomError)
    return () => {
      socket.off(EVENTS.ROOM_ERROR, handleRoomError)
    }
  }, [])

  // Hardware amber/gold celebratory confetti burst on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 72,
        gravity: 1.05,
        origin: { y: 0.22 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#10b981', '#e2e8f0'],
        ticks: 165,
      })
    } catch {
      // Safe fallback
    }
  }, [winnerName])

  function handlePlayAgain() {
    if (requestingReplay) return
    setRequestingReplay(true)
    socket.emit(EVENTS.PLAY_AGAIN, { direct: true })
  }

  function handleGoHome() {
    socket.emit(EVENTS.LEAVE_ROOM, {})
    clearRoom()
    navigate('/')
  }

  const oppCount = opponentPlayers.length
  const oppGridClass =
    oppCount <= 1
      ? 'grid-cols-1 max-w-[300px]'
      : oppCount === 2
        ? 'grid-cols-2 max-w-[540px]'
        : oppCount === 3
          ? 'grid-cols-2 lg:grid-cols-3 max-w-[660px]'
          : 'grid-cols-2 xl:grid-cols-3 max-w-[620px]'

  const oppCardWidthClass =
    oppCount <= 1
      ? 'max-w-[min(100%,37dvh,285px)]'
      : oppCount === 2
        ? 'max-w-[min(100%,34dvh,250px)]'
        : oppCount === 3
          ? 'max-w-[min(100%,21dvh,185px)] lg:max-w-[min(100%,31dvh,210px)]'
          : 'max-w-[min(100%,20dvh,175px)]'

  const myRank = myBoardPlayer?._rank ?? 1
  const myPlayerKey = myBoardPlayer ? getPlayerKey(myBoardPlayer, 0) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-full h-full overflow-y-auto md:overflow-hidden px-3 sm:px-6 py-2.5 sm:py-3.5 select-none flex flex-col justify-between gap-2.5 sm:gap-3"
      style={{
        backgroundColor: '#111318',
        backgroundImage: `
          radial-gradient(ellipse 75% 45% at 50% 0%, rgba(217, 119, 6, 0.14) 0%, rgba(28, 32, 42, 0.25) 45%, #111318 80%),
          radial-gradient(circle at 20% 90%, rgba(28, 32, 42, 0.4) 0%, transparent 60%)
        `,
      }}
    >
      {/* Ultra-Subtle CSS Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Blended, Compact Winner Banner + Stepped Rank Ladder ── */}
      <motion.section
        initial={{ opacity: 0, y: -12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-6xl mx-auto px-3 py-2 sm:px-5 sm:py-2.5 flex-shrink-0"
      >
        {/* Seamless edge-feathered background glow (no sharp left/right box edge) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 72% 115% at 24% 10%, rgba(217, 119, 6, 0.14) 0%, rgba(28, 32, 42, 0.24) 48%, transparent 82%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
        />

        <motion.div
          initial={{ x: '-35%', opacity: 0 }}
          animate={{ x: '35%', opacity: [0, 0.26, 0.1] }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 100% at 35% 15%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-5">
          {/* Left: Crown Emblem + Winner Name + B-I-N-G-O Lamps */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(180deg, #d97706 0%, #92400e 100%)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.3), 0 3px 0 #451a03, 0 6px 14px rgba(217, 119, 6, 0.25)',
                border: '1px solid rgba(251, 191, 36, 0.45)',
              }}
            >
              <Crown className="w-5 h-5 text-[#fffbeb]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)] animate-pulse" />
            </motion.div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/12 border border-amber-400/25 text-amber-300">
                  <Trophy className="w-2.5 h-2.5" />
                  {amIWinner ? 'You Won' : '1st Place'}
                </span>

                <h1 className="font-mono font-extrabold text-lg sm:text-2xl tracking-tight text-[#fffbeb] truncate">
                  {winnerName} <span className="text-amber-400">Wins!</span>
                </h1>
              </div>

              <span
                className="text-[11px] font-mono text-zinc-400"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {topWinner?._lines ?? 5} Lines Stamped
              </span>
            </div>
          </div>

          {/* Center: Blended Stepped Rank Ladder (Ascending 1 → 2 → 3 → 4...) */}
          {podiumPlayers.length > 1 && (
            <div className="w-full lg:flex-1 max-w-[380px] flex flex-col items-start gap-1 min-w-0">
              {podiumPlayers.map((p, idx) => {
                const rankNum = p._rank ?? idx + 1
                const tier = rankNum - 1
                const isFirst = rankNum === 1
                const isMe = isLocalPlayer(p)
                const pKey = getPlayerKey(p, idx)
                const isHovered = hoveredPlayerKey === pKey
                const widthPct = Math.max(60, 100 - tier * 11)
                const isUltraCompact = podiumPlayers.length >= 4

                return (
                  <motion.div
                    key={pKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.14 + tier * 0.06, ...TACTILE_SPRING }}
                    onMouseEnter={() => setHoveredPlayerKey(pKey)}
                    onMouseLeave={() => setHoveredPlayerKey(null)}
                    style={{
                      width: `${widthPct}%`,
                      background: isFirst
                        ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.22) 0%, rgba(146, 64, 14, 0.1) 85%, rgba(17, 19, 24, 0.15) 100%)'
                        : isMe
                          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 26, 34, 0.55) 90%, rgba(17, 19, 24, 0.15) 100%)'
                          : 'linear-gradient(90deg, rgba(33, 38, 51, 0.65) 0%, rgba(23, 26, 33, 0.35) 90%, rgba(17, 19, 24, 0.1) 100%)',
                      boxShadow: isHovered
                        ? isFirst
                          ? '0 0 0 1px rgba(251, 191, 36, 0.5), inset 0 1px 0 rgba(255,255,255,0.16)'
                          : '0 0 0 1px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.08)',
                      border: isFirst
                        ? '1px solid rgba(245, 158, 11, 0.34)'
                        : isMe
                          ? '1px solid rgba(16, 185, 129, 0.28)'
                          : '1px solid rgba(255,255,255,0.06)',
                    }}
                    className={`flex items-center justify-between gap-2 rounded-lg cursor-default transition-all ${
                      isUltraCompact
                        ? tier === 0
                          ? 'px-2.5 py-0.5 text-[11px]'
                          : 'px-2 py-[1px] text-[10px]'
                        : tier === 0
                          ? 'px-2.5 py-1 text-xs'
                          : tier === 1
                            ? 'px-2 py-0.5 text-[11px]'
                            : 'px-2 py-[2px] text-[10px]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`rounded flex items-center justify-center font-mono font-extrabold flex-shrink-0 ${
                          tier === 0
                            ? 'w-5 h-5 text-[11px] text-[#fffbeb] border border-amber-400/50'
                            : 'w-4 h-4 text-[10px] text-zinc-300 border border-white/10 bg-[#111318]/80'
                        }`}
                        style={
                          tier === 0
                            ? {
                                background: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                              }
                            : undefined
                        }
                      >
                        {rankNum}
                      </span>

                      <span
                        className={`font-mono font-bold truncate ${
                          isFirst ? 'text-[#fffbeb]' : isMe ? 'text-emerald-100' : 'text-zinc-200'
                        }`}
                      >
                        {p.name}
                      </span>

                      {isFirst && (
                        <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      )}

                      {isMe && (
                        <span className="text-[8px] font-mono font-bold uppercase px-1 py-0 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex-shrink-0">
                          YOU
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-mono font-bold flex-shrink-0 ${
                        isFirst ? 'text-amber-300' : p.has_bingo ? 'text-amber-400' : 'text-zinc-400'
                      }`}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {p._lines}/5
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Right: Side-by-side Tactile Action Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              type="button"
              disabled={requestingReplay}
              whileHover={!requestingReplay ? { y: -1 } : undefined}
              whileTap={!requestingReplay ? { scale: 0.97, y: 2 } : undefined}
              transition={TACTILE_SPRING}
              onClick={handlePlayAgain}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-[#fffbeb] cursor-pointer disabled:opacity-60 disabled:cursor-wait outline-none"
              style={{
                background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                boxShadow:
                  '0 3px 0 #78350f, 0 6px 14px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255,255,255,0.28)',
                border: '1px solid rgba(251, 191, 36, 0.45)',
              }}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${requestingReplay ? 'animate-spin' : ''}`} />
              <span>{requestingReplay ? 'Starting...' : 'Play Again'}</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97, y: 2 }}
              transition={TACTILE_SPRING}
              onClick={handleGoHome}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-mono font-semibold text-xs uppercase tracking-wider text-zinc-300 hover:text-[#fffbeb] cursor-pointer outline-none"
              style={{
                background: 'linear-gradient(180deg, #282e3d 0%, #202531 100%)',
                boxShadow:
                  '0 3px 0 #12151c, 0 5px 10px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Home className="w-3.5 h-3.5 text-zinc-400" />
              <span>Go Home</span>
            </motion.button>
          </div>
        </div>

        {/* Soft edge-fading bottom hairline */}
        <div className="relative z-10 mt-2.5 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </motion.section>

      {/* ── Split Results Stage: Left = YOUR BOARD (slides from center) | Right = OPPONENTS ── */}
      <section className="relative z-10 w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
        {/* LEFT ZONE: YOUR BOARD (Hero Card) */}
        {myBoardPlayer && (
          <div className="flex flex-col items-center justify-center w-full md:w-[42%] flex-shrink-0">
            <div className="w-full max-w-[min(100%,44dvh,335px)] flex flex-col gap-1.5">
              {/* Explicit Top Hardware Nameplate */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.35 }}
                className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] flex-shrink-0" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-300">
                    Your Board
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase ${
                    myRank === 1 ? 'text-amber-300' : 'text-zinc-300'
                  }`}
                >
                  {myRank === 1 ? '★ 1st Winner' : `${formatOrdinal(myRank)} Place`}
                </span>
              </motion.div>

              {/* Smoothly enters on game over without shared layoutId jitter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-2xl transition-transform duration-200 ${
                  hoveredPlayerKey && myPlayerKey === hoveredPlayerKey
                    ? 'scale-[1.018] ring-2 ring-emerald-400/55'
                    : ''
                }`}
              >
                <BingoBoard
                  card={myBoardPlayer.card}
                  marked={myBoardPlayer.marked}
                  winningCoords={getWinningCoordsSet(myBoardPlayer.marked)}
                  isMyTurn={false}
                  playerName={myBoardPlayer.name}
                  isMini
                  fullWidthMini
                  readonly
                  rank={myRank}
                  isWinner={myRank === 1}
                  isSelf
                  roleVariant="self"
                  hasBingo={myBoardPlayer.has_bingo}
                  linesCount={myBoardPlayer._lines}
                  showMiniHeaderLamps
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="flex items-center justify-between px-1.5 text-[10px] font-mono"
              >
                <span className={myRank === 1 ? 'text-amber-400 font-bold uppercase' : 'text-emerald-300/90 uppercase'}>
                  {myBoardPlayer.has_bingo ? 'Bingo Completed' : 'Your Card'}
                </span>
                <span className="text-zinc-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {myBoardPlayer._lines} {myBoardPlayer._lines === 1 ? 'line' : 'lines'} stamped
                </span>
              </motion.div>
            </div>
          </div>
        )}

        {/* CENTER VERTICAL HARDWARE DIVIDER */}
        {opponentPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.6 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.16, duration: 0.4 }}
            className="hidden md:flex flex-col items-center justify-center self-stretch py-6 flex-shrink-0"
          >
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <span className="my-2 px-2 py-0.5 rounded-md bg-[#171a21] border border-white/[0.08] text-[10px] font-mono font-bold tracking-widest text-zinc-500">
              {oppCount === 1 ? 'VS' : 'OPP'}
            </span>
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          </motion.div>
        )}

        {/* RIGHT ZONE: OPPONENT BOARD(S) (Slides in smoothly on the right) */}
        {opponentPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center w-full md:flex-1 min-w-0 gap-2"
          >
            <div className="flex items-center justify-between w-full max-w-[660px] px-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  {oppCount === 1 ? 'Opponent Board' : `Opponents (${oppCount})`}
                </span>
              </div>
            </div>

            <div className={`grid gap-3 w-full mx-auto items-start justify-items-center ${oppGridClass}`}>
              {opponentPlayers.map((player, idx) => {
                const rankNum = player._rank ?? idx + 2
                const isFirst = rankNum === 1
                const oppKey = getPlayerKey(player, idx + 1)
                const isSpotlight = hoveredPlayerKey === oppKey

                return (
                  <motion.div
                    key={oppKey}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + 0.06 * idx, ...TACTILE_SPRING }}
                    className={`flex flex-col gap-1.5 w-full mx-auto transition-transform duration-200 ${oppCardWidthClass} ${
                      isSpotlight ? 'scale-[1.02]' : ''
                    }`}
                  >
                    {/* Explicit Opponent Hardware Nameplate */}
                    <div
                      className={`flex items-center justify-between px-2 py-0.5 rounded-md border transition-colors ${
                        isSpotlight
                          ? 'bg-amber-500/20 border-amber-400/60'
                          : isFirst
                            ? 'bg-amber-500/12 border-amber-500/35'
                            : 'bg-[#14171d] border-white/[0.06]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider truncate ${
                          isFirst ? 'text-amber-300' : 'text-zinc-400'
                        }`}
                      >
                        {isFirst ? '★ Winner' : 'Opponent'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0">
                        {formatOrdinal(rankNum)}
                      </span>
                    </div>

                    <BingoBoard
                      card={player.card}
                      marked={player.marked}
                      winningCoords={getWinningCoordsSet(player.marked)}
                      isMyTurn={false}
                      playerName={player.name}
                      isMini
                      fullWidthMini
                      readonly
                      rank={rankNum}
                      isWinner={isFirst}
                      roleVariant="opponent"
                      compactHeaderBadge={oppCount >= 3}
                      hasBingo={player.has_bingo}
                      linesCount={player._lines}
                      showMiniHeaderLamps
                    />

                    <div className="flex items-center justify-between px-1 text-[10px] font-mono">
                      <span className={isFirst ? 'text-amber-400 font-semibold uppercase' : 'text-zinc-500 uppercase'}>
                        {player.has_bingo ? 'Bingo!' : `${formatOrdinal(rankNum)} Place`}
                      </span>
                      <span className="text-zinc-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {player._lines} {player._lines === 1 ? 'line' : 'lines'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </section>
    </motion.div>
  )
}

export default BingoWinScreen
