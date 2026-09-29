import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest from '@common/helpers/request'
import { type Deal } from '@pages/deal/shared/deal-types'
import { useQuery } from '@tanstack/react-query'

import {
  type ContactInformation,
  type CurrencyItemType,
  type DealInformation
} from '../shared/invoice-create-types'

interface DealContactCurrency {
  contact: ContactInformation
  currencyData: CurrencyItemType
  deal: DealInformation & Pick<Deal, 'gross_discount_amount' | 'gross_discount_type' | 'tax_option'>
  lineItems: NonNullable<Deal['lineItems']>
}

interface DealContactCurrencyResponseType {
  data: DealContactCurrency
}

export default function useDealContactCurrency(dealId: number | string) {
  const { data, isError, isFetching, isLoading, refetch } = useQuery<
    DealContactCurrencyResponseType,
    Error
  >({
    enabled: Boolean(dealId) && checkCapability(CAPABILITIES.DEAL.VIEW),
    queryFn: async ({ signal }) => {
      const [invoiceDetails, dealDetails] = await Promise.all([
        queryRequest<Omit<DealContactCurrency, 'lineItems'>>(
          `deals/contact-currency/${dealId}`,
          undefined,
          undefined,
          'GET',
          { signal }
        ),
        queryRequest<Deal>(`deals/${dealId}`, undefined, undefined, 'GET', { signal })
      ])
      return {
        ...invoiceDetails,
        data: {
          ...invoiceDetails.data,
          lineItems: dealDetails.data.lineItems ?? []
        }
      }
    },
    queryKey: ['deals', dealId, 'contact-currency']
  })
  return {
    dealContactCurrency: data,
    isDealContactCurrencyError: isError,
    isDealContactCurrencyFetching: isFetching,
    isDealContactCurrencyLoading: isLoading,
    refetchDealContactCurrency: refetch
  }
}
