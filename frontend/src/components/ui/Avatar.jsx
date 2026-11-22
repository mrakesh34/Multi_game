/**
 * FILE: frontend/src/components/ui/Avatar.jsx
 * PURPOSE: Colored circular avatar showing a player's initials.
 *          Used in PlayerSlot, ChatMessage, and player status displays.
 *
 * PROPS:
 *   name   : string — player name; first 2 characters used as initials
 *   size   : "sm" | "md" | "lg"  (default: "md")
 *            sm → 32px, md → 40px, lg → 56px
 *   index  : number — color index (0–5) used to pick background color
 *            Cycles through 6 preset colors (see COLORS below).
 *            Defaults to 0 (red).
 *
 * COLORS (see IMPLEMENTATION_PLAN.md §9.11):
 *   0: red, 1: blue, 2: green, 3: amber, 4: purple, 5: pink
 *
 * USAGE:
 *   <Avatar name="BlueFox42" index={1} />
 *   <Avatar name="RedTiger99" size="sm" index={0} />
 */

import clsx from 'clsx'

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
]

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export default function Avatar({ name = '?', size = 'md', index = 0 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase()
  const bg = COLORS[index % COLORS.length]

  return (
    <div
      className={clsx('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0', SIZES[size])}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </div>
  )
}
