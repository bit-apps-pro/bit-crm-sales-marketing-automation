import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type LineItem } from '@features/product-line-items/shared/types'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import {
  type ContactInformation,
  type DealInformation,
  type InvoiceType
} from '@pages/invoice-create/shared/invoice-create-types'
import { useQuery } from '@tanstack/react-query'

export interface InvoiceResponse {
  contact: ContactInformation
  currency_data: CurrencyItemType
  deal: DealInformation
  invoice: InvoiceType
  line_items: LineItem[]
}

export default function useInvoice(invoiceId: number) {
  const { data, isError, isFetching, isLoading, isPending, refetch } = useQuery<
    Response<InvoiceResponse>,
    Error,
    InvoiceResponse
  >({
    enabled: Boolean(invoiceId) && checkCapability(CAPABILITIES.INVOICE.VIEW),
    queryFn: ({ signal }) =>
      queryRequest(`invoices/${invoiceId}`, undefined, undefined, 'GET', { signal }),
    queryKey: ['invoice', invoiceId],
    retry: false,
    select: response => response.data
  })

  return {
    contact: data?.contact ?? undefined,
    currencyData: data?.currency_data ?? undefined,
    deal: data?.deal ?? undefined,
    invoice: data?.invoice ?? undefined,
    isInvoiceError: isError,
    isInvoiceFetching: isFetching,
    isInvoiceLoading: isLoading,
    isInvoicePending: isPending,
    lineItems: data?.line_items ?? [],
    refetchInvoice: refetch
  }
}
