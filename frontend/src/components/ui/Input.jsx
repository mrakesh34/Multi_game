/**
 * FILE: frontend/src/components/ui/Input.jsx
 * PURPOSE: Recessed well input field matching TE-01 Tactile Console tokens.
 */

import clsx from 'clsx'

export default function Input({ label, error, className, ...rest }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-[#8a919e]">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl bg-[#0c0e13] border text-[#f2ece1] placeholder-zinc-600 shadow-[inset_0_2px_6px_rgba(0,0,0,0.65)]',
          'focus:outline-none focus:ring-1 transition-all font-medium',
          error
            ? 'border-[#d9482b] focus:border-[#d9482b] focus:ring-[#d9482b]/50'
            : 'border-white/[0.08] focus:border-[#e07a22] focus:ring-[#e07a22]/40',
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs font-mono text-[#f87171]">{error}</p>}
    </div>
  )
}
