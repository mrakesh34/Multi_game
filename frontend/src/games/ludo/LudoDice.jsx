/**
 * FILE: frontend/src/games/ludo/LudoDice.jsx
 * PURPOSE: 3D animated ivory-bone dice component for Ludo.
 */

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
    <div className="flex flex-col items-center gap-3">
      <div className="recessed-well p-4 rounded-2xl">
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
              <span /> <div className="dice-dot !bg-[#d9482b]" /> <span />
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
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={!disabled ? onRoll : undefined}
        className="keycap-primary px-4 py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {disabled ? 'Wait Turn' : 'Roll Die'}
      </button>
    </div>
  )
}
