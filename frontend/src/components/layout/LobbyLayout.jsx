/**
 * FILE: frontend/src/components/layout/LobbyLayout.jsx
 * PURPOSE: Full-screen layout wrapper for HomePage and non-Bingo RoomLobby.
 *          Uses the matte TE-01 Tactile Console surface (#111318), subtle dot matrix,
 *          and ultra-subtle grain texture — zero purple/blue gradients.
 */

export default function LobbyLayout({ children }) {
  return (
    <div className="relative min-h-[100dvh] tabletop-surface text-[#f2ece1] flex flex-col justify-between selection:bg-[#e07a22] selection:text-[#fffaf0]">
      {/* Subtle tabletop dot matrix */}
      <div className="fixed inset-0 pointer-events-none tabletop-dots opacity-50 z-0" />

      {/* Ultra-subtle tactile surface grain */}
      <div className="fixed inset-0 pointer-events-none tabletop-grain z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 py-5 sm:py-7 max-w-5xl w-full mx-auto">
        {children}
      </div>

      {/* Hardware Footer */}
      <footer className="relative z-10 py-3.5 px-4 text-center text-[11px] font-mono text-[#8a919e] border-t border-white/[0.06] bg-[#0e1015]/70">
        <span>GAMEZONE // PRIVATE MULTIPLAYER TABLETOP · ZERO REGISTRATION REQUIRED</span>
      </footer>
    </div>
  )
}
