import queryRequest, { type Response } from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { getPublicInvoiceContext, type PublicInvoiceResponse } from '../shared/public-invoice-types'

export default function usePublicInvoice() {
  const context = getPublicInvoiceContext()

  const { data, isError, isLoading } = useQuery<
    Response<PublicInvoiceResponse>,
    Error,
    PublicInvoiceResponse
  >({
    enabled: Boolean(context?.id && context?.token),
    queryFn: ({ signal }) =>
      queryRequest(`invoices/public/${context?.id}`, undefined, { token: context?.token ?? '' }, 'GET', {
        signal,
        skipNonce: true
      }),
    queryKey: ['public-invoice', context?.id],
    retry: false,
    select: response => response.data
  })

  return {
    invoiceData: data,
    isInvoiceError: isError || !context,
    isInvoiceLoading: isLoading
  }
}
