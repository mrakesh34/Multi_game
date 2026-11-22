/**
 * FILE: frontend/src/games/ludo/LudoDice.jsx
 * PURPOSE: 3D animated CSS dice component for Ludo.
 *
 * PROPS:
 *   value     : number | null (1 to 6)
 *   isRolling : boolean
 *   disabled  : boolean (disabled when not your turn or not in roll phase)
 *   onRoll    : function callback when clicked
 */

import { useState } from 'react'
import clsx from 'clsx'

const ROTATIONS = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateY(-90deg)',
  3: 'rotateY(-180deg)',
  4: 'rotateY(90deg)',
  5: 'rotateX(-90deg)',
  6: 'rotateX(90deg)',
}

export default function LudoDice({ value, isRolling, disabled, onRoll }) {
  const currentVal = value || 1
  const transform = ROTATIONS[currentVal] || ROTATIONS[1]

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={clsx(
          'dice-scene cursor-pointer select-none transition-transform active:scale-95',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
        onClick={!disabled ? onRoll : undefined}
      >
        <div
          className={clsx('dice-cube', isRolling && 'dice-rolling')}
          style={{ transform }}
        >
          {/* Face 1 */}
          <div className="dice-face face-1">
            <span /> <span /> <span />
            <span /> <div className="dice-dot bg-red-600" /> <span />
            <span /> <span /> <span />
          </div>

          {/* Face 2 */}
          <div className="dice-face face-2">
            <div className="dice-dot" /> <span /> <span />
            <span /> <span /> <span />
            <span /> <span /> <div className="dice-dot" />
          </div>

          {/* Face 3 */}
          <div className="dice-face face-3">
            <div className="dice-dot" /> <span /> <span />
            <span /> <div className="dice-dot" /> <span />
            <span /> <span /> <div className="dice-dot" />
          </div>

          {/* Face 4 */}
          <div className="dice-face face-4">
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
            <span /> <span /> <span />
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
          </div>

          {/* Face 5 */}
          <div className="dice-face face-5">
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
            <span /> <div className="dice-dot" /> <span />
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
          </div>

          {/* Face 6 */}
          <div className="dice-face face-6">
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
            <div className="dice-dot" /> <span /> <div className="dice-dot" />
          </div>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-medium">
        {disabled ? 'Wait for turn' : 'Click to Roll'}
      </span>
    </div>
  )
}
