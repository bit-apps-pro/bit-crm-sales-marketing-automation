import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type WcSyncSettingsResponse } from '../shared/types'

export const wcSyncSettingsQueryKey = (settingKey: string) => ['settings', 'integration', settingKey]

export default function useWcSyncSettings(settingKey: string) {
  const { data, isFetching, isLoading } = useQuery<
    Response<WcSyncSettingsResponse>,
    Error,
    undefined | WcSyncSettingsResponse
  >({
    enabled: checkCapability(CAPABILITIES.SETTING.INTEGRATION),
    queryFn: ({ signal }) =>
      queryRequest('settings/integration/show', undefined, { setting_key: settingKey }, 'GET', {
        signal
      }),
    queryKey: wcSyncSettingsQueryKey(settingKey),
    retry: false,
    select: response => response.data ?? undefined
  })

  return {
    isSettingsFetching: isFetching,
    isSettingsLoading: isLoading,
    isWooPluginActive: data?.is_woo_plugin_active ?? false,
    settings: data?.setting_value ?? undefined
  }
}
