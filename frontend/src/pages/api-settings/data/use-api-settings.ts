import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ApiSettingsIndexType } from '../shared/api-settings-type'

interface UseApiSettingsParams {
  page: number
  perPage: number
}

export default function useApiSettings({ page, perPage }: UseApiSettingsParams) {
  const { data, error, isError, isFetching, isLoading, refetch } = useQuery<
    Response<ApiSettingsIndexType>,
    Error,
    ApiSettingsIndexType
  >({
    enabled: checkCapability(CAPABILITIES.SETTING.API),
    queryFn: ({ signal }) =>
      queryRequest('settings/external-api/index', {}, { page, perPage }, 'GET', { signal }),
    queryKey: ['settings', 'external-api', 'index', page, perPage],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

  return {
    apiSettings: data?.settings,
    isApiSettingsLoading: isLoading,
    isFetchingApiSettings: isFetching,
    refetchApiSettings: refetch,
    total: data?.users?.total,
    users: data?.users?.data || []
  }
}
