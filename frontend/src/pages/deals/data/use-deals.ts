import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FilterCondition } from '@features/advanced-filter/shared/types'
import { useQuery } from '@tanstack/react-query'

import { type DealsResponse, type SearchData } from '../shared/types'

export default function useDeals(
  searchData: SearchData & { advancedFilterGroups?: FilterCondition[][] }
) {
  const { advancedFilterGroups, ...rest } = searchData
  const { data, isError, isFetching, isPending, refetch } = useQuery<
    Response<DealsResponse>,
    Error,
    DealsResponse
  >({
    enabled: checkCapability(CAPABILITIES.DEAL.VIEW),
    queryFn: ({ signal }) =>
      queryRequest('deals/search', { ...rest, advancedFilterGroups }, undefined, 'POST', { signal }),
    queryKey: ['deals', searchData],
    select: res => res.data
  })

  return {
    deals: data?.data || [],
    isDealsError: isError,
    isDealsFetching: isFetching,
    isDealsPending: isPending,
    refetchDeals: refetch,
    stageStatistics: data?.stageStatistics || {},
    totalDeals: data?.total || 0
  }
}
