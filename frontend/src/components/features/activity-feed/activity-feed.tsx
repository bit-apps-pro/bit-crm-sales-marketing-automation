import { type ActivityType, type ActivityTypeValue } from '@features/activity-feed/shared/activity-types'

import useActivitySelection from './data/use-activity-selection'
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
  const { activity, adjacentId, isLoadingActivity, isPlaceholderData, isValidSelection } =
    useActivitySelection({ activities, activityType, isLoading })

  /*
    Desktop is a fixed-height master/detail board: four columns in one row, each panel
    scrolling internally inside `overflow-hidden`.

    Below `lg` that inverts. The three panels stack and the container grows with them
    (auto height, visible overflow), so the page scrolls rather than each panel -- three
    independently scrolling regions inside a scrolling page is unusable on touch.
    `grid-rows-1` has to go too: with stacked children it would force all three into a
    single row's height and crush them.

    `lg` rather than `md` because this is a four-across layout; at 768px the columns are
    still too narrow to read.
  */
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-5 overflow-visible rounded-[16px] border border-solid border-[#EBEAFF] bg-white p-4 sm:p-7 lg:h-full lg:grid-cols-4 lg:grid-rows-1 lg:overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
      <Activities
        activities={activities}
        activityType={activityType}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
        total={total}
      />
      <div className="grid min-h-0 grid-cols-1 gap-5 lg:col-span-3 lg:h-full lg:grid-cols-3 lg:grid-rows-1">
        <Activity
          activity={activity}
          activityType={activityType}
          isLoading={isLoadingActivity}
          isPlaceholderData={isPlaceholderData}
        />
        <ActivityNotes activityType={activityType} isValidSelection={isValidSelection} />
      </div>
      <ActivityDeleteModal adjacentId={adjacentId} />
    </div>
  )
}
