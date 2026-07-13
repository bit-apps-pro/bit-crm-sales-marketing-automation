import queryRequest, { type Response } from '@common/helpers/request'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { type Term } from '../shared/types'

interface PaginatedTerms {
  currentPage: number
  data: Term[]
  lastPage: number
  perPage: number
  total: number
}

interface UseTermsParams {
  page: number
  perPage: number
}

export default function useTerms({ page, perPage }: UseTermsParams) {
  const { data, isError, isFetching, isPending, refetch } = useQuery<
    Response<PaginatedTerms>,
    Error,
    PaginatedTerms
  >({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest('invoices/terms', { page, perPage }, undefined, 'GET', { signal }),
    queryKey: ['invoices', 'terms', { page, perPage }],
    select: res => res.data
  })
  return {
    isTermsError: isError,
    isTermsFetching: isFetching,
    isTermsPending: isPending,
    refetchTerms: refetch,
    terms: data?.data || [],
    total: data?.total ?? 0
  }
}
