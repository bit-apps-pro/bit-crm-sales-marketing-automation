import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import useMeetingStore from '@components/features/meetings/state/use-meeting-store'
import ActivitiesBoard from '@features/activity-feed/activity-feed'
import ActivityListFilterPage from '@features/activity-feed/ui/activity-list-filter-page'
import useInfiniteMeetings from '@features/meetings/data/use-meetings'
import MeetingCreateModal from '@features/meetings/ui/meeting-create-modal'
import MeetingEditModal from '@features/meetings/ui/meeting-edit-modal'
import If from '@utilities/If'
import { Button, Input, Typography } from 'antd'
import { type ChangeEvent, useState } from 'react'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

export default function MeetingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const module = searchParams.get('module') || ''
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
    meetings,
    total
  } = useInfiniteMeetings(module, 0, status, searchDebounced, assignedTo)

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
    <div className="flex h-full flex-col px-6 py-4">
      <div className="mb-4 flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Meetings')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'meeting_create' })}
            size="large"
            type="primary"
          >
            {__('New Meeting')}
          </Button>
          <If conditions={isFetchingMeetings}>
            <LoadingOutlined />
          </If>
        </div>

        <div className="flex items-center gap-2">
          <ActivityListFilterPage />
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
        activities={meetings}
        activityType="meeting"
        hasMore={Boolean(hasNextPage)}
        isLoading={isMeetingsLoading}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        total={total}
      />
      <MeetingCreateModal variant="page" />
      <MeetingEditModal variant="page" />
    </div>
  )
}
