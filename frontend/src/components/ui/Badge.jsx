/**
 * FILE: frontend/src/components/ui/Badge.jsx
 * PURPOSE: Hardware LED status pill/tag shown next to player names and in the lobby.
 */

import clsx from 'clsx'

const STYLES = {
  host:         'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  ready:        'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  online:       'bg-amber-500/10 text-[#f2ece1] border border-white/[0.08]',
  disconnected: 'bg-red-500/15 text-red-300 border border-red-500/30',
}

const LABELS = {
  host:         '★ HOST',
  ready:        '✓ READY',
  online:       '● LIVE',
  disconnected: '● AWAY',
}

export default function Badge({ variant = 'online', label }) {
  return (
    <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase', STYLES[variant] || STYLES.online)}>
      {label || LABELS[variant] || variant}
    </span>
  )
}
