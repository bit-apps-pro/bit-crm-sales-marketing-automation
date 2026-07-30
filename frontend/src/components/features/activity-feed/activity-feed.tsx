import { type ActivityType, type ActivityTypeValue } from '@features/activity-feed/shared/activity-types'
import useActivity from '@pages/tasks/data/use-activity'
import { useSearchParams } from 'react-router'

import Activities from './ui/activities'
import Activity from './ui/activity'
import ActivityDeleteModal from './ui/activity-delete-modal'
import ActivityNotes from './ui/activity-notes'

interface ActivityFeedProps {
  activities?: ActivityType[]
  activityType: ActivityTypeValue
  hasMore?: boolean
  isLoading: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  total?: number
}

export default function ActivityFeed({
  activities,
  activityType,
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  total
}: ActivityFeedProps) {
  const [searchParams] = useSearchParams()
  const id = Number(searchParams.get('id')) || 0
  const { activity, isLoading: isLoadingActivity } = useActivity(id)
  const isValidSelection = Boolean(activity) && activity?.type === activityType

  return (
    <div className="grid h-full min-h-0 flex-1 grid-cols-4 grid-rows-1 items-stretch gap-5 overflow-hidden rounded-[16px] border border-solid border-[#EBEAFF] bg-white p-7 dark:border-neutral-700 dark:bg-neutral-900">
      <Activities
        activities={activities}
        activityType={activityType}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
        total={total}
      />
      <div className="col-span-3 grid h-full min-h-0 grid-cols-3 grid-rows-1 gap-5">
        <Activity activity={activity} activityType={activityType} isLoading={isLoadingActivity} />
        <ActivityNotes activityType={activityType} isValidSelection={isValidSelection} />
      </div>
      <ActivityDeleteModal />
    </div>
  )
}
