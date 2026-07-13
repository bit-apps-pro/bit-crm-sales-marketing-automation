import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { MODULE_FIELD_CONFIG } from '../shared/module-field-config'

type FieldSettingValue = Record<string, Record<string, unknown>>

export default function useUpdateFieldSettings(module: string, form?: FormInstance) {
  const { queryKeys, settingsKey } = MODULE_FIELD_CONFIG[module]
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string | ValidationType<FieldSettingValue>>,
    FieldSettingValue
  >({
    mutationFn: (settingValue: FieldSettingValue) =>
      queryRequest('settings/upsert', { setting_key: settingsKey, setting_value: settingValue }),
    mutationKey: ['settings', 'upsert'],
    onError: error => {
      if (error.data instanceof Object && form) {
        const errors = Object.entries(error.data).map(([name, messages]) => ({
          errors: messages,
          name
        }))
        form.setFields(errors)
        return
      }
      messageApi?.error(error.message || __('Could not update field setting'))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys })
    }
  })

  return {
    isUpdateFieldSettingsPending: isPending,
    updateFieldSettings: mutateAsync
  }
}
