import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type TaskType } from '../shared/task-types'

export default function useUpdateTask(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<TaskType>,
    Response<string> | Response<ValidationType<TaskType>>,
    TaskType
  >({
    mutationFn: data => queryRequest('activities/update', data),
    mutationKey: ['tasks', 'update'],
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
      messageApi?.success(__('Task updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'upcoming'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingTask: isPending,
    updateTask: mutateAsync
  }
}
