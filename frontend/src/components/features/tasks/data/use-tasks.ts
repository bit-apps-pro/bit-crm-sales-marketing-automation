import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useInfiniteQuery } from '@tanstack/react-query'

import { type TasksIndexType } from '../shared/task-types'

const PER_PAGE = 10

interface TaskData {
  tasks: TasksIndexType['data']
  total: number
}

export default function useTask(
  module: string,
  entityId: number,
  status: string,
  search: string,
  priority: string,
  assignedTo: string
) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch
  } = useInfiniteQuery<Response<TasksIndexType>, Error, TaskData>({
    getNextPageParam: lastPage => {
      const { data: page } = lastPage
      const currentPage = Number(page.current_page)
      const perPage = Number(page.per_page)
      return currentPage * perPage < page.total ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      queryRequest(
        'activities/index',
        {},
        {
          assigned_to: assignedTo,
          entityId: entityId || 0,
          module: module || '',
          page: pageParam as number,
          perPage: PER_PAGE,
          priority,
          search,
          status,
          type: 'task'
        },
        'GET',
        { signal }
      ),
    queryKey: [
      'activities',
      'tasks',
      'infinite',
      { assignedTo, entityId, module, priority, search, status }
    ],
    select: response => ({
      tasks: response.pages.flatMap(page => page.data.data),
      total: response.pages[0]?.data.total ?? 0
    })
  })

  if (isError) {
    console.error(error)
  }

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchingTasks: isFetching,
    isPendingTasks: isPending,
    isRefetchingTasks: isRefetching,
    refetchTasks: refetch,
    tasks: data?.tasks,
    total: data?.total ?? 0
  }
}
