/**
 * FILE: frontend/src/components/ui/Button.jsx
 * PURPOSE: Tactile PBT keycap button component with mechanical press travel
 *          and procedural Web Audio switch click.
 */

import clsx from 'clsx'
import Spinner from './Spinner'
import { playKeyThock } from '../../utils/uiAudio'

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#111318] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none'

const VARIANTS = {
  primary:   'keycap-primary',
  secondary: 'keycap-btn',
  emerald:   'bg-gradient-to-b from-[#059669] to-[#047857] border border-emerald-400/40 text-[#ecfdf5] shadow-[0_4px_0_#064e3b,0_8px_18px_rgba(5,150,105,0.24),inset_0_1px_0_rgba(255,255,255,0.24)] hover:-translate-y-[1px] active:translate-y-[3px] active:shadow-[0_1px_0_#064e3b] transition-all duration-150',
  danger:    'bg-gradient-to-b from-[#d9482b] to-[#b5371e] border border-red-400/35 text-[#fff5f2] shadow-[0_4px_0_#6b1d0f,0_8px_18px_rgba(217,72,43,0.24),inset_0_1px_0_rgba(255,255,255,0.22)] hover:-translate-y-[1px] active:translate-y-[3px] active:shadow-[0_1px_0_#6b1d0f] transition-all duration-150',
  ghost:     'text-zinc-300 hover:text-[#f2ece1] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.07] transition-all duration-150 active:scale-[0.97]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  silent = false,
  onClick,
  children,
  className,
  ...rest
}) {
  function handleClick(e) {
    if (!silent && !disabled && !loading) {
      playKeyThock(variant === 'primary' ? 185 : 155)
    }
    onClick?.(e)
  }

  return (
    <button
      className={clsx(BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size], className)}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
