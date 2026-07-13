import { __ } from '@common/helpers/i18nWrap'
import ActivityList from '@components/features/activity-list'
import ActivityListFilterPage from '@components/features/activity-list/ui/activity-list-filter-page'
import ActivityListSkeleton from '@components/features/activity-list/ui/activity-list-skeleton'
import useCalls from '@components/features/calls/data/use-calls'
import useCallStore from '@components/features/calls/state/use-call-store'
import CallCreateModal from '@features/calls/ui/call-create-modal'
import CallEditModal from '@features/calls/ui/call-edit-modal'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import { Button, Input, Typography } from 'antd'
import { type ChangeEvent } from 'react'
import { useState } from 'react'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

export default function CallsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const module = searchParams.get('module') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useCallStore()
  const page = searchParams.get('page') || 1
  const perPage = searchParams.get('perPage') || 10
  const status = searchParams.get('status') || ''
  const assignedTo = searchParams.get('assigned_to') || ''

  const { calls, isPendingCalls, totalCalls } = useCalls(
    module,
    0,
    page,
    perPage,
    status,
    searchDebounced,
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

      <If conditions={isPendingCalls}>
        <ActivityListSkeleton quantity={4} />
      </If>
      <If conditions={!isPendingCalls && totalCalls === 0}>
        <div className="flex items-center justify-center py-16 text-gray-400">
          {__('No calls found')}
        </div>
      </If>
      <If conditions={!isPendingCalls && totalCalls > 0}>
        <ActivityList activities={calls} type="page" />
      </If>
      <If conditions={!isPendingCalls && totalCalls > 0}>
        <div className="mt-4 flex items-center justify-end">
          <Pagination total={totalCalls} />
        </div>
      </If>

      <CallCreateModal variant="page" />
      <CallEditModal variant="page" />
    </div>
  )
}
