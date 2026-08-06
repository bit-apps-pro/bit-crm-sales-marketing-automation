import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type TrashesIndex, type TrashesIndexPayload } from '../shared/trash-type'

export default function useTrashes(payload: TrashesIndexPayload) {
  const { data, isFetching, isLoading, isRefetching, refetch } = useQuery<
    Response<TrashesIndex>,
    Error,
    TrashesIndex
  >({
    queryFn: ({ signal }) =>
      queryRequest('trashes/index', {}, { ...payload }, 'GET', {
        signal
      }),
    queryKey: [
      'trashes',
      'index',
      {
        dateRage: payload.dateRange,
        module: payload.module,
        page: Number(payload.page),
        perPage: Number(payload.perPage),
        sortOrder: payload.sortOrder
      }
    ],
    select: res => res.data
  })

  return {
    isFetchingTrashes: isFetching,
    isRefetchingTrashes: isRefetching,
    isTrashesLoading: isLoading,
    refetchTrashes: refetch,
    totalTrashes: data?.total || 0,
    trashes: data?.data || []
  }
}
