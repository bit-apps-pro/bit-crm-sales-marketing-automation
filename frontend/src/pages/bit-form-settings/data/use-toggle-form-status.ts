import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type BitFormApiError } from '../shared/types'
import { bitFormFormsQueryKey } from './use-bit-form-forms'

interface ToggleFormStatusPayload {
  formId: number
  status: 0 | 1
}

export default function useToggleFormStatus() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutate, variables } = useMutation<
    Response<null>,
    BitFormApiError,
    ToggleFormStatusPayload
  >({
    mutationFn: payload => queryRequest('bit-form/toggle-form-status', payload),
    mutationKey: ['bit-form', 'toggle-form-status'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to update the form status'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bitFormFormsQueryKey })
    },
    onSuccess: response => {
      messageApi?.success(response.message || __('Form status updated'))
    }
  })

  return {
    isToggling: isPending,
    toggleFormStatus: mutate,
    togglingFormId: isPending ? variables?.formId : undefined
  }
}
