/**
 * FILE: frontend/src/games/uno/DrawPile.jsx
 * PURPOSE: Interactive draw pile component with 3D stacked depth effect.
 *
 * PROPS:
 *   count   : number of cards left in the draw pile
 *   canDraw : boolean (whether local player can currently draw)
 *   onDraw  : function callback
 */

export default function DrawPile({ count = 0, canDraw = false, onDraw }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`uno-card bg-slate-800 border-2 border-white/60 relative cursor-pointer shadow-xl transition-transform active:scale-95 ${
          canDraw ? 'hover:-translate-y-2 ring-2 ring-blue-400' : 'opacity-80'
        }`}
        onClick={canDraw ? onDraw : undefined}
      >
        {/* Card back logo */}
        <div className="uno-card-center-oval bg-red-600 shadow-inner">
          <span className="font-game font-black text-2xl text-yellow-300 transform -rotate-[25deg]">
            UNO
          </span>
        </div>
      </div>
      <span className="text-xs font-mono text-slate-400">{count} cards left</span>
    </div>
  )
}
