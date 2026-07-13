import queryRequest, { type Response } from '@common/helpers/request'
import { type ActivityType } from '@features/activity-list/shared/activity-types'
import { useQuery } from '@tanstack/react-query'

const UPCOMING_ACTIVITIES_LIMIT = 2

export default function useUpcomingActivities(module: string, entityId: number) {
  const { data, isPending } = useQuery<Response<ActivityType[]>, Error, ActivityType[]>({
    enabled: Boolean(module && entityId),
    queryFn: ({ signal }) =>
      queryRequest(
        'activities/upcoming',
        {},
        { entityId, limit: UPCOMING_ACTIVITIES_LIMIT, module },
        'GET',
        { signal }
      ),
    queryKey: ['activities', 'upcoming', { entityId, limit: UPCOMING_ACTIVITIES_LIMIT, module }],
    select: res => res.data
  })

  return {
    isUpcomingActivitiesLoading: isPending,
    upcomingActivities: data ?? []
  }
}
