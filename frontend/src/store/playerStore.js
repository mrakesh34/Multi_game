/**
 * FILE: frontend/src/store/playerStore.js
 * PURPOSE: Zustand store for the LOCAL player's identity.
 *          Tracks the current user's name, socket ID, and color index.
 *
 * STATE:
 *   name       : Display name (loaded from localStorage or generated randomly)
 *   socketId   : The current socket.io SID assigned by the server on connect.
 *                Used to determine "is this me?" when rendering player lists.
 *   colorIndex : Color assigned by the server in the room (0–5)
 *
 * ACTIONS:
 *   setName(name)         — update display name (also persists to localStorage)
 *   setSocketId(id)       — called in useSocket.js after socket connects
 *   setColorIndex(index)  — called after joining a room (from room_joined payload)
 *   reset()               — clear all state (called on leave room / home navigation)
 *
 * HOW TO READ:
 *   const { name, socketId } = usePlayerStore()
 *
 * HOW TO WRITE:
 *   const setName = usePlayerStore(s => s.setName)
 *   setName('NewName')
 */

import { create } from 'zustand'
import { setPlayerName } from '../utils/localStorage'

export const usePlayerStore = create((set) => ({
  name:       null,
  socketId:   null,
  colorIndex: 0,

  setName: (name) => {
    setPlayerName(name)        // persist to localStorage
    set({ name })
  },
  setSocketId:   (socketId)   => set({ socketId }),
  setColorIndex: (colorIndex) => set({ colorIndex }),
  reset:         ()           => set({ name: null, socketId: null, colorIndex: 0 }),
}))
