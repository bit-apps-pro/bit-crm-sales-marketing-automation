import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { create } from 'mutative'
import { useContext } from 'react'

import { type BusinessSettings } from '../shared/types'

export default function useUpdateBusinessSettings(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string> | Response<ValidationType<BusinessSettings>>,
    BusinessSettings,
    { previousBusinessSettings: Response<BusinessSettings> | undefined }
  >({
    mutationFn: data => queryRequest('settings/business/update', data),
    mutationKey: ['settings', 'business', 'update'],
    onError: (error, _, context) => {
      if (context?.previousBusinessSettings) {
        queryClient.setQueryData(['settings', 'business', 'show'], context.previousBusinessSettings)
      }

      if (error.data instanceof Object) {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || __('Failed to update business settings'))
    },
    onMutate: async newBusinessSettings => {
      await queryClient.cancelQueries({ queryKey: ['settings', 'business', 'show'] })
      const previousBusinessSettings = queryClient.getQueryData<Response<BusinessSettings>>([
        'settings',
        'business',
        'show'
      ])
      queryClient.setQueryData(
        ['settings', 'business', 'show'],
        (prev: Response<BusinessSettings> | undefined) => {
          if (!prev) return prev

          return create(prev, draft => {
            draft.data = newBusinessSettings
          })
        }
      )
      return { previousBusinessSettings }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'business', 'show'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Business settings updated successfully'))
    }
  })
  return {
    businessSettingsUpdating: isPending,
    updateBusinessSettings: mutateAsync
  }
}
