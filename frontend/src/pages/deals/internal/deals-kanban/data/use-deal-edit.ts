import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { type Deal } from '@pages/deal/shared/deal-types'
import { useQuery } from '@tanstack/react-query'

export interface DealEditResponse {
  deal: Deal
  dealCurrencyData: CurrencyItemType
  hasLineItems: boolean
}

export default function useDealEdit(dealId: number, enabled = true) {
  const { data, isError, isFetching, isLoading, refetch } = useQuery<
    Response<DealEditResponse>,
    Error,
    DealEditResponse
  >({
    enabled: dealId > 0 && enabled && checkCapability(CAPABILITIES.DEAL.VIEW),
    queryFn: ({ signal }) =>
      queryRequest(`deals/edit/${dealId}`, undefined, undefined, 'GET', {
        signal
      }),
    queryKey: ['deals', 'edit', dealId],
    select: res => res.data,
    staleTime: 0
  })

  return {
    dealCurrencyData: data?.dealCurrencyData,
    dealEditData: data?.deal,
    hasLineItems: data?.hasLineItems ?? false,
    isDealEditError: isError,
    isDealEditFetching: isFetching,
    isDealEditLoading: isLoading,
    refetchDealEdit: refetch
  }
}
