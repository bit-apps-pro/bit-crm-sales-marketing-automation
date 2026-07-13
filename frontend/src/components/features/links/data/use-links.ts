import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type LinksIndexType } from '../shared/link-types'

export default function useLinks(
  module: string,
  entityId: number,
  page: number | string,
  perPage: number | string,
  sortOrder: string,
  search: string
) {
  const { data, error, isError, isPending, isRefetching, refetch } = useQuery<
    Response<LinksIndexType>,
    Error,
    LinksIndexType
  >({
    queryFn: ({ signal }) =>
      queryRequest(
        'links/index',
        {},
        {
          entityId,
          module,
          page: Number(page),
          perPage: Number(perPage),
          search,
          sortOrder
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: [
      'links',
      'index',
      { entityId, module, page: Number(page), perPage: Number(perPage), search, sortOrder }
    ],
    select: res => res.data,
    staleTime: 5000
  })

  if (isError) {
    console.error(error)
  }

  return {
    currentPage: data?.current_page || 1,
    isFetchingLinks: isPending,
    isRefetchingLinks: isRefetching,
    links: data?.data,
    pageSize: data?.per_page || 0,
    refetchLinks: refetch,
    total: data?.total || 0
  }
}
