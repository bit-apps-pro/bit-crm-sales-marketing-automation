import { formatDateTime } from '@common/helpers/globalHelpers'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ImportsDataParams, type ImportsDataResponse } from '../shared/types'

export function useImportsData(params: ImportsDataParams) {
  const { data, isFetching, isPending, refetch } = useQuery<
    Response<ImportsDataResponse>,
    Error,
    ImportsDataResponse
  >({
    queryFn: ({ signal }) =>
      queryRequest('import-export-list/index', undefined, { ...params, type: 'import' }, 'GET', {
        signal
      }),
    queryKey: ['import-export-list', 'index', 'import', params.module, params.page, params.perPage],
    select: res => {
      const formattedData = res.data.data.map(item => ({
        ...item,
        created_at: formatDateTime(item.created_at)
      }))
      return { data: formattedData, total: res.data.total }
    }
  })

  return {
    importsData: data?.data || [],
    isImportsDataFetching: isFetching,
    isImportsDataPending: isPending,
    refetchImportsData: refetch,
    totalImportsData: data?.total || 0
  }
}
