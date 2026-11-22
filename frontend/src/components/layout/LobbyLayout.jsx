/**
 * FILE: frontend/src/components/layout/LobbyLayout.jsx
 * PURPOSE: Full-screen layout wrapper for pre-game pages (HomePage, RoomLobby).
 *          Provides a clean, minimal dark aesthetic without harsh gradients.
 */

export default function LobbyLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Subtle modern background texture (minimal radial aura + fine grid) */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),rgba(0,0,0,0))] z-0" />
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-6xl w-full mx-auto">
        {children}
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-600 border-t border-zinc-900">
        <span>GameZone • Private multiplayer gaming rooms • Zero registration required</span>
      </footer>
    </div>
  )
}
