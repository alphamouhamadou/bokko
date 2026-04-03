'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ViewTransitionProps {
  children: ReactNode
  viewKey: string
}

export default function ViewTransition({ children, viewKey }: ViewTransitionProps) {
  const isFirstRender = useRef(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // After first mount, mark as no longer first render
    const timer = setTimeout(() => {
      isFirstRender.current = false
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // If user prefers reduced motion, render children without animation
  if (prefersReducedMotion) {
    return <>{children}</>
  }

  const skipAnimation = isFirstRender.current

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        layout={false}
        initial={skipAnimation ? false : {
          opacity: 0,
          x: 30,
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
        exit={{
          opacity: 0,
          x: -20,
          transition: { duration: 0.2, ease: 'easeIn' },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
