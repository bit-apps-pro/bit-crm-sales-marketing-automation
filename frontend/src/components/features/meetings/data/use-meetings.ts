import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type MeetingsIndexType } from '../shared/meeting-types'

export default function useMeetings(
  module: string,
  entityId: number,
  page: number | string,
  perPage: number | string,
  status: string,
  search: string,
  assignedTo: string
) {
  const { data, error, isError, isFetching, isPending, isRefetching, refetch } = useQuery<
    Response<MeetingsIndexType>,
    Error,
    MeetingsIndexType
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
          type: 'meeting'
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: [
      'activities',
      'meetings',
      { assignedTo, entityId, module, page: Number(page), perPage: Number(perPage), search, status }
    ],
    select: res => res.data,
    staleTime: 5000
  })

  if (isError) {
    console.error(error)
  }

  return {
    currentPage: data?.current_page || 1,
    isFetchingMeetings: isFetching,
    isPendingMeetings: isPending,
    isRefetchingMeetings: isRefetching,
    meetings: data?.data,
    pageSize: data?.per_page || 0,
    refetchMeetings: refetch,
    total: data?.total || 0
  }
}
