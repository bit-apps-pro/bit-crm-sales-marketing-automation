import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type CallType } from '../shared/call-types'

export default function useSaveCall(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { data, error, isError, isPending, mutateAsync } = useMutation<
    Response<CallType>,
    Response<string> | Response<ValidationType<CallType>>,
    CallType
  >({
    mutationFn: (data: CallType) => queryRequest('activities/store', data),
    mutationKey: ['activities', 'calls', 'store'],
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
      messageApi?.success(__('Call created successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities', 'calls'] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'upcoming'] })
      queryClient.invalidateQueries({
        queryKey: ['entity-related-lists-count']
      })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    call: data,
    callStore: mutateAsync,
    isStoringCall: isPending
  }
}
