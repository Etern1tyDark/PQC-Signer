'use client'
import { useEffect, useState } from 'react'

/**
 * Returns true when the given media query matches. SSR-safe: returns false
 * until mounted on the client.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return matches
}

/** Tailwind's `md` breakpoint (>= 768px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}
