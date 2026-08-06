import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useInfiniteQuery } from '@tanstack/react-query'

import { type MeetingsIndexType } from '../shared/meeting-types'

const PER_PAGE = 10

interface MeetingsData {
  meetings: MeetingsIndexType['data']
  total: number
}

export default function useMeetings(
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
    isLoading,
    isRefetching,
    refetch
  } = useInfiniteQuery<Response<MeetingsIndexType>, Error, MeetingsData>({
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
          type: 'meeting'
        },
        'GET',
        { signal }
      ),
    queryKey: ['activities', 'meetings', 'infinite', { assignedTo, entityId, module, search, status }],
    select: response => ({
      meetings: response.pages.flatMap(page => page.data.data),
      total: response.pages[0]?.data.total ?? 0
    })
  })

  if (isError) {
    console.error(error)
  }

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingMeetings: isFetching,
    isFetchingNextPage,
    isMeetingsLoading: isLoading,
    isRefetchingMeetings: isRefetching,
    meetings: data?.meetings,
    refetchMeetings: refetch,
    total: data?.total ?? 0
  }
}
