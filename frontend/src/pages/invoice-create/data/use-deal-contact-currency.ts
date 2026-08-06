import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import {
  type ContactInformation,
  type CurrencyItemType,
  type DealInformation
} from '../shared/invoice-create-types'

interface DealContactCurrency {
  contact: ContactInformation
  currencyData: CurrencyItemType
  deal: DealInformation
}

interface DealContactCurrencyResponseType {
  data: DealContactCurrency
}

export default function useDealContactCurrency(dealId: number | string) {
  const { data, isFetching, isLoading, refetch } = useQuery<DealContactCurrencyResponseType, Error>({
    enabled: Boolean(dealId) && checkCapability(CAPABILITIES.DEAL.VIEW),
    queryFn: ({ signal }) =>
      queryRequest(`deals/contact-currency/${dealId}`, undefined, undefined, 'GET', { signal }),
    queryKey: ['deals', dealId, 'contact-currency']
  })
  return {
    dealContactCurrency: data,
    isDealContactCurrencyFetching: isFetching,
    isDealContactCurrencyLoading: isLoading,
    refetchDealContactCurrency: refetch
  }
}
