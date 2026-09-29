import { useState } from 'react'

import { BREAKPOINTS } from './use-breakpoint'
import useDebounce from './use-debounce'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

/**
 * Height for a table's internal vertical scroll area, or `undefined` on small screens.
 *
 * On desktop the tables own a fixed slice of the viewport and scroll their body inside
 * it, which keeps the header and toolbar in place on long lists.
 *
 * That breaks down on a phone. The offset is a constant (~400px of chrome measured on a
 * desktop layout), so on a 667px-tall screen it leaves the 200px floor -- a table about
 * three rows tall, scrolling inside a page that also scrolls. Nested scroll regions are
 * the worst case for touch: the inner one swallows the gesture and the page feels stuck.
 *
 * Below `md` this returns `undefined`, which antd reads as "no vertical scroll", so the
 * table renders at full height and the page scrolls normally. Returning `undefined`
 * rather than a bigger number keeps the fix in one place -- every `scroll={{ y }}` call
 * site inherits it without change.
 */
const useTableScrollHeight = (offset: number, minHeight = 200) => {
  const [height, setHeight] = useState<number | undefined>(0)

  const calculateHeight = () => {
    if (window.innerWidth < BREAKPOINTS.md) {
      setHeight(undefined)
      return
    }

    const windowHeight = window.innerHeight
    const calculatedHeight = windowHeight - offset
    setHeight(Math.max(calculatedHeight, minHeight))
  }

  const debouncedCalculateHeight = useDebounce(calculateHeight, 200)

  useIsomorphicLayoutEffect(() => {
    calculateHeight()
    window.addEventListener('resize', debouncedCalculateHeight)

    return () => {
      window.removeEventListener('resize', debouncedCalculateHeight)
      debouncedCalculateHeight.cancel()
    }
  }, [offset, minHeight])

  return height
}

export default useTableScrollHeight
