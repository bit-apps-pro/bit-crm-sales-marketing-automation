import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type TaskType } from '../shared/task-types'

export default function useSaveTask(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { data, error, isError, isPending, mutateAsync } = useMutation<
    Response<TaskType>,
    Response<string> | Response<ValidationType<TaskType>>,
    TaskType
  >({
    mutationFn: (data: TaskType) => queryRequest<TaskType>('activities/store', data),
    mutationKey: ['tasks', 'store'],
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
      messageApi?.success(__('Task created successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities', 'tasks'] })
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
    isStoringTask: isPending,
    task: data,
    taskStore: mutateAsync
  }
}
