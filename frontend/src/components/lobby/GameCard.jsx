/**
 * FILE: frontend/src/components/lobby/GameCard.jsx
 * PURPOSE: Minimal, responsive game selection card on the HomePage.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, LogIn } from 'lucide-react'
import CreateRoomModal from './CreateRoomModal'
import JoinRoomModal from './JoinRoomModal'

export default function GameCard({ game, playerName, onError }) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative flex flex-col justify-between bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all shadow-sm hover:shadow-xl hover:shadow-black/40 overflow-hidden"
      >
        {/* Subtle accent line on hover */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: game.accentColor }}
        />

        {/* Top meta */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-3xl p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
              {game.emoji}
            </span>
            <div className="flex items-center gap-2">
              {game.badge && (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {game.badge}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-full border border-zinc-700/40 font-mono">
                <Users className="w-3 h-3 text-zinc-400" />
                {game.minPlayers}–{game.maxPlayers}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {game.name}
          </h3>
          <p className="text-xs text-zinc-400 font-medium mb-1">{game.tagline}</p>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-zinc-800/60">
          <button
            onClick={() => setShowCreate(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Join</span>
          </button>
        </div>
      </motion.div>

      <CreateRoomModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        game={game}
        playerName={playerName}
        onError={onError}
      />
      <JoinRoomModal
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        game={game}
        playerName={playerName}
        onError={onError}
      />
    </>
  )
}
