import queryRequest, { type Response } from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

export interface TermsOptions {
  days: number
  label: string
  value: string
}

export default function useInvoiceTerms() {
  const { data, isError, isFetching, isPending } = useQuery<
    Response<TermsOptions[]>,
    Error,
    TermsOptions[]
  >({
    queryFn: ({ signal }) =>
      queryRequest('invoices/terms/options', undefined, undefined, 'GET', { signal }),
    queryKey: ['invoices', 'terms', 'options'],
    select: res => res.data
  })
  return {
    isTermsError: isError,
    isTermsFetching: isFetching,
    isTermsPending: isPending,
    terms: data || []
  }
}
