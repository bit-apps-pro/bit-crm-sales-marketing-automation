import queryRequest from '@common/helpers/request'
import { type InfiniteData, type QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { useParams } from 'react-router'

interface RelatedFieldOptionsParams {
  columnSelect?: string[]
  currentValue?: number | string
  perPage?: number
  queryParams?: Record<string, unknown>
  relatedModule: string
  searchTerm?: string
  selectedValue?: number | string
  sourceModule?: string
}

export interface RelatedFieldOption {
  data?: Record<string, unknown>
  label: string
  value: number | string
}

interface RelatedFieldOptionsResponse {
  current_page: number
  data: RelatedFieldOption[]
  pages: number
  per_page: number
  total: number
}

export default function useLookupSelectOptions({
  columnSelect = [],
  perPage,
  queryParams,
  relatedModule,
  searchTerm = '',
  selectedValue,
  sourceModule
}: RelatedFieldOptionsParams) {
  const { id } = useParams()
  const errorMessageRef = useRef<string | undefined>(undefined)

  const entityId = sourceModule === relatedModule ? Number(id) : undefined

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isPending, refetch } =
    useInfiniteQuery<
      RelatedFieldOptionsResponse,
      Error,
      Omit<InfiniteData<RelatedFieldOptionsResponse>, 'pages'> & {
        pages: RelatedFieldOption[]
        total: number | undefined
      },
      QueryKey,
      number
    >({
      enabled: Boolean(relatedModule),
      getNextPageParam: lastPage => {
        const { current_page: currentPage, pages } = lastPage
        return currentPage < pages ? currentPage + 1 : undefined
      },
      initialPageParam: 1,
      queryFn: ({ pageParam = 1, signal }) =>
        queryRequest<RelatedFieldOptionsResponse>(
          'common/related-field-options',
          {
            args: {
              ...queryParams,
              columnSelect
            },
            entityId,
            pageNo: pageParam,
            perPage,
            relatedModule,
            searchTerm,
            selectedValue
          },
          undefined,
          'POST',
          { signal }
        ).then(res => {
          const data = res?.data
          if (data && 'error' in data && typeof data.error === 'string') {
            errorMessageRef.current = data.error
            return { current_page: pageParam, data: [], pages: 0, per_page: perPage || 20, total: 0 }
          }

          errorMessageRef.current = undefined
          return res.data
        }),
      queryKey: [
        'related-field-options',
        relatedModule,
        searchTerm,
        perPage,
        selectedValue,
        Number(id),
        queryParams
      ],
      select: res => {
        const data = {
          ...res,
          pages: res?.pages.flatMap(page => page.data),
          total: res?.pages[0]?.total
        }
        return data
      }
    })

  return {
    data: data?.pages,
    errorMessage: errorMessageRef.current,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPending,
    refetch,
    total: data?.total || 0
  }
}
