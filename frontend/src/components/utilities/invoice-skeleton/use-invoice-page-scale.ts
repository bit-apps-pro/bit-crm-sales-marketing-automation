import { useCallback, useRef, useState } from 'react'

export const INVOICE_PAGE_WIDTH = 794
export const INVOICE_PAGE_HEIGHT = 1123

function calculateScale(containerWidth: number, containerHeight: number) {
  if (!containerWidth || !containerHeight) return 1
  const scaleW = containerWidth / INVOICE_PAGE_WIDTH
  const scaleH = containerHeight / INVOICE_PAGE_HEIGHT
  return Math.min(scaleW, scaleH, 1) // clamp to 1 so it doesn't upscale
}

/**
 * Scales a fixed A4 invoice page down to fit its container.
 *
 * Measuring happens in a ref callback rather than an effect: the container is swapped
 * out whenever the skeleton hands over to the real preview, and a ref callback re-runs
 * on every such remount with no dependency to keep in sync. It also runs before paint,
 * so the page never shows a frame at 1:1 before snapping down -- that flash reads as a
 * bounce on handover.
 */
export default function useInvoicePageScale() {
  const observerRef = useRef<ResizeObserver | undefined>(undefined)
  const [scale, setScale] = useState(1)

  const containerRef = useCallback((element: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = undefined

    if (!element) return

    const { height, width } = element.getBoundingClientRect()
    setScale(calculateScale(width, height))

    const ro = new ResizeObserver(([entry]) => {
      const { height: observedHeight, width: observedWidth } = entry.contentRect
      setScale(calculateScale(observedWidth, observedHeight))
    })
    ro.observe(element)
    observerRef.current = ro
  }, [])

  return { containerRef, scale }
}
