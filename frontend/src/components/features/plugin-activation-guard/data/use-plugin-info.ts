import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type PluginInfo } from '../shared/types'

export default function usePluginInfo(pluginSlug: string) {
  const { data, isError, isFetching, isLoading, isPending, refetch } = useQuery<
    Response<PluginInfo>,
    Error,
    PluginInfo
  >({
    queryFn: ({ signal }) =>
      queryRequest('plugins/info', undefined, { slug: pluginSlug }, 'GET', { signal }),
    queryKey: ['plugin-info', pluginSlug],
    select: res => res.data
  })

  return {
    data,
    isPluginInfoError: isError,
    isPluginInfoFetching: isFetching,
    isPluginInfoLoading: isLoading,
    isPluginInfoPending: isPending,
    refetchPluginInfo: refetch
  }
}
