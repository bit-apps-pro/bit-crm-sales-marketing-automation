import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Typography } from 'antd'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

import ActivityList from '../activity-list'
import ActivityListFilter from '../activity-list/ui/activity-list-filter'
import ActivityListSkeleton from '../activity-list/ui/activity-list-skeleton'
import useTasks from './data/use-tasks'
import useTaskStore from './state/use-task-store'
import TaskCreateModal from './ui/task-create-modal'
import TaskEditModal from './ui/task-edit-modal'

interface TasksProps {
  entityId: number
  fields: FieldItem[]
  module: string
}

const generateFieldOptions = (fields: FieldItem[]) => {
  const options: { label: string; value: string }[] = []

  fields.forEach(field => {
    if (field.type === 'section') {
      return
    }

    if (field.group_fields) {
      const nestedOptions = generateFieldOptions(Object.values(field.group_fields))
      options.push(...nestedOptions)
    } else {
      options.push({
        label: field.label,
        value: `{${field.field_key}}`
      })
    }
  })

  return options
}

export default function Tasks({ entityId, fields, module }: TasksProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useTaskStore()
  const page = searchParams.get('page') || 1
  const perPage = searchParams.get('perPage') || 10
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const assignedTo = searchParams.get('assigned_to') || ''
  const { isFetchingTasks, isPendingTasks, isRefetchingTasks, tasks, total } = useTasks(
    module,
    entityId,
    page,
    perPage,
    status,
    searchDebounced,
    priority,
    assignedTo
  )

  useDebounce(() => setSearchDebounced(search), 300, [search])

  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Tasks')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'task_create' })}
          >
            {__('New')}
          </Button>
          <If conditions={isFetchingTasks || isRefetchingTasks}>
            <LoadingOutlined />
          </If>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ActivityListFilter showPriority />
          <SearchInput queryKey="search" />
        </div>
      </div>
      {isPendingTasks ? <ActivityListSkeleton quantity={4} /> : <ActivityList activities={tasks} />}
      <TaskCreateModal
        entityId={entityId}
        fieldOptions={generateFieldOptions(fields)}
        module={module}
        variant="component"
      />
      <TaskEditModal fieldOptions={generateFieldOptions(fields)} variant="component" />
      <If conditions={!isFetchingTasks && total > 0}>
        <Pagination total={total} />
      </If>
    </div>
  )
}
