/**
 * FILE: frontend/src/components/lobby/GameCard.jsx
 * PURPOSE: Animated game selection card on the HomePage.
 *          Clicking it opens a modal with Create/Join options for that game.
 *
 * PROPS:
 *   game       : game config object from GAMES array in config/games.js
 *                { id, name, description, emoji, bgGradient, color, minPlayers, maxPlayers }
 *   playerName : current local player's name (passed down to modals)
 *   onError    : callback(message) for socket errors
 *
 * HOVER EFFECT (see IMPLEMENTATION_PLAN.md §9.4):
 *   3D tilt using CSS perspective + rotateX/rotateY.
 *   On mousemove: calculate cursor offset from card center → apply rotation.
 *   On mouseleave: reset transform to 0.
 *   CSS: transform: perspective(800px) rotateX(Xdeg) rotateY(Ydeg)
 *
 * CLICK FLOW:
 *   Click card → setShowModal(true) → overlay modal appears
 *   Modal has two buttons: "Create Room" and "Join Room" (with 3-digit input)
 *
 * SOCKET EVENTS EMITTED (via CreateRoomModal / JoinRoomModal):
 *   create_room → { game: game.id, player_name }
 *   join_room   → { room_id, player_name }
 */

import { useState, useRef } from 'react'
import CreateRoomModal from './CreateRoomModal'
import JoinRoomModal   from './JoinRoomModal'

export default function GameCard({ game, playerName, onError }) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)
  const [showMenu,   setShowMenu]   = useState(false)
  const cardRef = useRef(null)

  function handleMouseMove(e) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top  - rect.height / 2
    const rotX = -(y / rect.height) * 10
    const rotY =  (x / rect.width)  * 10
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`
  }

  function handleMouseLeave() {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <>
      <div
        ref={cardRef}
        className={`bg-gradient-to-br ${game.bgGradient} rounded-2xl p-5 cursor-pointer transition-transform duration-100 border border-white/10 hover:border-white/20 shadow-xl`}
        style={{ transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowMenu(true)}
      >
        <div className="text-4xl mb-2">{game.emoji}</div>
        <h3 className="font-game text-xl font-bold text-white">{game.name}</h3>
        <p className="text-sm text-white/60 mt-1">{game.description}</p>
        <p className="text-xs text-white/40 mt-2">{game.minPlayers}–{game.maxPlayers} players</p>
      </div>

      {/* Quick menu modal */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowMenu(false)}>
          <div className="glass-card p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">{game.emoji}</div>
              <h2 className="font-game text-2xl font-bold text-white">{game.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{game.minPlayers}–{game.maxPlayers} players</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                onClick={() => { setShowMenu(false); setShowCreate(true) }}
              >
                Create Room
              </button>
              <button
                className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 text-white font-semibold transition-colors"
                onClick={() => { setShowMenu(false); setShowJoin(true) }}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

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
