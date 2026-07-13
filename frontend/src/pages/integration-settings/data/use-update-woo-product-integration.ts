import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import { type IntegrationSettingsResponse, type UpdateIntegrationSettingsPayload } from '../shared/types'

export default function useUpdateWooProductIntegration() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<IntegrationSettingsResponse>,
    Response<string>,
    UpdateIntegrationSettingsPayload,
    { previousData: Response<IntegrationSettingsResponse> | undefined }
  >({
    mutationFn: payload => queryRequest('settings/upsert', payload),
    mutationKey: ['integration', 'woo-product', 'update'],
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['integration', 'woo-product'], context.previousData)
      }
      if (typeof error.data === 'string') {
        messageApi?.error(error.message || error.data)
      }
    },
    onMutate: variables => {
      queryClient.cancelQueries({ queryKey: ['integration', 'woo-product'] })

      const previousData = queryClient.getQueryData<Response<IntegrationSettingsResponse>>([
        'integration',
        'woo-product'
      ])

      queryClient.setQueryData<Response<IntegrationSettingsResponse>>(
        ['integration', 'woo-product'],
        old => {
          if (!old) return

          return create(old, draft => {
            Object.assign(draft.data, variables.setting_value)
          })
        }
      )

      return { previousData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration', 'woo-product'] })
      messageApi?.success(__('Integration settings updated successfully'))
    }
  })

  return {
    isUpdating: isPending,
    updateSettings: mutateAsync
  }
}
