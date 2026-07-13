import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type MeetingType } from '../shared/meeting-types'

export default function useSaveMeeting(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { data, error, isError, isPending, mutateAsync } = useMutation<
    Response<MeetingType>,
    Response<string> | Response<ValidationType<MeetingType>>,
    MeetingType
  >({
    mutationFn: (data: MeetingType) => queryRequest('activities/store', data),
    mutationKey: ['activities', 'meetings', 'store'],
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
      messageApi?.success(__('Meeting created successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities', 'meetings'] })
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
    isStoringMeeting: isPending,
    meeting: data,
    meetingStore: mutateAsync
  }
}
