/**
 * FILE: frontend/src/components/lobby/GameCard.jsx
 * PURPOSE: TE-01 Tactile Console game selection card featuring real game artwork,
 *          recessed hardware bezel, spring lift hover, and keycap actions.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, LogIn } from 'lucide-react'
import { playKeyThock } from '../../utils/uiAudio'
import CreateRoomModal from './CreateRoomModal'
import JoinRoomModal from './JoinRoomModal'

export default function GameCard({ game, index = 0, playerName, onError }) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          delay: 0.06 + index * 0.045,
        }}
        whileHover={{ y: -4, transition: { type: 'spring', stiffness: 450, damping: 28 } }}
        className="group relative flex flex-col justify-between chassis-card rounded-2xl p-4 sm:p-5 overflow-hidden hover:border-white/[0.15] transition-colors"
      >
        {/* Top machined accent bar on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: game.accentColor }}
        />

        {/* Real Game Cover Viewport */}
        <div className="relative mb-4 rounded-xl overflow-hidden recessed-well aspect-[16/10]">
          <img
            src={game.image}
            alt={`${game.name} tabletop preview`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />

          {/* Subtle top-right hardware badges */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {game.badge && (
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#111318]/90 border border-white/[0.12] backdrop-blur-[2px]"
                style={{ color: game.accentColor }}
              >
                {game.badge}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-[#f2ece1] bg-[#111318]/90 px-2 py-0.5 rounded-md border border-white/[0.12] font-mono">
              <Users className="w-3 h-3 text-[#8a919e]" />
              {game.minPlayers === game.maxPlayers
                ? `${game.maxPlayers}P`
                : `${game.minPlayers}–${game.maxPlayers}P`}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-lg font-extrabold text-[#f2ece1] tracking-tight group-hover:text-amber-300 transition-colors">
              {game.name}
            </h3>
            <span className="text-[11px] font-mono text-[#8a919e]">{game.tagline}</span>
          </div>

          <p className="text-xs text-[#8a919e] line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Keycap Actions */}
        <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              playKeyThock(190)
              setShowCreate(true)
            }}
            className="keycap-primary flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playKeyThock(160)
              setShowJoin(true)
            }}
            className="keycap-btn py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#8a919e] group-hover:text-[#f2ece1]" />
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
