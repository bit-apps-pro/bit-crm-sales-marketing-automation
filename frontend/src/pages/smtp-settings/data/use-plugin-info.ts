import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

export interface PluginInfo {
  additionalInfo?: Record<string, unknown>
  canInstallPlugins: boolean
  isInstalled: boolean
  url: string
}

export default function usePluginInfo(pluginSlug: string) {
  const { data, isError, isFetching, isPending, refetch } = useQuery<
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
    isPluginInfoPending: isPending,
    refetchPluginInfo: refetch
  }
}
