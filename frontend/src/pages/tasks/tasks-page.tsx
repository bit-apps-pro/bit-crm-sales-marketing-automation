import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import useTaskStore from '@components/features/tasks/state/use-task-store'
import ActivityListFilterPage from '@features/activity-feed/ui/activity-list-filter-page'
import useInfiniteTasks from '@features/tasks/data/use-tasks'
import TaskCreateModal from '@features/tasks/ui/task-create-modal'
import TaskEditModal from '@features/tasks/ui/task-edit-modal'
import If from '@utilities/If'
import { Button, Input, Typography } from 'antd'
import { type ChangeEvent, useState } from 'react'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

import ActivitiesBoard from '../../components/features/activity-feed/activity-feed'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const module = searchParams.get('module') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useTaskStore()
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const assignedTo = searchParams.get('assigned_to') || ''

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchingTasks,
    isTasksLoading,
    tasks,
    total
  } = useInfiniteTasks(module, 0, status, searchDebounced, priority, assignedTo)

  useDebounce(() => setSearchDebounced(search), 300, [search])
  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => {
      if (!e.target.value) {
        prev.delete('search')
        return prev
      }

      prev.set('search', e.target.value)
      return prev
    })
  }

  return (
    <div className="flex h-full flex-col px-6 py-4 dark:bg-transparent">
      <div className="mb-4 flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Tasks')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'task_create' })}
            size="large"
            type="primary"
          >
            {__('New Task')}
          </Button>
          <If conditions={isFetchingTasks}>
            <LoadingOutlined />
          </If>
        </div>

        <div className="flex items-center gap-2">
          <ActivityListFilterPage showPriority />
          <Input
            allowClear
            className="w-52 rounded-full"
            defaultValue={search}
            onChange={handleSearchTermChange}
            placeholder={__('Search')}
            prefix={<LuSearch />}
            type="search"
          />
        </div>
      </div>
      <ActivitiesBoard
        activities={tasks}
        activityType="task"
        hasMore={Boolean(hasNextPage)}
        isLoading={isTasksLoading}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        total={total}
      />
      <TaskCreateModal variant="page" />
      <TaskEditModal variant="page" />
    </div>
  )
}
