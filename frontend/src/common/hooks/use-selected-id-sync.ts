import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

interface UseSelectedIdSyncParams {
  /** Ids of the currently loaded list; `undefined` until the first page arrives. */
  ids?: number[]
  /** The selected record cannot be shown here (missing, or belongs to another list). */
  isInvalid?: boolean
  isLoading: boolean
}

const PARAM_KEY = 'id'

/**
 * Keeps the `?id=` search param in step with a master/detail list: selects the
 * first item when nothing (or something unusable) is selected, and follows the
 * list when a fresh load no longer contains the selection.
 *
 * An id that is already in the URL when the first list settles is trusted even
 * if it is not among the loaded items, so deep links to records on later pages
 * keep resolving. That trust ends when the user picks another item or when a
 * new list (changed filters/search) loads from scratch.
 */
export default function useSelectedIdSync({
  ids,
  isInvalid = false,
  isLoading
}: UseSelectedIdSyncParams) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = Number(searchParams.get(PARAM_KEY)) || 0

  const hasSettledRef = useRef(false)
  const trustedIdRef = useRef<number>()

  useEffect(() => {
    if (isLoading || !ids) {
      if (hasSettledRef.current) {
        trustedIdRef.current = undefined
      }

      return
    }

    if (!hasSettledRef.current) {
      hasSettledRef.current = true

      if (selectedId && !ids.includes(selectedId)) {
        trustedIdRef.current = selectedId
      }
    }

    const isInList = ids.includes(selectedId)
    const isTrusted = selectedId !== 0 && selectedId === trustedIdRef.current

    if (!isInvalid && (isInList || isTrusted)) {
      return
    }

    const nextId = ids[0] ?? 0

    if (nextId === selectedId) {
      return
    }

    setSearchParams(
      prev => {
        if (nextId) {
          prev.set(PARAM_KEY, String(nextId))
        } else {
          prev.delete(PARAM_KEY)
        }

        return prev
      },
      { replace: true }
    )
  }, [ids, isInvalid, isLoading, selectedId, setSearchParams])

  return selectedId
}
