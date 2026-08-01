import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type CreatedApiKeyType } from '../shared/api-settings-type'

interface CreateApiKeyPayload {
  name: string
  userId: number
}

export default function useCreateApiKey(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<CreatedApiKeyType>,
    Response<string> | Response<ValidationType<CreateApiKeyPayload>>,
    CreateApiKeyPayload
  >({
    mutationFn: data => queryRequest<CreatedApiKeyType>('settings/external-api/keys/store', data),
    mutationKey: ['settings', 'external-api', 'keys', 'store'],
    onError: err => {
      if (typeof err.data === 'object' && err.data !== null) {
        form.setFields(
          Object.entries(err.data).map(([key, messages]) => ({ errors: messages, name: key }))
        )
        return
      }

      messageApi?.error(err.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'external-api', 'index'] })
  })

  if (isError) {
    console.error(error)
  }

  return {
    createApiKey: mutateAsync,
    isCreatingApiKey: isPending
  }
}
