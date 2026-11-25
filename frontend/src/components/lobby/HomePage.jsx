/**
 * FILE: frontend/src/components/lobby/HomePage.jsx
 * PURPOSE: TE-01 Tactile Console Home Hub with middle-top Quick Join Console,
 *          real game artwork cards, upcoming modules teaser, and crisp SFX.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Volume2, VolumeX, Edit3, PlusCircle } from 'lucide-react'
import { useLocalPlayer } from '../../hooks/useLocalPlayer'
import { useSocket } from '../../hooks/useSocket'
import { useRoomStore, usePlayerStore, useChatStore } from '../../store'
import { isNameConfirmed, getSoundEnabled, setSoundEnabled } from '../../utils/localStorage'
import { isValidRoomId } from '../../utils/roomCode'
import { playKeyThock, playFlipClack } from '../../utils/uiAudio'
import { GAMES } from '../../config/games'
import { EVENTS } from '../../socket/events'
import socket from '../../socket/socket'
import LobbyLayout from '../layout/LobbyLayout'
import GameCard from './GameCard'
import AssignNameModal from './AssignNameModal'
import Toast from '../ui/Toast'
import Avatar from '../ui/Avatar'

export default function HomePage() {
  const { name } = useLocalPlayer()
  const { connected } = useSocket()
  const navigate = useNavigate()

  const setRoom = useRoomStore((s) => s.setRoom)
  const setPlayers = useRoomStore((s) => s.setPlayers)
  const setColorIndex = usePlayerStore((s) => s.setColorIndex)
  const setMessages = useChatStore((s) => s.setMessages)

  const [showNameModal, setShowNameModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled())

  // Quick Join Room state (supports 3 to 6 alphanumeric room codes, focused on 3-digit quick slots + input)
  const [quickCode, setQuickCode] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)
  const [shakeQuick, setShakeQuick] = useState(false)
  const quickInputRef = useRef(null)

  useEffect(() => {
    if (!isNameConfirmed()) {
      setShowNameModal(true)
    }
  }, [])

  function toggleSound() {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
    if (next) playKeyThock(195)
  }

  function triggerQuickJoin(e) {
    e?.preventDefault()
    const code = quickCode.trim()
    if (!isValidRoomId(code)) {
      setShakeQuick(true)
      setTimeout(() => setShakeQuick(false), 400)
      setToast({ message: 'Enter a valid 3 to 6 character room code (e.g. 742)', type: 'error' })
      quickInputRef.current?.focus()
      return
    }
    if (!name) {
      setShowNameModal(true)
      return
    }

    playKeyThock(210)
    if (!socket.connected) {
      socket.connect()
    }
    setQuickLoading(true)

    function onJoined(data) {
      socket.off(EVENTS.ROOM_ERROR, onRoomError)
      playFlipClack()
      setRoom({ roomId: data.room_id, game: data.game, status: 'waiting' })
      setPlayers(data.players)
      setMessages(data.chat_log || [])
      const me = data.players.find((p) => p.name === name)
      if (me) setColorIndex(me.color_index)
      navigate(`/${data.game}/room/${data.room_id}`)
    }

    function onRoomError(data) {
      socket.off(EVENTS.ROOM_JOINED, onJoined)
      setToast({ message: data.message || 'Could not join room', type: 'error' })
      setQuickLoading(false)
    }

    socket.once(EVENTS.ROOM_JOINED, onJoined)
    socket.once(EVENTS.ROOM_ERROR, onRoomError)
    socket.emit(EVENTS.JOIN_ROOM, { room_id: code, player_name: name })
  }

  const colorIndex = (name?.charCodeAt(0) || 0) % 6
  const codeChars = Array.from({ length: Math.max(3, Math.min(6, quickCode.length || 3)) }, (_, i) => quickCode[i] || '')

  return (
    <LobbyLayout>
      {/* ── Top Hardware Console Bar ── */}
      <header className="w-full flex items-center justify-between gap-3 px-4 py-2.5 mb-6 rounded-2xl bg-[#171a21]/95 border border-white/[0.06] shadow-[0_10px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]">
        {/* Brand Emblem */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm text-[#fffaf0] relative flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, #e58127 0%, #c86411 100%)',
              boxShadow: '0 3px 0 #7c3a06, inset 0 1px 0 rgba(255,255,255,0.28)',
              border: '1px solid rgba(255,204,145,0.45)',
            }}
          >
            GZ
            <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#fffaf0]/90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f2ece1] text-base tracking-tight">GameZone</span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0c0e13] border border-white/[0.06] text-[#8a919e]">
                Tabletop
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Connection LED, Sound Switch, Player Keycap */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0c0e13] border border-white/[0.06] text-[11px] font-mono text-[#8a919e]">
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.85)] animate-pulse" />
                <span className="text-[#f2ece1]">LIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#e07a22] animate-pulse" />
                <span>SYNC...</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl keycap-btn flex items-center justify-center text-[#8a919e] hover:text-[#f2ece1]"
            title={soundOn ? 'Mute UI & game audio' : 'Enable UI & game audio'}
            aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#e07a22]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              playKeyThock(175)
              setShowNameModal(true)
            }}
            className="keycap-btn flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
          >
            <Avatar name={name || 'Player'} index={colorIndex} size="sm" />
            <span className="font-mono font-semibold text-[#f2ece1] truncate max-w-[100px] sm:max-w-[130px]">
              {name || 'Set Name'}
            </span>
            <Edit3 className="w-3 h-3 text-[#8a919e] hidden sm:inline" />
          </button>
        </div>
      </header>

      {/* ── Middle-Top Hero & Dedicated Quick Join Room Console ── */}
      <section className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-8">
        {/* Middle-Top Quick Join Room Module */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="w-full max-w-md mb-7"
        >
          <motion.form
            onSubmit={triggerQuickJoin}
            animate={shakeQuick ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className="relative chassis-card rounded-2xl p-3.5 sm:p-4"
          >
            {/* Subtle corner screws */}
            {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
              <span
                key={pos}
                className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-[#242935] border border-white/[0.08] pointer-events-none`}
              />
            ))}

            <div className="flex items-center justify-between px-1 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f2ece1]">
                  Quick Join Room
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8a919e]">ENTER CODE</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Clickable keycap digit bay */}
              <div
                onClick={() => quickInputRef.current?.focus()}
                className="relative flex-1 recessed-well rounded-xl px-3 py-2 flex items-center justify-center gap-2 cursor-text min-h-[52px]"
              >
                <input
                  ref={quickInputRef}
                  type="text"
                  maxLength={6}
                  aria-label="Enter room code"
                  value={quickCode}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
                    if (cleaned !== quickCode) playKeyThock(220)
                    setQuickCode(cleaned)
                  }}
                  placeholder="742"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                />

                {quickCode.length === 0 ? (
                  <div className="flex items-center gap-2 pointer-events-none select-none">
                    {['7', '4', '2'].map((ghost, idx) => (
                      <span
                        key={idx}
                        className="w-9 h-9 rounded-lg bg-[#171a21] border border-white/[0.06] flex items-center justify-center font-mono text-base font-bold text-zinc-600"
                      >
                        {ghost}
                      </span>
                    ))}
                    <span className="text-[11px] font-mono text-[#8a919e] ml-1 hidden xs:inline">
                      Type code...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 pointer-events-none select-none">
                    {codeChars.map((ch, idx) => (
                      <motion.span
                        key={`${idx}-${ch}`}
                        initial={ch ? { y: -4, scale: 0.92 } : false}
                        animate={{ y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                        className={`w-9 h-9 rounded-lg font-mono text-base font-black flex items-center justify-center border ${
                          ch
                            ? 'bg-[#232834] border-amber-500/40 text-[#fffaf0] shadow-[0_2px_0_#0c0e13]'
                            : 'bg-[#171a21] border-white/[0.05] text-zinc-600'
                        }`}
                      >
                        {ch || '·'}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={quickLoading}
                className="keycap-primary h-[52px] px-4 sm:px-5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-45"
              >
                <span>{quickLoading ? 'Joining' : 'Join'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.form>
        </motion.div>

        {/* Hero Copy (No mention of "four games") */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a21] border border-white/[0.08] text-[#e07a22] text-[11px] font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Private Multiplayer Rooms · Zero Login</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#f2ece1] tracking-tight leading-[1.12]">
            Play classic tabletop games together in seconds.
          </h1>

          <p className="text-[#8a919e] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Spin up a private room, share your code, and jump straight to the board from any device.
          </p>
        </motion.div>
      </section>

      {/* ── Game Library Grid ── */}
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
        {GAMES.map((game, idx) => (
          <GameCard
            key={game.id}
            game={game}
            index={idx}
            playerName={name}
            onError={(msg) => setToast({ message: msg, type: 'error' })}
          />
        ))}
      </section>

      {/* ── Future Expansions Strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="w-full rounded-2xl bg-[#171a21]/70 border border-dashed border-white/[0.09] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left mb-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg recessed-well flex items-center justify-center text-[#e07a22]">
            <PlusCircle className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[#f2ece1]">More tabletop games arriving soon</p>
            <p className="text-[11px] font-mono text-[#8a919e]">
              New multiplayer modules are actively in the workshop.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#0c0e13] border border-white/[0.06] text-[#8a919e]">
          LIBRARY EXPANDING
        </span>
      </motion.div>

      {/* Modals & Toast */}
      <AssignNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
      />

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
