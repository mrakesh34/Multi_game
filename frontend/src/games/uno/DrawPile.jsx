/**
 * FILE: frontend/src/games/uno/DrawPile.jsx
 * PURPOSE: Interactive draw pile with stacked deck depth and tactile hover lift.
 */

import { motion } from 'framer-motion'

export default function DrawPile({ count = 0, canDraw = false, onDraw }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative">
        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[14px] bg-[#0c0e13] border border-white/[0.08]" />
        <motion.div
          whileHover={canDraw ? { y: -6, scale: 1.03 } : {}}
          whileTap={canDraw ? { scale: 0.94 } : {}}
          transition={{ type: 'spring', stiffness: 460, damping: 28 }}
          className={`uno-card bg-[#1a1e27] border-[2.5px] border-[#f5efe6]/85 relative ${
            canDraw
              ? 'cursor-pointer ring-2 ring-[#e07a22] shadow-[0_12px_24px_rgba(224,122,34,0.25)]'
              : 'opacity-75 cursor-not-allowed'
          }`}
          onClick={canDraw ? onDraw : undefined}
        >
          <div className="uno-card-center-oval !bg-[#d9482b] shadow-inner">
            <span className="font-game font-black text-2xl text-[#fffaf0] transform -rotate-[24deg] tracking-tight">
              UNO
            </span>
          </div>
        </motion.div>
      </div>
      <span className="text-[11px] font-mono text-[#8a919e] px-2.5 py-0.5 rounded-md recessed-well">
        {count} cards
      </span>
    </div>
  )
}
