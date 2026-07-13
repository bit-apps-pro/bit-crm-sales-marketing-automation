import queryRequest, { type Response } from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type Term } from '../shared/types'

export default function useTerm(key: string) {
  const { data, isError, isFetching, isPending } = useQuery<Response<Term>, Error, Term>({
    enabled: !!key,
    queryFn: ({ signal }) =>
      queryRequest(`invoices/terms/${key}`, undefined, undefined, 'GET', { signal }),
    queryKey: ['invoices', 'terms', key],
    select: res => res.data
  })
  return {
    isTermError: isError,
    isTermFetching: isFetching,
    isTermPending: isPending,
    term: data
  }
}
