/**
 * FILE: frontend/src/components/lobby/AssignNameModal.jsx
 * PURPOSE: Welcome and name assignment modal shown to new visitors on entry,
 *          or when clicking to change their player name.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Dices, ArrowRight, Check } from 'lucide-react'
import { usePlayerStore } from '../../store'
import { generateName } from '../../utils/nameGenerator'
import { setNameConfirmed } from '../../utils/localStorage'
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

    setName(trimmed)
    setNameConfirmed(true)
    onClose()
  }

  if (!isOpen) return null

  // Compute color index for avatar preview based on name hash
  const colorIndex = (nameInput.charCodeAt(0) || 0) % 6

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (nameInput.trim()) handleConfirm()
          }}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-200 mb-3 shadow-inner">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Welcome to GameZone
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Choose your player name to join and create game rooms.
            </p>
          </div>

          {/* Avatar live preview */}
          <div className="flex items-center justify-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl mb-5">
            <Avatar name={nameInput || '?'} index={colorIndex} size="md" />
            <div className="text-left">
              <p className="text-xs text-zinc-500 font-medium">Player Tag Preview</p>
              <p className="text-sm font-semibold text-zinc-200 font-mono truncate max-w-[200px]">
                {nameInput || 'Enter your name...'}
              </p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={handleRandomize}
                  title="Randomize name"
                  className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 rounded-xl text-zinc-300 hover:text-white transition-all flex items-center justify-center group"
                >
                  <Dices className="w-5 h-5 group-hover:rotate-45 transition-transform duration-200" />
                </button>
              </div>
              {error ? (
                <p className="text-xs text-red-400 mt-1.5">{error}</p>
              ) : (
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  1–20 characters. You can change this anytime from the menu.
                </p>
              )}
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.99]"
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
