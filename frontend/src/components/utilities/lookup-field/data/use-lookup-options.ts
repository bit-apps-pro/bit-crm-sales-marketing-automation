import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

export interface LookupOption {
  label: string
  value: number | string
}

interface LookupOptionsParams {
  pageNo?: number
  perPage?: number
  relatedModule: string
  searchTerm?: string
}

interface PaginatedLookupOptions {
  current_page: number
  data: LookupOption[]
  per_page: number
  total: number
}

export default function useLookupOptions({
  pageNo,
  perPage,
  relatedModule,
  searchTerm = ''
}: LookupOptionsParams) {
  const { data, error, isError, isFetching } = useQuery<
    Response<LookupOption[] | PaginatedLookupOptions>,
    Error,
    LookupOption[] | PaginatedLookupOptions
  >({
    enabled: Boolean(relatedModule && searchTerm?.trim()),
    queryFn: ({ signal }) =>
      queryRequest(
        'common/related-field-options',
        {
          pageNo,
          perPage,
          relatedModule,
          searchTerm: searchTerm.trim()
        },
        undefined,
        'POST',
        { signal }
      ),
    queryKey: ['common', 'related-field-options', relatedModule, searchTerm.trim(), pageNo, perPage],
    select: data => data.data
  })

  if (isError) {
    console.error('Error fetching related field options:', error)
  }

  return {
    currentPage: data && 'current_page' in data ? data.current_page || 1 : 1,
    error,
    isError,
    isFetching,
    options: Array.isArray(data) ? data : data?.data || [],
    perPage: data && 'per_page' in data ? data.per_page || perPage : perPage,
    total: data && 'total' in data ? data.total || 0 : 0
  }
}
