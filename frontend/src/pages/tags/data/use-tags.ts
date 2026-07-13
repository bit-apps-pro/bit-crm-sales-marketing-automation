import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { type TagResponse } from '../shared/tag-types'

interface SearchParamsType {
  modules: string[]
  page: number
  perPage: number
  searchTerm: string
  sortBy: string
  sortOrder: string
}

export default function useTags({
  modules,
  page,
  perPage,
  searchTerm,
  sortBy,
  sortOrder
}: SearchParamsType) {
  const { data, error, isError, isFetching, isPending, refetch } = useQuery<
    Response<TagResponse>,
    Response<string>,
    TagResponse
  >({
    enabled: checkCapability(CAPABILITIES.TAG.VIEW),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest(
        'tags/index',
        { modules, page, perPage, searchTerm, sortBy, sortOrder },
        undefined,
        'POST',
        {
          signal
        }
      ),
    queryKey: ['tags', { modules, page, perPage, searchTerm, sortBy, sortOrder }],
    select: response => response.data
  })
  if (isError) {
    console.error(error)
  }
  return {
    isFetchingTags: isFetching,
    isPendingTags: isPending,
    refetchTags: refetch,
    tags: data?.data || [],
    total: data?.total
  }
}
