import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type CallsIndexType } from '../shared/call-types'

export default function useCalls(
  module: string,
  entityId: number,
  page: number | string,
  perPage: number | string,
  status: string,
  search: string,
  assignedTo: string
) {
  const { data, error, isError, isFetching, isPending, isRefetching, refetch } = useQuery<
    Response<CallsIndexType>,
    Error,
    CallsIndexType
  >({
    queryFn: ({ signal }) =>
      queryRequest(
        'activities/index',
        {},
        {
          assigned_to: assignedTo,
          entityId: entityId || 0,
          module: module || '',
          page: Number(page),
          perPage: Number(perPage),
          search,
          status,
          type: 'call'
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: [
      'activities',
      'calls',
      { assignedTo, entityId, module, page: Number(page), perPage: Number(perPage), search, status }
    ],
    select: res => res.data,
    staleTime: 5000
  })

  if (isError) {
    console.error(error)
  }

  return {
    calls: data?.data,
    currentPage: data?.current_page || 1,
    isFetchingCalls: isFetching,
    isPendingCalls: isPending,
    isRefetchingCalls: isRefetching,
    pageSize: data?.per_page || 0,
    refetchCalls: refetch,
    totalCalls: data?.total || 0
  }
}
