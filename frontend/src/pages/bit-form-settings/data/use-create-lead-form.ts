import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import {
  BITFORM_ABSENT_CODE,
  type BitFormApiError,
  type CreateLeadFormPayload,
  type CreateLeadFormResponse
} from '../shared/types'
import { bitFormFormsQueryKey } from './use-bit-form-forms'

interface UseCreateLeadFormOptions {
  onBitFormAbsent?: () => void
  onCreated: (createUrl: string) => void
}

export default function useCreateLeadForm({ onBitFormAbsent, onCreated }: UseCreateLeadFormOptions) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutate } = useMutation<
    Response<CreateLeadFormResponse>,
    BitFormApiError,
    CreateLeadFormPayload
  >({
    mutationFn: payload => queryRequest('bit-form/create-form', payload),
    mutationKey: ['bit-form', 'create-form'],
    onError: error => {
      // Bit Form disappeared mid-session: refresh the list so the panel swaps
      // to the update notice, and let the caller dismiss the modal over it.
      if (error.code === BITFORM_ABSENT_CODE) {
        queryClient.invalidateQueries({ queryKey: bitFormFormsQueryKey })
        onBitFormAbsent?.()
      }

      messageApi?.error(error.message || __('Failed to create the form'))
    },
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: bitFormFormsQueryKey })
      // Opening the tab is the caller's job: only it can tell whether the popup
      // blocker swallowed the window, which decides what the modal shows next.
      onCreated(res.data.createUrl)
    }
  })

  return { createLeadForm: mutate, isCreating: isPending }
}
