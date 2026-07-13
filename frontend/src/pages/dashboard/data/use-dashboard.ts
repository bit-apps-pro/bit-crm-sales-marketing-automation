import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { DEFAULT_PENDING_ACTIVITIES, DEFAULT_STATS } from '../shared/constants'
import {
  type DashboardStats,
  type DealPipeline,
  type InvoiceData,
  type LeadCountBySource,
  type PendingActivity,
  type TopProduct
} from '../shared/types'

interface DashboardResponse {
  dealsPipeline: DealPipeline[]
  invoiceStatusOverview: InvoiceData[]
  leadCountBySource: LeadCountBySource[]
  pendingActivities: PendingActivity
  stats: DashboardStats
  topProductsByQuantity: TopProduct[]
  userName: string
}

interface UseDashboardParams {
  endDate?: string
  startDate?: string
}

export default function useDashboard({ endDate, startDate }: UseDashboardParams) {
  const { data, error, isError, isPending } = useQuery<
    Response<DashboardResponse>,
    Error,
    DashboardResponse
  >({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest(
        'dashboard/index',
        {},
        { ...(startDate && { startDate }), ...(endDate && { endDate }) },
        'GET',
        { signal }
      ),
    queryKey: ['dashboard', startDate, endDate],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

  return {
    dealsPipeline: data?.dealsPipeline ?? [],
    invoiceStatusOverview: data?.invoiceStatusOverview ?? [],
    isLoading: isPending,
    leadCountBySource: data?.leadCountBySource ?? [],
    pendingActivities: data?.pendingActivities ?? DEFAULT_PENDING_ACTIVITIES,
    stats: data?.stats ?? DEFAULT_STATS,
    topProductsByQuantity: data?.topProductsByQuantity ?? [],
    userName: data?.userName ?? ''
  }
}
