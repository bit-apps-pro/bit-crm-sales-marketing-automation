import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type CallType } from '../shared/call-types'

export default function useUpdateCall(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<CallType>,
    Response<string> | Response<ValidationType<CallType>>,
    CallType
  >({
    mutationFn: data => queryRequest<CallType>('activities/update', data),
    mutationKey: ['activities', 'calls', 'update'],
    onError: error => {
      if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      messageApi?.success(__('Call updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingCall: isPending,
    updateCall: mutateAsync
  }
}
