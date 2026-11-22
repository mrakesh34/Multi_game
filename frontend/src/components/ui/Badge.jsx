/**
 * FILE: frontend/src/components/ui/Badge.jsx
 * PURPOSE: Small status pill/tag shown next to player names and in the lobby.
 *
 * VARIANTS:
 *   "host"         → gold background, "Host" text
 *   "ready"        → green background, "Ready ✓" text
 *   "online"       → blue dot + "Online"
 *   "disconnected" → red dot + "Disconnected"
 *
 * PROPS:
 *   variant : string — one of the variants above
 *   label   : string — optional override for the displayed text
 *
 * USAGE:
 *   <Badge variant="host" />
 *   <Badge variant="ready" />
 *   <Badge variant="disconnected" />
 */

import clsx from 'clsx'

const STYLES = {
  host:         'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  ready:        'bg-green-500/20 text-green-400 border border-green-500/30',
  online:       'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  disconnected: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const LABELS = {
  host:         '★ Host',
  ready:        '✓ Ready',
  online:       '● Online',
  disconnected: '● Away',
}

export default function Badge({ variant = 'online', label }) {
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', STYLES[variant] || STYLES.online)}>
      {label || LABELS[variant] || variant}
    </span>
  )
}
