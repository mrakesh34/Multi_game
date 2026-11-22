/**
 * FILE: frontend/src/components/ui/Button.jsx
 * PURPOSE: Reusable styled button component with multiple variants and states.
 *
 * PROPS:
 *   variant   : "primary" | "secondary" | "ghost"  (default: "primary")
 *               primary  → filled blue background
 *               secondary → transparent with colored border
 *               ghost    → no border, hover glow only
 *   size      : "sm" | "md" | "lg"  (default: "md")
 *   loading   : boolean — shows a spinner, disables click
 *   disabled  : boolean — greyed out, no interaction
 *   onClick   : function
 *   children  : React nodes (button label)
 *   className : additional Tailwind classes to merge
 *
 * USAGE:
 *   <Button variant="primary" onClick={handleStart}>Start Game</Button>
 *   <Button variant="secondary" size="sm" loading={joining}>Join</Button>
 */

import clsx from 'clsx'
import Spinner from './Spinner'

const BASE = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed'

const VARIANTS = {
  primary:   'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500 shadow-lg shadow-blue-900/40',
  secondary: 'border border-blue-500 text-blue-400 hover:bg-blue-500/10 focus:ring-blue-500',
  ghost:     'text-slate-300 hover:text-white hover:bg-white/5 focus:ring-white/20',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className,
  ...rest
}) {
  return (
    <button
      className={clsx(BASE, VARIANTS[variant], SIZES[size], className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
