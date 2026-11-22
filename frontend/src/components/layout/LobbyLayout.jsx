/**
 * FILE: frontend/src/components/layout/LobbyLayout.jsx
 * PURPOSE: Full-screen layout wrapper for pre-game pages (HomePage, RoomLobby).
 *          Provides the animated particle field background + centered content area.
 *
 * WHAT IT RENDERS:
 *   - Full-viewport dark background (--bg-primary)
 *   - 30 animated floating dot particles (pure CSS, no library)
 *     Each dot has randomized: position (top/left %), size (2–4px),
 *     opacity (0.1–0.3), animation duration (8–20s).
 *   - A centered content column where {children} are rendered.
 *
 * PARTICLE IMPLEMENTATION (see IMPLEMENTATION_PLAN.md §9.3, §2.8):
 *   Particles are generated once with useMemo so they don't re-randomize
 *   on every render. Each particle is a plain <div> with the .particle
 *   class (defined in index.css) and inline CSS for position/size/opacity/duration.
 *
 * USAGE:
 *   export default function HomePage() {
 *     return (
 *       <LobbyLayout>
 *         <h1>GameZone</h1>
 *         ...
 *       </LobbyLayout>
 *     )
 *   }
 */

import { useMemo } from 'react'

export default function LobbyLayout({ children }) {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top:      `${Math.random() * 100}%`,
      left:     `${Math.random() * 100}%`,
      size:     `${Math.random() * 2 + 2}px`,   // 2–4px
      opacity:  (Math.random() * 0.2 + 0.1).toFixed(2),  // 0.1–0.3
      duration: `${Math.random() * 12 + 8}s`,   // 8–20s
    })),
  [])

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Particle field */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            top:          p.top,
            left:         p.left,
            width:        p.size,
            height:       p.size,
            opacity:      p.opacity,
            '--duration': p.duration,
          }}
        />
      ))}

      {/* Page content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
