import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import ActivitiesBoard from '@features/activity-feed/activity-feed'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import If from '@utilities/If'
import SearchInput from '@utilities/search-input'
import { Button, Typography } from 'antd'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

import ActivityListFilter from '../activity-feed/ui/activity-list-filter'
import useInfiniteMeetings from './data/use-meetings'
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
  const status = searchParams.get('status') || ''
  const assignedTo = searchParams.get('assigned_to') || ''
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingMeetings,
    isFetchingNextPage,
    isMeetingsLoading,
    isRefetchingMeetings,
    meetings,
    total
  } = useInfiniteMeetings(module, entityId, status, searchDebounced, assignedTo)

  useDebounce(() => setSearchDebounced(search), 300, [search])

  return (
    <div className="flex h-[80vh] min-h-0 flex-col space-y-5">
      <div className="flex shrink-0 justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Meetings')}
          </Typography.Title>
          <If conditions={checkCapability(CAPABILITIES.ACTIVITY.CREATE)}>
            <Button
              className="rounded-full"
              icon={<LuPlus />}
              onClick={() => handleModal('open', setSearchParams, { modal: 'meeting_create' })}
              type="primary"
            >
              {__('New')}
            </Button>
          </If>
          <If conditions={isFetchingMeetings || isRefetchingMeetings}>
            <LoadingOutlined />
          </If>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ActivityListFilter />
          <SearchInput queryKey="search" />
        </div>
      </div>
      <ActivitiesBoard
        activities={meetings}
        activityType="meeting"
        hasMore={Boolean(hasNextPage)}
        isLoading={isMeetingsLoading}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        total={total}
      />
      <MeetingCreateModal
        entityId={entityId}
        fieldOptions={generateFieldOptions(fields)}
        module={module}
        variant="component"
      />
      <MeetingEditModal fieldOptions={generateFieldOptions(fields)} variant="component" />
    </div>
  )
}
