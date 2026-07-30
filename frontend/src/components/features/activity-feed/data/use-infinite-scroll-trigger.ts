import { useCallback, useEffect, useRef } from 'react'

const ROOT_MARGIN = '120px'

interface UseInfiniteScrollTriggerParams {
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

/**
 * Observes a sentinel rendered at the end of a scrollable list and requests the
 * next page whenever it becomes visible. Using an observer instead of a scroll
 * handler keeps pagination working when the first page is too short to overflow
 * its container, in which case no scroll event would ever fire.
 */
export default function useInfiniteScrollTrigger({
  hasMore,
  isLoadingMore,
  onLoadMore
}: UseInfiniteScrollTriggerParams) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMoreRef = useRef(onLoadMore)
  loadMoreRef.current = onLoadMore

  const canLoadMore = Boolean(hasMore) && !isLoadingMore && Boolean(onLoadMore)

  const requestNextPage = useCallback(() => {
    if (!canLoadMore) return
    loadMoreRef.current?.()
  }, [canLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !canLoadMore) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          requestNextPage()
        }
      },
      { root: containerRef.current, rootMargin: ROOT_MARGIN }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [canLoadMore, requestNextPage])

  return { containerRef, sentinelRef }
}
