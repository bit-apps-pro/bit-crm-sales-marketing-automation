import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { MODULE_FIELD_CONFIG } from '@features/form-builder/shared/module-field-config'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type UpsertColumnSettingsPayloadType } from '../shared/field-types'

export default function useUpsertColumnSettings(module: string) {
  const { tableQueryKeys } = MODULE_FIELD_CONFIG[module]
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<UpsertColumnSettingsPayloadType>,
    Response<string> | Response<ValidationType<UpsertColumnSettingsPayloadType>>,
    UpsertColumnSettingsPayloadType
  >({
    mutationFn: data => queryRequest('settings/upsert', data),
    mutationKey: ['settings', 'upsert'],
    onError: error => {
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableQueryKeys })
      messageApi?.success(__('Column settings updated successfully'))
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    columnSettingsUpdating: isPending,
    upsertColumnSettings: mutateAsync
  }
}
