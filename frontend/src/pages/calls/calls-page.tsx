import { __ } from '@common/helpers/i18nWrap'
import useCallStore from '@components/features/calls/state/use-call-store'
import ActivitiesBoard from '@features/activity-feed/activity-feed'
import ActivityListFilterPage from '@features/activity-feed/ui/activity-list-filter-page'
import useInfiniteCalls from '@features/calls/data/use-calls'
import CallCreateModal from '@features/calls/ui/call-create-modal'
import CallEditModal from '@features/calls/ui/call-edit-modal'
import { Button, Input, Typography } from 'antd'
import { type ChangeEvent, useState } from 'react'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

export default function CallsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const module = searchParams.get('module') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useCallStore()
  const status = searchParams.get('status') || ''
  const assignedTo = searchParams.get('assigned_to') || ''

  const { calls, fetchNextPage, hasNextPage, isFetchingNextPage, isPendingCalls, totalCalls } =
    useInfiniteCalls(module, 0, status, searchDebounced, assignedTo)

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
            {__('Calls')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'call_create' })}
            size="large"
            type="primary"
          >
            {__('New Call')}
          </Button>
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
        activities={calls}
        activityType="call"
        hasMore={Boolean(hasNextPage)}
        isLoading={isPendingCalls}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        total={totalCalls}
      />
      <CallCreateModal variant="page" />
      <CallEditModal variant="page" />
    </div>
  )
}
