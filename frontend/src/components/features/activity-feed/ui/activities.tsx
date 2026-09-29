import { __ } from '@common/helpers/i18nWrap'
import useInfiniteScrollTrigger from '@features/activity-feed/data/use-infinite-scroll-trigger'
import { type ActivityType, type ActivityTypeValue } from '@features/activity-feed/shared/activity-types'
import If from '@utilities/If'
import { Typography } from 'antd'
import { LuLoaderCircle, LuNotepadText } from 'react-icons/lu'

import ActivitiesSkeleton from './activities-skeleton'
import ActivityCard from './activity-card'

const activityTypeLabelMap: Record<ActivityTypeValue, string> = {
  call: __('All Calls'),
  meeting: __('All Meetings'),
  task: __('All Tasks')
}

const emptyStateCopyMap: Record<ActivityTypeValue, { description: string; title: string }> = {
  call: {
    description: __('Calls will appear here once they are added.'),
    title: __('No calls yet')
  },
  meeting: {
    description: __('Meetings will appear here once they are added.'),
    title: __('No meetings yet')
  },
  task: {
    description: __('Tasks will appear here once they are added.'),
    title: __('No tasks yet')
  }
}

interface ActivitiesProps {
  activities?: ActivityType[]
  activityType: ActivityTypeValue
  hasMore?: boolean
  isLoading: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  total?: number
}

export default function Activities({
  activities,
  activityType,
  hasMore = false,
  isLoading,
  isLoadingMore = false,
  onLoadMore,
  total
}: ActivitiesProps) {
  const { containerRef, sentinelRef } = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore
  })

  if (isLoading) {
    return <ActivitiesSkeleton />
  }

  /*
    Stacked below `lg`: the divider moves from the inline edge to the block end, and the
    panel takes a viewport-relative height so its inner scroller still has room
    (`h-full` against an auto-height parent would collapse it).
  */
  return (
    <div className="flex max-h-[60vh] flex-col gap-4 border-0 border-b border-solid border-[#EBEAFF] pb-5 lg:h-full lg:max-h-none lg:border-b-0 lg:border-e lg:pb-0 lg:pe-7 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <LuNotepadText className="text-gray-500" />
        <Typography.Text type="secondary">
          {activityTypeLabelMap[activityType]}
          {total !== undefined && total > 0 ? ` (${total})` : ''}
        </Typography.Text>
      </div>
      {activities && activities.length > 0 ? (
        <div
          className="min-h-0 flex-1 space-y-4 overflow-y-auto"
          ref={containerRef}
          style={{
            marginInline: '-16px',
            paddingInline: '16px'
          }}
        >
          {activities.map(activity => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
          <If conditions={isLoadingMore}>
            <div className="flex justify-center py-2">
              <LuLoaderCircle className="animate-spin text-gray-500" size={16} />
            </div>
          </If>
          <div aria-hidden className="h-px" ref={sentinelRef} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <Typography.Title className="block" level={5}>
            {emptyStateCopyMap[activityType].title}
          </Typography.Title>
          <Typography.Text className="block text-sm" type="secondary">
            {emptyStateCopyMap[activityType].description}
          </Typography.Text>
        </div>
      )}
    </div>
  )
}
