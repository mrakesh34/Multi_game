/**
 * FILE: frontend/src/components/ui/Input.jsx
 * PURPOSE: Styled text input with optional label and error message.
 *
 * PROPS:
 *   label     : string — displayed above the input
 *   error     : string — red error message displayed below
 *   maxLength : number — passed through to native input
 *   className : additional classes
 *   ...rest   : all native <input> props (value, onChange, placeholder, etc.)
 *
 * STYLING:
 *   Dark glass-style input field matching the app's dark theme.
 *   Focus ring uses accent-blue.
 *   Error state: red border + red error text below.
 *
 * USAGE:
 *   <Input
 *     label="Room Code"
 *     value={code}
 *     onChange={e => setCode(e.target.value)}
 *     maxLength={3}
 *     error={error}
 *   />
 */

import clsx from 'clsx'

export default function Input({ label, error, className, ...rest }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl bg-white/5 border text-slate-100 placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
          error ? 'border-red-500 focus:ring-red-500' : 'border-white/10',
          className
        )}
        {...rest}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
