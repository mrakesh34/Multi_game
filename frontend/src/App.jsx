/**
 * FILE: frontend/src/App.jsx
 * PURPOSE: Root component — sets up React Router and defines all application routes.
 *
 * ROUTES:
 *   "/"              → HomePage      — game picker landing page
 *   "/room/:roomId"  → RoomLobby     — waiting room before the game starts
 *   "/game/:roomId"  → GameLayout    — in-game view (lazy-loads the correct game)
 *
 * ROUTE PROTECTION:
 *   RoomLobby and GameLayout check the roomStore for an active room.
 *   If none exists (e.g. user typed URL directly), they redirect to "/".
 *
 * LAZY LOADING:
 *   Game components (LudoGame, BingoGame, etc.) are lazy-loaded via React.lazy()
 *   inside GameLayout.jsx to keep the initial bundle small.
 *
 * HOW TO ADD A NEW ROUTE:
 *   1. Create the page component in src/components/ or src/games/
 *   2. Add a <Route path="..." element={<YourComponent />} /> below
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage    from './components/lobby/HomePage.jsx'
import RoomLobby   from './components/room/RoomLobby.jsx'
import GameLayout  from './components/layout/GameLayout.jsx'
import { useSocket } from './hooks/useSocket.js'

export default function App() {
  // Keep socket connection active continuously across all page transitions
  useSocket()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/room/:roomId"  element={<RoomLobby />} />
        <Route path="/game/:roomId"  element={<GameLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
