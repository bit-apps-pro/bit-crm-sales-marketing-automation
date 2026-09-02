/**
 * Picks the item to select after `currentId` leaves an ordered list: the next
 * one, or the previous one when `currentId` was last. Returns `undefined` when
 * nothing else is loaded or `currentId` is not in `ids` at all.
 */
export function getAdjacentId(ids: number[], currentId: number): number | undefined {
  const index = ids.indexOf(currentId)

  if (index === -1) return undefined

  return ids[index + 1] ?? ids[index - 1]
}
