/**
 * FILE: frontend/src/components/ui/Avatar.jsx
 * PURPOSE: Keycap monogram avatar showing a player's initials in warm
 *          hardware-harmonized pigments (no neon purple/blue).
 */

import clsx from 'clsx'

const COLORS = [
  '#d9482b', // terracotta crimson
  '#3b6e8c', // anodized slate-teal
  '#059669', // sage emerald
  '#d97706', // signal amber
  '#b45309', // burnished copper
  '#be4b68', // warm rosewood
]

const SIZES = {
  sm: 'w-8 h-8 text-xs rounded-lg',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-14 h-14 text-lg rounded-2xl',
}

export default function Avatar({ name = '?', size = 'md', index = 0 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase()
  const bg = COLORS[Math.abs(index) % COLORS.length]

  return (
    <div
      className={clsx(
        'flex items-center justify-center font-mono font-bold text-[#fffaf0] flex-shrink-0 border border-white/15 shadow-[0_2px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.22)]',
        SIZES[size] || SIZES.md
      )}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </div>
  )
}
