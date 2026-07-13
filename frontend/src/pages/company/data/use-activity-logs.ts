import queryRequest from '@common/helpers/request'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

interface ActivityLog {
  action: string
  created_at: string
  created_by: number
  created_by_name: string
  description: string
  id: number
  module: string
}

interface ActivityLogsResponse {
  activity_logs: ActivityLog[]
  totalActivityLogs: number
}

interface SearchParams {
  page: number
  perPage: number
}

export default function useActivityLogs(companyId: string, searchParams: SearchParams) {
  const { data, isFetching, isPending, refetch } = useQuery({
    enabled: !!companyId,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest<ActivityLogsResponse>(
        `companies/${companyId}/activity-logs`,
        searchParams,
        undefined,
        'POST',
        { signal }
      ),
    queryKey: ['company_activity_logs', companyId, searchParams]
  })

  return {
    activityLogs: data?.data?.activity_logs || [],
    isActivityLogsFetching: isFetching,
    isActivityLogsPending: isPending,
    refetchActivityLogs: refetch,
    totalActivityLogs: data?.data?.totalActivityLogs || 0
  }
}
