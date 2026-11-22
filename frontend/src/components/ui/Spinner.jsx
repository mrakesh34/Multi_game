/**
 * FILE: frontend/src/components/ui/Spinner.jsx
 * PURPOSE: Small CSS-animated loading spinner.
 *          Used inside Button (loading state) and wherever an async operation
 *          is pending (e.g. connecting to backend, joining a room).
 *
 * PROPS:
 *   size  : "sm" | "md" | "lg"  (default: "md")
 *           sm → 16px, md → 24px, lg → 32px
 *
 * ANIMATION:
 *   Simple CSS border-spin — a circle with one colored border segment,
 *   rotated continuously with Tailwind's animate-spin class.
 *
 * USAGE:
 *   <Spinner />
 *   <Spinner size="lg" />
 */

import clsx from 'clsx'

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export default function Spinner({ size = 'md' }) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full border-transparent border-t-current animate-spin',
        SIZES[size]
      )}
      aria-label="Loading"
    />
  )
}
