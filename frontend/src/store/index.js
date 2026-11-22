/**
 * FILE: frontend/src/store/index.js
 * PURPOSE: Re-exports all Zustand stores from one import path.
 *
 * USAGE (in any component):
 *   import { usePlayerStore, useRoomStore, useChatStore } from '../store'
 *
 * WHY THIS EXISTS:
 *   Prevents long relative import paths like '../../store/playerStore'.
 *   Any component can just do: import { useRoomStore } from '../../store'
 */

export { usePlayerStore } from './playerStore'
export { useRoomStore }   from './roomStore'
export { useChatStore }   from './chatStore'
