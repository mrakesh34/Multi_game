/**
 * FILE: frontend/src/games/ludo/index.jsx
 * PURPOSE: Lazy-loaded entry point for Ludo.
 *          Exported as default so React.lazy() in GameLayout can load it cleanly.
 *
 * USAGE:
 *   const LudoGame = React.lazy(() => import('../games/ludo/index.jsx'))
 */

import LudoGame from './LudoGame'

export default LudoGame
