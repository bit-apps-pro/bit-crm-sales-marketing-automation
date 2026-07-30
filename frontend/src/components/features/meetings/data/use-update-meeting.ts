import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type MeetingType } from '../shared/meeting-types'

export default function useUpdateMeeting(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<MeetingType>,
    Response<string> | Response<ValidationType<MeetingType>>,
    MeetingType
  >({
    mutationFn: data => queryRequest('activities/update', data),
    mutationKey: ['activities', 'meetings', 'update'],
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
      messageApi?.success(__('Meeting updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingMeeting: isPending,
    updateMeeting: mutateAsync
  }
}
