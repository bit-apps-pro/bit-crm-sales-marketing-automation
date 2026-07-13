import { __ } from '@common/helpers/i18nWrap'
import ActivityList from '@components/features/activity-list'
import ActivityListFilterPage from '@components/features/activity-list/ui/activity-list-filter-page'
import ActivityListSkeleton from '@components/features/activity-list/ui/activity-list-skeleton'
import useTasks from '@components/features/tasks/data/use-tasks'
import useTaskStore from '@components/features/tasks/state/use-task-store'
import TaskCreateModal from '@features/tasks/ui/task-create-modal'
import TaskEditModal from '@features/tasks/ui/task-edit-modal'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import { Button, Input, Typography } from 'antd'
import { type ChangeEvent } from 'react'
import { useState } from 'react'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const module = searchParams.get('module') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useTaskStore()
  const page = searchParams.get('page') || 1
  const perPage = searchParams.get('perPage') || 10
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const assignedTo = searchParams.get('assigned_to') || ''

  const { isPendingTasks, tasks, total } = useTasks(
    module,
    0,
    page,
    perPage,
    status,
    searchDebounced,
    priority,
    assignedTo
  )

  useDebounce(() => setSearchDebounced(search), 300, [search])
  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => {
      if (prev.get('page') !== '1') {
        prev.set('page', '1')
      }

      if (!e.target.value) {
        prev.delete('search')
        return prev
      }

      prev.set('search', e.target.value)
      return prev
    })
  }

  return (
    <div className="px-6 py-4 dark:bg-transparent">
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

      <If conditions={isPendingTasks}>
        <ActivityListSkeleton quantity={4} />
      </If>

      <If conditions={!isPendingTasks && total === 0}>
        <div className="flex items-center justify-center py-16 text-gray-400">
          {__('No tasks found')}
        </div>
      </If>
      <If conditions={!isPendingTasks && total > 0}>
        <ActivityList activities={tasks} type="page" />
      </If>

      <If conditions={!isPendingTasks && total > 0}>
        <div className="mt-4 flex items-center justify-end">
          <Pagination total={total} />
        </div>
      </If>

      <TaskCreateModal variant="page" />
      <TaskEditModal variant="page" />
    </div>
  )
}
