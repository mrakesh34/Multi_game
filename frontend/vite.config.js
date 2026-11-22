import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * FILE: frontend/vite.config.js
 * PURPOSE: Vite build tool configuration.
 *
 * KEY SETTINGS:
 *   - react() plugin: enables JSX transform + fast-refresh in dev mode
 *   - server.proxy: proxies /socket.io/* WebSocket requests to the backend
 *     at port 8000. This avoids CORS issues during local development.
 *     In production, the reverse proxy (nginx/caddy) handles this instead.
 *   - server.port: frontend dev server listens on 5173 (Vite default)
 *
 * PROXY RULE:
 *   Any request from the browser to /socket.io/... is forwarded to
 *   http://localhost:8000. ws:true enables WebSocket upgrade proxying.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
