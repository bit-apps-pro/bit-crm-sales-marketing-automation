import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type TasksIndexType } from '../shared/task-types'

export default function useTasks(
  module: string,
  entityId: number,
  page: number | string,
  perPage: number | string,
  status: string,
  search: string,
  priority: string,
  assignedTo: string
) {
  const { data, error, isError, isFetching, isPending, isRefetching, refetch } = useQuery<
    Response<TasksIndexType>,
    Error,
    TasksIndexType
  >({
    queryFn: ({ signal }) =>
      queryRequest(
        'activities/index',
        {},
        {
          assigned_to: assignedTo,
          entityId: entityId || 0,
          module: module || '',
          page: Number(page),
          perPage: Number(perPage),
          priority,
          search,
          status,
          type: 'task'
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: [
      'activities',
      'tasks',
      {
        assignedTo,
        entityId,
        module,
        page: Number(page),
        perPage: Number(perPage),
        priority,
        search,
        status
      }
    ],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

  return {
    currentPage: data?.current_page || 1,
    isFetchingTasks: isFetching,
    isPendingTasks: isPending,
    isRefetchingTasks: isRefetching,
    pageSize: data?.per_page || 0,
    refetchTasks: refetch,
    tasks: data?.data,
    total: data?.total || 0
  }
}
