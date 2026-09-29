import { useEffect, useState } from 'react'

/*
  Tailwind's default breakpoints, mirrored here so JS-side decisions and CSS-side
  `md:` prefixes stay on the same lines. If tailwind.config.mjs ever overrides
  `theme.screens`, these have to move with it.
*/
export const BREAKPOINTS = {
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * True while the viewport is at least `breakpoint` wide.
 *
 * Most responsive work in this app is CSS -- a `md:` prefix costs nothing and needs no
 * JS. Reach for this only when the layout difference cannot be expressed in CSS: a
 * prop that has to change (antd's `scroll.y`, a Drawer's `width`), or a subtree that
 * should not mount at all on small screens.
 *
 * Matches `min-width`, so it reads the same direction as Tailwind: `useBreakpoint('md')`
 * is true exactly when `md:` utilities apply.
 */
export default function useBreakpoint(breakpoint: Breakpoint = 'md') {
  const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`

  /*
    Initialised from a real match rather than `false` so the first paint is already
    correct. A `false` seed renders the mobile layout for one frame on desktop, which
    shows up as a visible reflow on every mount.
  */
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? true)

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(query)
    if (!mediaQuery) return

    // Re-read on subscribe: the viewport can change between the initial render and this
    // effect (rotation, or a resize during hydration).
    setMatches(mediaQuery.matches)

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQuery.addEventListener('change', onChange)

    return () => mediaQuery.removeEventListener('change', onChange)
  }, [query])

  return matches
}
