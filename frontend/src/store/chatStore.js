/**
 * FILE: frontend/src/store/chatStore.js
 * PURPOSE: Zustand store for the in-room chat system.
 *
 * STATE:
 *   messages    : Array of ChatMessage objects (max 100).
 *                 { from_name: string, text: string, timestamp: number }
 *   isOpen      : Whether the chat drawer panel is currently visible.
 *   unreadCount : How many new messages arrived while the drawer was closed.
 *                 Shown as a badge on the chat toggle button.
 *
 * ACTIONS:
 *   addMessage(msg)   — appends a message; trims to 100; increments unreadCount
 *                       if drawer is closed.
 *   setMessages(msgs) — bulk-replace (used when joining a room with chat history)
 *   setOpen(bool)     — toggle the drawer open/closed
 *   markRead()        — reset unreadCount to 0 (called when drawer is opened)
 *   clearChat()       — reset all state (called on clearRoom)
 *
 * USAGE:
 *   const { messages, unreadCount, isOpen } = useChatStore()
 *   const addMessage = useChatStore(s => s.addMessage)
 */

import { create } from 'zustand'

const MAX_MESSAGES = 100

export const useChatStore = create((set, get) => ({
  messages: [],
  isOpen: false,
  unreadCount: 0,

  addMessage: (msg) =>
    set((state) => {
      const updated = [...state.messages, msg].slice(-MAX_MESSAGES)
      return {
        messages: updated,
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      }
    }),

  setMessages: (msgs) => set({ messages: msgs.slice(-MAX_MESSAGES) }),

  setOpen: (isOpen) =>
    set({ isOpen, unreadCount: isOpen ? 0 : get().unreadCount }),

  markRead: () => set({ unreadCount: 0 }),

  clearChat: () => set({ messages: [], isOpen: false, unreadCount: 0 }),
}))
