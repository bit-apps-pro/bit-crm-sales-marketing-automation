import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type BusinessSettings } from '../shared/types'

export default function useBusinessSettings() {
  const { data, isFetching, isPending, refetch } = useQuery<
    Response<BusinessSettings>,
    Error,
    BusinessSettings
  >({
    enabled: checkCapability(CAPABILITIES.SETTING.GENERAL),
    queryFn: ({ signal }) =>
      queryRequest('settings/business/show', undefined, undefined, 'GET', {
        signal
      }),
    queryKey: ['settings', 'business', 'show'],
    retry: false,
    select: response => response.data
  })

  return {
    businessSettings: data,
    isBusinessSettingsFetching: isFetching,
    isBusinessSettingsPending: isPending,
    refetchBusinessSettings: refetch
  }
}
