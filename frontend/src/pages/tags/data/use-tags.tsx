import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type TagsDataType } from '../shared/tag-types'

interface SearchParamsType {
  page: number
  perPage: number
  searchTerm: string
}

export default function useTags({ page, perPage, searchTerm }: SearchParamsType) {
  const { data, error, isError, isFetching, isPending, refetch } = useQuery<
    Response<TagsDataType>,
    Error,
    TagsDataType
  >({
    queryFn: () => queryRequest(`tags/index`, {}, { page, perPage, searchTerm }, 'GET'),
    queryKey: ['tags', perPage, page, searchTerm],
    select: res => res.data
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
