import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'
import { type Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { type TaskType } from '../shared/task-types'
import useTaskStore from '../state/use-task-store'

type TransformedTaskType = Omit<TaskType, 'due_date'> & { due_date?: Dayjs }

export default function useTask(id: number) {
  const { isEditModalOpen } = useTaskStore()
  const { data, error, isError, isPending } = useQuery<Response<TaskType>, Error, TransformedTaskType>({
    enabled: isEditModalOpen,
    queryFn: ({ signal }) => queryRequest(`activities/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['activities', 'tasks', id],
    select: res => {
      return {
        ...res.data,
        due_date: res.data.due_date ? dayjs(res.data.due_date) : undefined
      }
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isFetchingTask: isPending,
    task: data
  }
}
