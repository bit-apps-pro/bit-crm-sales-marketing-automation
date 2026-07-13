import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type TimelineItemType, type TimelinesPayloadType } from '../shared/timeline-types'

export default function useTimelines(params: TimelinesPayloadType) {
  const { data, isFetching, isPending, refetch } = useQuery({
    queryFn: () =>
      queryRequest<TimelineItemType[]>('activity-logs/index', undefined, { ...params }, 'GET'),
    queryKey: ['activity-logs', 'index', params.entity_id, params.module]
  })

  return {
    isTimelinesFetching: isFetching,
    isTimelinesPending: isPending,
    refetchTimelines: refetch,
    timelines: data?.data || []
  }
}
