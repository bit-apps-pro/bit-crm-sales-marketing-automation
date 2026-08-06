import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ImapsIndexType } from '../shared/imap-type'

export default function useImaps(page: number) {
  const { data, error, isError, isLoading, isRefetching, refetch } = useQuery<
    Response<ImapsIndexType>,
    Error,
    ImapsIndexType
  >({
    enabled: checkCapability(CAPABILITIES.SETTING.IMAP),
    queryFn: ({ signal }) => queryRequest(`imaps/index/${page}`, {}, undefined, 'GET', { signal }),
    queryKey: ['imaps', 'index', page],
    select: res => res.data,
    staleTime: 5000
  })

  if (isError) {
    console.error(error)
  }

  return {
    imaps: data,
    isImapsLoading: isLoading,
    isRefetchingImaps: isRefetching,
    perPage: data?.per_page || 0,
    refetchImaps: refetch,
    total: data?.total || 0
  }
}
