import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import { type UninstallSetting } from '../shared/types'

export default function useUpdateUninstallSetting() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<UninstallSetting>,
    Response<string>,
    UninstallSetting,
    { previousData: Response<UninstallSetting> | undefined }
  >({
    mutationFn: payload => queryRequest('settings/uninstall/update', payload),
    mutationKey: ['settings', 'uninstall', 'update'],
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['settings', 'uninstall'], context.previousData)
      }
      if (typeof error.data === 'string') {
        messageApi?.error(error.message || error.data)
      }
    },
    onMutate: variables => {
      queryClient.cancelQueries({ queryKey: ['settings', 'uninstall'] })

      const previousData = queryClient.getQueryData<Response<UninstallSetting>>([
        'settings',
        'uninstall'
      ])

      queryClient.setQueryData<Response<UninstallSetting>>(['settings', 'uninstall'], old => {
        if (!old) return

        return create(old, draft => {
          Object.assign(draft.data, variables)
        })
      })

      return { previousData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'uninstall'] })
      messageApi?.success(__('Uninstall preference saved'))
    }
  })

  return {
    isUpdatingUninstallSetting: isPending,
    updateUninstallSetting: mutateAsync
  }
}
