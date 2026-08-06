import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest, { type Response } from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

export interface TermsOptions {
  days: number
  label: string
  value: string
}

export default function useInvoiceTerms() {
  const { data, isError, isFetching, isLoading } = useQuery<
    Response<TermsOptions[]>,
    Error,
    TermsOptions[]
  >({
    enabled:
      checkCapability(CAPABILITIES.INVOICE.VIEW) || checkCapability(CAPABILITIES.INVOICE.CREATE),
    queryFn: ({ signal }) =>
      queryRequest('invoices/terms/options', undefined, undefined, 'GET', { signal }),
    queryKey: ['invoices', 'terms', 'options'],
    select: res => res.data
  })
  return {
    isTermsError: isError,
    isTermsFetching: isFetching,
    isTermsLoading: isLoading,
    terms: data || []
  }
}
