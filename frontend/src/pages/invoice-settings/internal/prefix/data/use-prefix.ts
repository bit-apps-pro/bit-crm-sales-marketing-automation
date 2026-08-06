import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

interface PrefixResponse {
  prefix: string
}

export default function usePrefix() {
  const { data, isError, isLoading } = useQuery<Response<PrefixResponse>, Error, string>({
    queryFn: ({ signal }) => queryRequest('invoices/prefix', undefined, undefined, 'GET', { signal }),
    queryKey: ['invoices', 'prefix'],
    retry: false,
    select: res => res.data.prefix
  })

  return {
    isPrefixError: isError,
    isPrefixLoading: isLoading,
    prefix: data
  }
}
