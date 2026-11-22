/**
 * FILE: frontend/src/hooks/useLocalPlayer.js
 * PURPOSE: Manages loading/saving the player's name from localStorage.
 *          On first visit, generates a random fun name and persists it.
 *          Exposes { name, setName } for the name editor on HomePage.
 *
 * LIFECYCLE:
 *   1. On mount: check localStorage for 'mgp_player_name'
 *   2. If found: set that as the name in playerStore
 *   3. If not found: generate a random name, persist it, set in store
 *
 * USAGE:
 *   const { name, setName } = useLocalPlayer()
 *   // name: current display name string
 *   // setName: function to update name + persist to localStorage
 *
 * NOTE: This hook does NOT connect to the socket. The name is just a UI
 *       preference stored locally. It is sent to the server when the player
 *       actually creates or joins a room.
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../store'
import { getPlayerName } from '../utils/localStorage'
import { generateName }   from '../utils/nameGenerator'

export function useLocalPlayer() {
  const name    = usePlayerStore(s => s.name)
  const setName = usePlayerStore(s => s.setName)

  useEffect(() => {
    if (!name) {
      const saved = getPlayerName()
      setName(saved || generateName())
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  return { name, setName }
}
