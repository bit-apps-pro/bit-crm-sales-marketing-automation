import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { wcSyncSettingsQueryKey } from './use-wc-sync-settings'

export default function useUpsertWcSyncSettings<T extends object>(settingKey: string) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, T>({
    mutationFn: settingValue =>
      queryRequest('settings/integration/upsert', {
        setting_key: settingKey,
        setting_value: settingValue
      }),
    mutationKey: ['settings', 'integration', settingKey, 'upsert'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to save settings'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wcSyncSettingsQueryKey(settingKey) })
    },
    onSuccess: () => {
      messageApi?.success(__('Settings saved successfully'))
    }
  })

  return { isSaving: isPending, saveSettings: mutateAsync }
}
