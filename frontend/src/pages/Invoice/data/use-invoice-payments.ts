import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest, { type Response } from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type InvoicePaymentsResponse } from '../shared/invoice-payment-types'

/**
 * Payment history of an invoice — one free route returning the ledger rows
 * and the total/paid/due summary.
 */
export default function useInvoicePayments(invoiceId: number) {
  const { data, isError, isFetching, isLoading, refetch } = useQuery<
    Response<InvoicePaymentsResponse>,
    Error,
    InvoicePaymentsResponse
  >({
    enabled: Boolean(invoiceId) && checkCapability(CAPABILITIES.INVOICE.VIEW),
    queryFn: ({ signal }) =>
      queryRequest(`invoices/${invoiceId}/payments`, undefined, undefined, 'GET', { signal }),
    queryKey: ['invoice-payments', invoiceId],
    refetchOnWindowFocus: true,
    select: response => response.data
  })

  return {
    isPaymentsError: isError,
    isPaymentsFetching: isFetching,
    isPaymentsLoading: isLoading,
    payments: data?.payments ?? [],
    refetchPayments: refetch,
    summary: data?.summary ?? undefined
  }
}
