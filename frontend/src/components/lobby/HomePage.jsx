/**
 * FILE: frontend/src/components/lobby/HomePage.jsx
 * PURPOSE: Landing page — the first page users see. Shows the game picker
 *          and allows users to edit their display name.
 *
 * LAYOUT (see IMPLEMENTATION_PLAN.md §9.4):
 *   - LobbyLayout (particle background)
 *   - Title "🎮 GameZone" in Nunito font, gradient text
 *   - Subtitle tagline
 *   - 2×2 grid of GameCard components (one per game)
 *   - Inline name editor: "Your name: [BlueFox42] ✏️"
 *
 * FLOW:
 *   1. User sees the page → useLocalPlayer() loads/generates their name
 *   2. User clicks a GameCard → GameCard opens the game's modal
 *      (CreateRoomModal or JoinRoomModal, controlled within GameCard)
 *   3. After successful create_room/join_room → socket handler navigates to /room/:id
 *
 * SOCKET CONNECTION:
 *   useSocket() is called here so the WebSocket connects when the user lands
 *   on the page (before they've picked a game). This avoids a connection delay
 *   when they actually try to create/join a room.
 *
 * NAME EDITING:
 *   The name input is an inline text field that edits on click.
 *   On blur or Enter: validates (1–20 chars) and calls setName().
 *   Name is saved to localStorage immediately.
 */

import { useState } from 'react'
import { useLocalPlayer } from '../../hooks/useLocalPlayer'
import { useSocket }      from '../../hooks/useSocket'
import LobbyLayout  from '../layout/LobbyLayout'
import GameCard     from './GameCard'
import { GAMES }    from '../../config/games'
import Toast        from '../ui/Toast'

export default function HomePage() {
  const { name, setName } = useLocalPlayer()
  const { connected }     = useSocket()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]     = useState('')
  const [toast, setToast]             = useState(null)

  function startEdit() {
    setNameInput(name || '')
    setEditingName(true)
  }

  function saveName() {
    const trimmed = nameInput.trim().slice(0, 20)
    if (trimmed.length > 0) setName(trimmed)
    setEditingName(false)
  }

  return (
    <LobbyLayout>
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="font-game text-7xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎮 GameZone
        </h1>
        <p className="text-slate-400 text-lg">
          Pick a game, make a room, share the code, play.
        </p>
        {!connected && (
          <p className="text-yellow-400 text-sm mt-2">⟳ Connecting to server...</p>
        )}
      </div>

      {/* 2×2 Game card grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-10">
        {GAMES.map(game => (
          <GameCard
            key={game.id}
            game={game}
            playerName={name}
            onError={(msg) => setToast({ message: msg, type: 'error' })}
          />
        ))}
      </div>

      {/* Inline name editor */}
      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-slate-500">Your name:</span>
        {editingName ? (
          <input
            autoFocus
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nameInput}
            maxLength={20}
            onChange={e => setNameInput(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
          />
        ) : (
          <button onClick={startEdit} className="font-semibold text-white hover:text-blue-400 transition-colors flex items-center gap-1">
            {name || '...'} <span className="text-slate-500">✏️</span>
          </button>
        )}
      </div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </LobbyLayout>
  )
}
