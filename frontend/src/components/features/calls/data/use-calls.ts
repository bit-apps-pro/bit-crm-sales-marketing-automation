import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useInfiniteQuery } from '@tanstack/react-query'

import { type CallsIndexType } from '../shared/call-types'

const PER_PAGE = 10

interface CallsData {
  calls: CallsIndexType['data']
  totalCalls: number
}

export default function useCalls(
  module: string,
  entityId: number,
  status: string,
  search: string,
  assignedTo: string
) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch
  } = useInfiniteQuery<Response<CallsIndexType>, Error, CallsData>({
    getNextPageParam: lastPage => {
      const { data: page } = lastPage
      const currentPage = Number(page.current_page)
      const perPage = Number(page.per_page)
      return currentPage * perPage < page.total ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      queryRequest(
        'activities/index',
        {},
        {
          assigned_to: assignedTo,
          entityId: entityId || 0,
          module: module || '',
          page: pageParam as number,
          perPage: PER_PAGE,
          search,
          status,
          type: 'call'
        },
        'GET',
        { signal }
      ),
    queryKey: ['activities', 'calls', 'infinite', { assignedTo, entityId, module, search, status }],
    select: response => ({
      calls: response.pages.flatMap(page => page.data.data),
      totalCalls: response.pages[0]?.data.total ?? 0
    })
  })

  if (isError) {
    console.error(error)
  }

  return {
    calls: data?.calls,
    fetchNextPage,
    hasNextPage,
    isFetchingCalls: isFetching,
    isFetchingNextPage,
    isPendingCalls: isPending,
    isRefetchingCalls: isRefetching,
    refetchCalls: refetch,
    totalCalls: data?.totalCalls ?? 0
  }
}
