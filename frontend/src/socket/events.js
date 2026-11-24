/**
 * FILE: frontend/src/socket/events.js
 * PURPOSE: Single source of truth for ALL Socket.IO event name strings.
 *          Import EVENTS from here everywhere — never use raw string literals.
 *
 * WHY THIS EXISTS:
 *   If a string is typed wrong in one place, it silently fails (no error).
 *   By using EVENTS.CREATE_ROOM everywhere, a typo becomes a JS ReferenceError
 *   that is caught immediately in development.
 *
 * USAGE:
 *   import { EVENTS } from '../socket/events'
 *   socket.emit(EVENTS.CREATE_ROOM, { game: 'ludo', player_name: 'BlueFox' })
 *   socket.on(EVENTS.ROOM_CREATED, (data) => { ... })
 *
 * MUST MATCH the backend socket_handler.py event strings exactly.
 */

export const EVENTS = {
  // ── Client → Server ────────────────────────────────────────────────────────
  CREATE_ROOM:    'create_room',
  JOIN_ROOM:      'join_room',
  RECONNECT_ROOM: 'reconnect_room',
  LEAVE_ROOM:     'leave_room',
  TOGGLE_READY:   'toggle_ready',
  START_GAME:     'start_game',
  GAME_ACTION:    'game_action',
  CHAT_MESSAGE:   'chat_message',
  PLAY_AGAIN:     'play_again',

  // ── Server → Client (unicast — to one socket) ───────────────────────────────
  ROOM_CREATED:   'room_created',
  ROOM_JOINED:    'room_joined',
  ROOM_ERROR:     'room_error',
  ERROR:          'error',

  // ── Server → Client (broadcast — to entire room) ────────────────────────────
  PLAYER_JOINED:        'player_joined',
  PLAYER_LEFT:          'player_left',
  PLAYER_READY_CHANGED: 'player_ready_changed',
  PLAYER_DISCONNECTED:  'player_disconnected',
  PLAYER_RECONNECTED:   'player_reconnected',
  GAME_STARTED:         'game_started',
  GAME_STATE_UPDATE:    'game_state_update',
  GAME_OVER:            'game_over',
  CHAT_BROADCAST:       'chat_broadcast',
  ROOM_RESET:           'room_reset',
}
