/**
 * FILE: frontend/src/games/bingo/BingoLobby.tsx
 * PURPOSE: Full-viewport unified hardware tabletop lobby for 1–25 Paper Bingo.
 *          - Single centered machined chassis blending large highlighted Room No.,
 *            progressive 2→6 Player Bays, and centered Start/Ready action dock.
 *          - Matches the Teenage Engineering / PBT keycap aesthetic of BingoGame.
 *          - Calm auto-rotating gameplay hints with smooth feathered background
 *            and un-highlighted text.
 *          - Guaranteed full-screen coverage (100dvh) with zero scrollbars.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Check,
  Link as LinkIcon,
  LogOut,
  Play,
  CheckCircle2,
  Circle,
  Crown,
  UserX,
  Volume2,
  VolumeX,
  Plus,
} from 'lucide-react'
import { formatRoomId } from '../../utils/roomCode'
import { TACTILE_SPRING } from './BingoTile'
import { useGameAudio } from './useGameAudio'

export interface LobbyPlayer {
  socket_id: string
  name: string
  slot?: number
  is_host?: boolean
  is_ready?: boolean
  is_connected?: boolean
  color_index?: number
}

export interface BingoLobbyProps {
  roomId: string
  players: LobbyPlayer[]
  me?: LobbyPlayer | null
  socketId?: string | null
  myName?: string | null
  maxPlayers?: number
  isHost: boolean
  connectedCount: number
  allReady: boolean
  canStart: boolean
  starting: boolean
  onReady: () => void
  onStart: () => void
  onLeave: () => void
}

// Subtle dark-hardware keycap accent dots mapped from server color_index (0–5)
const KEYCAP_ACCENTS = [
  { dot: '#ef4444', ring: 'rgba(239, 68, 68, 0.35)' },
  { dot: '#3b82f6', ring: 'rgba(59, 130, 246, 0.35)' },
  { dot: '#10b981', ring: 'rgba(16, 185, 129, 0.35)' },
  { dot: '#f59e0b', ring: 'rgba(245, 158, 11, 0.35)' },
  { dot: '#8b5cf6', ring: 'rgba(139, 92, 246, 0.35)' },
  { dot: '#ec4899', ring: 'rgba(236, 72, 153, 0.35)' },
] as const

const BINGO_HINTS = [
  'Each player gets a unique 5×5 board shuffled with numbers 1 to 25.',
  'There is no free center space — every tile on your board counts.',
  'Before the first ball is called, press Reroll to shuffle a fresh card.',
  'Take turns calling any unmarked number; it marks across every board at once.',
  'Complete 5 rows, columns, or diagonals to light up B-I-N-G-O and win.',
  'If two players reach 5 lines on the same call, the caller wins priority.',
  'With 3 or more players, the match continues for 2nd and 3rd place ranks.',
] as const

const CornerScrews: React.FC = () => (
  <>
    {(['top-2.5 left-2.5', 'top-2.5 right-2.5', 'bottom-2.5 left-2.5', 'bottom-2.5 right-2.5'] as const).map(
      (pos) => (
        <div
          key={pos}
          className={`absolute ${pos} w-2 h-2 rounded-full border border-white/[0.08] pointer-events-none`}
          style={{
            background: 'linear-gradient(135deg, #262c38 0%, #151820 100%)',
            boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
          }}
        />
      )
    )}
  </>
)

const KEYCAP_DARK_STYLE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #282e3d 0%, #202531 100%)',
  boxShadow:
    '0 3px 0 #12151c, 0 5px 8px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.07)',
}

const KEYCAP_AMBER_STYLE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
  boxShadow:
    '0 4px 0 #78350f, 0 8px 18px rgba(217, 119, 6, 0.28), inset 0 1px 0 rgba(255,255,255,0.28)',
  border: '1px solid rgba(251, 191, 36, 0.48)',
}

const KEYCAP_EMERALD_STYLE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
  boxShadow:
    '0 4px 0 #064e3b, 0 8px 18px rgba(5, 150, 105, 0.28), inset 0 1px 0 rgba(255,255,255,0.24)',
  border: '1px solid rgba(52, 211, 153, 0.42)',
}

export const BingoLobby: React.FC<BingoLobbyProps> = ({
  roomId,
  players,
  me,
  socketId,
  myName,
  maxPlayers = 6,
  isHost,
  connectedCount,
  allReady,
  canStart,
  starting,
  onReady,
  onStart,
  onLeave,
}) => {
  const audio = useGameAudio()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Smooth auto-rotating game hints
  const [hintIndex, setHintIndex] = useState(0)
  const [isHintPaused, setIsHintPaused] = useState(false)

  useEffect(() => {
    if (isHintPaused) return
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % BINGO_HINTS.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [isHintPaused])

  const formattedRoomId = formatRoomId(roomId)

  // Progressive slot expansion:
  // Start with 2 slots. Once 2 players join, open 3rd slot; when 3 join, open 4th; up to maxPlayers (6).
  const visibleSlotCount = Math.min(maxPlayers, Math.max(2, players.length + 1))
  const slots = Array.from({ length: visibleSlotCount }, (_, i) => players[i] || null)
  const bayGridCols = slots.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
  const isCompactBays = slots.length > 4

  const handleCopyCode = useCallback(() => {
    audio.playTilePress()
    navigator.clipboard?.writeText(roomId).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 1800)
    })
  }, [roomId, audio])

  const handleCopyLink = useCallback(() => {
    audio.playTilePress()
    const inviteUrl = `${window.location.origin}/bingo/room/${roomId}`
    navigator.clipboard?.writeText(inviteUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 1800)
    })
  }, [roomId, audio])

  const handleCycleHint = useCallback(() => {
    audio.playTilePress()
    setHintIndex((prev) => (prev + 1) % BINGO_HINTS.length)
  }, [audio])

  const handleSelectHint = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.stopPropagation()
      audio.playTilePress()
      setHintIndex(idx)
    },
    [audio]
  )

  const statusText = (() => {
    if (isHost) {
      if (connectedCount < 2) return 'Need at least 2 players — share the room no. or invite link.'
      if (!allReady) return 'Waiting for joined players to click Ready Up.'
      return 'All players ready — press Start Game to deal 5×5 cards.'
    }
    if (!me?.is_ready) return 'Press Ready Up so the host can start the match.'
    if (connectedCount < 2) return 'Waiting for more players to join the room.'
    if (!allReady) return 'Waiting for remaining players to ready up.'
    return 'Ready! Waiting for the host to launch the round.'
  })()

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 select-none"
      style={{
        backgroundColor: '#111318',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, #1c202a 0%, #111318 70%),
          radial-gradient(circle at 20% 80%, rgba(28, 32, 42, 0.5) 0%, transparent 60%)
        `,
      }}
    >
      {/* Subtle tabletop dot matrix */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ultra-subtle CSS Noise Texture Overlay (0.03 opacity, matching BingoGame) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Top Hardware Console Bar ── */}
      <header className="relative z-10 w-full max-w-3xl mx-auto flex-shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-[#171a21]/95 border border-white/[0.05] shadow-[inset_0_2px_6px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Tactile 'B' Mini Keycap Emblem */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-extrabold text-sm text-[#fffbeb] flex-shrink-0 relative"
            style={{
              background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
              boxShadow:
                '0 2px 0 #78350f, inset 0 1px 0 rgba(255,255,255,0.28)',
              border: '1px solid rgba(251, 191, 36, 0.45)',
            }}
          >
            B
            <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#fef3c7]/90" />
          </div>

          <div className="min-w-0">
            <h1 className="font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-[#e2e8f0] truncate">
              Bingo Room
            </h1>
            <p className="text-[10px] sm:text-[11px] font-mono text-zinc-500 truncate">
              1–25 Classic Paper Tabletop
            </p>
          </div>
        </div>

        {/* Center Status LED Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#111318] border border-white/[0.05] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]">
          <motion.span
            animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-2 h-2 rounded-full ${
              canStart || (connectedCount >= 2 && allReady)
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.85)]'
                : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.75)]'
            }`}
          />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300">
            {connectedCount >= 2 && allReady ? 'Ready to Launch' : 'Lobby Standby'}
          </span>
        </div>

        {/* Right Controls: Audio Toggle & Leave */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96, y: 2 }}
            transition={TACTILE_SPRING}
            onClick={() => {
              audio.toggleMute()
              if (audio.isMuted) {
                setTimeout(() => audio.playTilePress(), 20)
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-[#fffbeb] cursor-pointer outline-none"
            style={KEYCAP_DARK_STYLE}
            title={audio.isMuted ? 'Enable keycap sounds' : 'Mute sounds'}
            aria-label={audio.isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {audio.isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96, y: 2 }}
            transition={TACTILE_SPRING}
            onClick={() => {
              audio.playTilePress()
              onLeave()
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono font-semibold text-[11px] uppercase tracking-wider text-zinc-300 hover:text-[#fffbeb] cursor-pointer outline-none"
            style={KEYCAP_DARK_STYLE}
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Leave</span>
          </motion.button>
        </div>
      </header>

      {/* ── Center Unified Hardware Chassis (Blended Room No + Player Bays + Start Button) ── */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-3xl mx-auto flex items-center justify-center py-1.5 sm:py-3">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4"
          style={{
            backgroundColor: '#171a21',
            backgroundImage:
              'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
            boxShadow:
              'inset 0 2px 6px rgba(0,0,0,0.6), 0 18px 40px -16px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <CornerScrews />

          {/* 1. Top-Middle Highlighted Room Number (Prototype 1 highlight box + Prototype 3 centered placement) */}
          <div className="flex flex-col items-center text-center gap-2 sm:gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-zinc-400">
              Room No
            </span>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={TACTILE_SPRING}
              onClick={handleCopyCode}
              title="Click to copy room number"
              className="relative px-6 sm:px-9 py-1.5 sm:py-2.5 rounded-2xl bg-amber-500/[0.11] border border-amber-400/40 cursor-pointer outline-none group"
              style={{
                boxShadow:
                  '0 0 32px rgba(245, 158, 11, 0.14), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              }}
            >
              <span
                className={`font-mono font-black text-[#fef3c7] tabular-nums select-none block leading-none ${
                  formattedRoomId.length <= 4
                    ? 'text-4xl sm:text-5xl tracking-[0.22em] pl-[0.22em]'
                    : 'text-2xl sm:text-4xl tracking-[0.16em] pl-[0.16em]'
                }`}
                style={{
                  textShadow:
                    '0 0 26px rgba(245, 158, 11, 0.42), 0 2px 8px rgba(0, 0, 0, 0.65)',
                }}
              >
                {formattedRoomId}
              </span>
            </motion.button>

            {/* Quick Copy Controls */}
            <div className="flex items-center justify-center gap-2">
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={TACTILE_SPRING}
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-semibold text-[11px] uppercase tracking-wider text-[#e2e8f0] cursor-pointer outline-none"
                style={copiedCode ? KEYCAP_EMERALD_STYLE : KEYCAP_DARK_STYLE}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Code Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={TACTILE_SPRING}
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-semibold text-[11px] uppercase tracking-wider text-amber-200 hover:text-[#fffbeb] cursor-pointer outline-none"
                style={copiedLink ? KEYCAP_EMERALD_STYLE : KEYCAP_DARK_STYLE}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#ecfdf5]" />
                    <span className="text-[#ecfdf5]">Link Copied</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Invite Link</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* 2. Integrated Progressive Player Bays (Starts at 2 slots, opens next after 2 join) */}
          <div className="flex flex-col gap-2 sm:gap-2.5 min-w-0">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_6px_rgba(245,158,11,0.6)] flex-shrink-0" />
                <span className="font-mono font-bold text-[11px] uppercase tracking-widest text-zinc-300 truncate">
                  Players in Lobby
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                {/* 6-slot LED capacity dots */}
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#111318] border border-white/[0.04]">
                  {Array.from({ length: maxPlayers }, (_, idx) => {
                    const occupied = Boolean(players[idx])
                    const unlocked = idx < visibleSlotCount
                    return (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          occupied
                            ? 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.75)]'
                            : unlocked
                              ? 'bg-amber-400/50'
                              : 'bg-zinc-700/60'
                        }`}
                        title={
                          occupied
                            ? `Seat ${idx + 1}: Occupied`
                            : unlocked
                              ? `Seat ${idx + 1}: Open`
                              : `Seat ${idx + 1}: Unlocks after ${idx} players join`
                        }
                      />
                    )
                  })}
                </div>

                <span
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#111318] border border-white/[0.05] text-zinc-300"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {players.length}/{maxPlayers}
                </span>
              </div>
            </div>

            <div className={`relative w-full grid ${bayGridCols} gap-2 sm:gap-2.5`}>
              <AnimatePresence mode="popLayout">
                {slots.map((player, idx) => {
                  const isMe = Boolean(
                    player &&
                      (player.socket_id === socketId ||
                        (myName &&
                          player.name.trim().toLowerCase() === myName.trim().toLowerCase()))
                  )
                  const accent = KEYCAP_ACCENTS[(player?.color_index ?? idx) % KEYCAP_ACCENTS.length]
                  const initials = (player?.name || '?').slice(0, 2).toUpperCase()
                  const isUnlockedExtra = !player && idx >= 2

                  if (!player) {
                    return (
                      <motion.div
                        key={`empty-slot-${idx}`}
                        layout
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={TACTILE_SPRING}
                        className={`rounded-xl sm:rounded-2xl border border-dashed border-white/[0.09] bg-[#12151c]/80 flex items-center justify-between gap-2 min-w-0 ${
                          isCompactBays
                            ? 'px-2.5 py-2 sm:px-3 sm:py-2.5'
                            : 'px-3 py-2.5 sm:px-3.5 sm:py-3'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-dashed border-white/[0.12] bg-[#171a21]/70 flex items-center justify-center text-zinc-500 flex-shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-mono text-zinc-500 truncate">
                              Waiting...
                            </p>
                            <p
                              className="text-[9px] font-mono uppercase tracking-wider text-zinc-600"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              Bay 0{idx + 1}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${
                            isUnlockedExtra
                              ? 'text-amber-300/85 bg-amber-500/10 border-amber-500/25'
                              : 'text-zinc-500 bg-white/[0.02] border-white/[0.06]'
                          }`}
                        >
                          {isUnlockedExtra ? 'Opened' : 'Open'}
                        </span>
                      </motion.div>
                    )
                  }

                  const isDisconnected = player.is_connected === false

                  return (
                    <motion.div
                      key={player.name || `player-slot-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.94, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={TACTILE_SPRING}
                      className={`rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 min-w-0 ${
                        isCompactBays
                          ? 'px-2.5 py-2 sm:px-3 sm:py-2.5'
                          : 'px-3 py-2.5 sm:px-3.5 sm:py-3'
                      }`}
                      style={{
                        backgroundColor: isMe ? '#1a222c' : '#13161e',
                        backgroundImage: isMe
                          ? 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 65%)'
                          : player.is_host
                            ? 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 65%)'
                            : undefined,
                        border: isMe
                          ? '1px solid rgba(16, 185, 129, 0.34)'
                          : player.is_ready
                            ? '1px solid rgba(16, 185, 129, 0.22)'
                            : '1px solid rgba(255,255,255,0.07)',
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Keycap Monogram Avatar */}
                        <div
                          className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs text-[#e2e8f0] flex-shrink-0"
                          style={{
                            background: 'linear-gradient(180deg, #282e3d 0%, #1e2330 100%)',
                            boxShadow:
                              '0 2px 0 #0d0f14, inset 0 1px 0 rgba(255,255,255,0.12)',
                            border: `1px solid ${accent.ring}`,
                          }}
                        >
                          {initials}
                          <span
                            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accent.dot }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#e2e8f0] truncate">
                              {player.name}
                            </span>
                            {isMe && (
                              <span className="text-[9px] font-mono font-bold uppercase px-1 py-0 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex-shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            Bay 0{idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center flex-shrink-0">
                        {isDisconnected ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 text-[9px] font-mono font-bold uppercase">
                            <UserX className="w-2.5 h-2.5" />
                            Away
                          </span>
                        ) : player.is_host ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-mono font-bold uppercase">
                            <Crown className="w-2.5 h-2.5" />
                            Host
                          </span>
                        ) : player.is_ready ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold uppercase">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.07] text-zinc-400 text-[9px] font-mono uppercase">
                            Wait
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* 3. Centered Larger Start Game / Ready Up Dock */}
          <div className="flex flex-col items-center gap-2 pt-0.5">
            {isHost ? (
              <motion.button
                type="button"
                disabled={!canStart || starting}
                whileHover={canStart && !starting ? { y: -1, scale: 1.01 } : undefined}
                whileTap={canStart && !starting ? { scale: 0.98, y: 2 } : undefined}
                transition={TACTILE_SPRING}
                onClick={() => {
                  audio.playTilePress()
                  onStart()
                }}
                className={`w-full max-w-[340px] sm:max-w-[420px] py-3.5 sm:py-4 px-8 rounded-2xl font-mono font-extrabold text-sm sm:text-base uppercase tracking-[0.18em] flex items-center justify-center gap-3 outline-none ${
                  canStart && !starting
                    ? 'text-[#fffbeb] cursor-pointer'
                    : 'text-zinc-500 cursor-not-allowed opacity-65'
                }`}
                style={
                  canStart && !starting
                    ? KEYCAP_AMBER_STYLE
                    : {
                        background: '#12151c',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.65)',
                      }
                }
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>{starting ? 'Dealing Cards...' : 'Start Game'}</span>
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98, y: 2 }}
                transition={TACTILE_SPRING}
                onClick={() => {
                  audio.playTilePress()
                  onReady()
                }}
                className="w-full max-w-[340px] sm:max-w-[420px] py-3.5 sm:py-4 px-8 rounded-2xl font-mono font-extrabold text-sm sm:text-base uppercase tracking-[0.16em] text-[#fffbeb] flex items-center justify-center gap-3 cursor-pointer outline-none"
                style={me?.is_ready ? KEYCAP_EMERALD_STYLE : KEYCAP_AMBER_STYLE}
              >
                {me?.is_ready ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Ready · Click to Unready</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Click to Ready Up</span>
                  </>
                )}
              </motion.button>
            )}

            <p className="text-[11px] font-mono text-zinc-400 text-center px-2 leading-snug">
              {statusText}
            </p>
          </div>
        </motion.section>
      </main>

      {/* ── Bottom Smooth Hints Bar (Feathered smooth background, smooth transitions, NO highlighted text) ── */}
      <footer
        onClick={handleCycleHint}
        onMouseEnter={() => setIsHintPaused(true)}
        onMouseLeave={() => setIsHintPaused(false)}
        className="relative z-10 w-full max-w-3xl mx-auto flex-shrink-0 py-1.5 sm:py-2 px-5 sm:px-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none"
        title="Click for next game hint"
      >
        {/* Seamless edge-feathered smooth background (no hard box edges) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 72% 110% at 50% 50%, rgba(28, 32, 42, 0.55) 0%, rgba(20, 23, 30, 0.22) 60%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          }}
        />

        {/* Ultra-gentle smooth ambient drift */}
        <motion.div
          animate={{ opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 46% 90% at 50% 50%, rgba(148, 163, 184, 0.08) 0%, transparent 75%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
        />

        {/* Feathered top/bottom hairlines */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

        {/* Un-highlighted calm hint text with smooth crossfade + glide */}
        <div className="relative z-10 min-h-[30px] sm:min-h-[20px] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={hintIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] sm:text-xs font-mono text-zinc-400 font-normal text-center leading-snug select-none"
            >
              {BINGO_HINTS[hintIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtle interactive progress dots (calm neutral slate, no glow) */}
        <div className="relative z-10 flex items-center gap-1.5">
          {BINGO_HINTS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => handleSelectHint(e, i)}
              aria-label={`Show hint ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === hintIndex
                  ? 'w-3.5 bg-zinc-400/75'
                  : 'w-1 bg-zinc-600/60 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  )
}

export default BingoLobby
