/**
 * FILE: frontend/src/components/layout/PageTransition.jsx
 * PURPOSE: Wraps page content in a Framer Motion animation for smooth
 *          page-to-page transitions when React Router navigates.
 *
 * ANIMATION (see IMPLEMENTATION_PLAN.md §10):
 *   Enter: opacity 0 + y 20 → opacity 1 + y 0, duration 0.3s
 *   Exit:  opacity 1 + y 0 → opacity 0 + y -20, duration 0.3s
 *
 * USAGE:
 *   Wrap the top-level JSX in every page component:
 *   export default function HomePage() {
 *     return (
 *       <PageTransition>
 *         <div>...page content...</div>
 *       </PageTransition>
 *     )
 *   }
 *
 * NOTE:
 *   For AnimatePresence exit animations to work correctly, the parent component
 *   must use <AnimatePresence> with a `key` prop based on the route location.
 *   This is handled by wrapping <Routes> in App.jsx with AnimatePresence.
 */

import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}
