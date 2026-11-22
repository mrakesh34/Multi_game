/**
 * FILE: frontend/src/store/roomStore.js
 * PURPOSE: Zustand store for the active game room state.
 *          Shared across all components that need room/game information.
 *
 * STATE:
 *   roomId     : "000"–"999" string, or null if not in a room
 *   game       : "ludo" | "bingo" | "chess" | "uno" | null
 *   status     : "waiting" | "playing" | "finished" | null
 *   players    : Array of Player objects from the server (all players in room)
 *   gameState  : Full game state dict from the server, or null before game starts.
 *                Updated on every game_state_update event.
 *
 * ACTIONS:
 *   setRoom({ roomId, game, status })   — called after create_room / join_room success
 *   setPlayers(players)                — called on player_joined / player_left / etc.
 *   setStatus(status)                  — called when game_started / game_over received
 *   setGameState(gameState)            — called on game_state_update event
 *   clearRoom()                        — resets everything (navigate home / leave room)
 *
 * USAGE:
 *   const { roomId, players } = useRoomStore()
 *   const setGameState = useRoomStore(s => s.setGameState)
 */

import { create } from 'zustand'

export const useRoomStore = create((set) => ({
  roomId:    null,
  game:      null,
  status:    null,
  players:   [],
  gameState: null,

  setRoom:      ({ roomId, game, status }) => set({ roomId, game, status }),
  setPlayers:   (players)   => set({ players }),
  setStatus:    (status)    => set({ status }),
  setGameState: (gameState) => set({ gameState }),
  clearRoom:    ()          => set({ roomId: null, game: null, status: null, players: [], gameState: null }),
}))
