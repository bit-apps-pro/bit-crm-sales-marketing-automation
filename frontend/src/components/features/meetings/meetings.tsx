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
import useMeetings from './data/use-meetings'
import useMeetingStore from './state/use-meeting-store'
import MeetingCreateModal from './ui/meeting-create-modal'
import MeetingEditModal from './ui/meeting-edit-modal'

interface MeetingsProps {
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

export default function Meetings({ entityId, fields, module }: MeetingsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useMeetingStore()
  const page = searchParams.get('page') || 1
  const perPage = searchParams.get('perPage') || 10
  const status = searchParams.get('status') || ''
  const assignedTo = searchParams.get('assigned_to') || ''
  const { isFetchingMeetings, isPendingMeetings, isRefetchingMeetings, meetings, total } = useMeetings(
    module,
    entityId,
    page,
    perPage,
    status,
    searchDebounced,
    assignedTo
  )

  useDebounce(() => setSearchDebounced(search), 300, [search])

  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Meetings')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'meeting_create' })}
            type="primary"
          >
            {__('New')}
          </Button>
          <If conditions={isFetchingMeetings || isRefetchingMeetings}>
            <LoadingOutlined />
          </If>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ActivityListFilter />
          <SearchInput queryKey="search" />
        </div>
      </div>
      {isPendingMeetings ? (
        <ActivityListSkeleton quantity={4} />
      ) : (
        <ActivityList activities={meetings} />
      )}
      <MeetingCreateModal
        entityId={entityId}
        fieldOptions={generateFieldOptions(fields)}
        module={module}
        variant="component"
      />
      <If conditions={!isPendingMeetings && total > 0}>
        <Pagination total={total} />
      </If>
      <MeetingEditModal fieldOptions={generateFieldOptions(fields)} variant="component" />
    </div>
  )
}
