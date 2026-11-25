/**
 * FILE: frontend/src/components/lobby/AssignNameModal.jsx
 * PURPOSE: Welcome and player tag assignment modal styled in TE-01 Tactile Console.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Dices, ArrowRight } from 'lucide-react'
import { usePlayerStore } from '../../store'
import { generateName } from '../../utils/nameGenerator'
import { setNameConfirmed } from '../../utils/localStorage'
import { playKeyThock, playFlipClack } from '../../utils/uiAudio'
import Avatar from '../ui/Avatar'

export default function AssignNameModal({ isOpen, onClose }) {
  const { name: currentName, setName } = usePlayerStore()
  const [nameInput, setNameInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNameInput(currentName || generateName())
      setError('')
    }
  }, [isOpen, currentName])

  function handleRandomize() {
    playFlipClack()
    setNameInput(generateName())
    setError('')
  }

  function handleConfirm(e) {
    e?.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) {
      setError('Please enter a display name.')
      return
    }
    if (trimmed.length > 20) {
      setError('Max 20 characters allowed.')
      return
    }

    playKeyThock(195)
    setName(trimmed)
    setNameConfirmed(true)
    onClose()
  }

  if (!isOpen) return null

  const colorIndex = (nameInput.charCodeAt(0) || 0) % 6

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-[#090a0d]/80 backdrop-blur-[4px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (nameInput.trim()) handleConfirm()
          }}
        />

        {/* Modal Chassis */}
        <motion.div
          className="relative w-full max-w-md bg-[#171a21] border border-white/[0.08] rounded-2xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.07)] z-10 overflow-hidden"
          initial={{ scale: 0.93, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 460, damping: 30 }}
        >
          {/* Top accent rail (amber, zero purple/blue) */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e07a22]/75" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-xl recessed-well flex items-center justify-center text-[#e07a22] mb-3">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-[#f2ece1] tracking-tight">
              Welcome to GameZone
            </h2>
            <p className="text-xs sm:text-sm text-[#8a919e] mt-1">
              Set your player tag before creating or joining a room.
            </p>
          </div>

          {/* Live Avatar Badge Preview */}
          <div className="flex items-center gap-3 p-3 recessed-well rounded-xl mb-5">
            <Avatar name={nameInput || '?'} index={colorIndex} size="md" />
            <div className="text-left min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a919e]">
                Player Tag Preview
              </p>
              <p className="text-sm font-bold text-[#f2ece1] font-mono truncate max-w-[220px]">
                {nameInput || 'Enter your name...'}
              </p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#8a919e] uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  maxLength={20}
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="e.g. ShadowFox"
                  className="flex-1 bg-[#0c0e13] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#f2ece1] placeholder-zinc-600 focus:outline-none focus:border-[#e07a22] focus:ring-1 focus:ring-[#e07a22]/40 font-medium shadow-[inset_0_2px_6px_rgba(0,0,0,0.65)] transition-all"
                />
                <button
                  type="button"
                  onClick={handleRandomize}
                  title="Randomize name"
                  className="keycap-btn px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-[#f2ece1] flex items-center justify-center group cursor-pointer"
                >
                  <Dices className="w-5 h-5 group-hover:rotate-45 transition-transform duration-200" />
                </button>
              </div>
              {error ? (
                <p className="text-xs font-mono text-[#f87171] mt-1.5">{error}</p>
              ) : (
                <p className="text-[11px] text-[#8a919e] mt-1.5">
                  1–20 characters. Editable anytime from the top bar.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="keycap-primary w-full py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue as {nameInput.trim() || 'Player'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
