import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type ApiSettingsType } from '../shared/api-settings-type'

export default function useUpdateApiSettings() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<ApiSettingsType>,
    Response<string>,
    { enabled: boolean }
  >({
    mutationFn: data => queryRequest<ApiSettingsType>('settings/external-api/update', data),
    mutationKey: ['settings', 'external-api', 'update'],
    onError: err => messageApi?.error(err.message),
    onSuccess: res => {
      messageApi?.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['settings', 'external-api', 'index'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingApiSettings: isPending,
    updateApiSettings: mutateAsync
  }
}
