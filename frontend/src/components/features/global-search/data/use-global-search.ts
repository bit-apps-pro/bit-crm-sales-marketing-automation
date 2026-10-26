import queryRequest, { type Response } from '@common/helpers/request'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { isRecordTerm } from '../shared/search-utils'
import { type SearchResultGroup, type SearchScope } from '../shared/types'

// Stable identities: the modal resets its highlighted row whenever the groups change.
const NO_GROUPS: SearchResultGroup[] = []
const selectGroups = (response: Response<SearchResultGroup[]>) =>
  Array.isArray(response.data) ? response.data : NO_GROUPS

/** `active` is false while the modal is closed, so a kept query is not refetched behind it. */
export default function useGlobalSearch(term: string, scope: SearchScope, active: boolean) {
  const trimmed = term.trim()
  const enabled = active && scope !== 'pages' && isRecordTerm(trimmed)

  const { data, isFetching, isPlaceholderData } = useQuery<
    Response<SearchResultGroup[]>,
    Error,
    SearchResultGroup[]
  >({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest('global-search', { scope, term: trimmed }, undefined, 'POST', { signal }),
    queryKey: ['global-search', trimmed, scope],
    retry: false,
    select: selectGroups,
    staleTime: 30_000
  })

  return {
    groups: enabled ? (data ?? NO_GROUPS) : NO_GROUPS,
    isFetching: enabled && isFetching,
    // The groups on hand belong to the previous term while this one is fetched.
    isStale: enabled && isPlaceholderData
  }
}
