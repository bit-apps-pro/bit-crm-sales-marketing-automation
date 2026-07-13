import { __ } from '@common/helpers/i18nWrap'
import { Empty, Skeleton, Typography } from 'antd'

import useUpcomingActivities from '../data/use-upcoming-activities'
import EntityUpcomingActivity from './entity-upcoming-activity'

interface EntityUpcomingActivitiesProps {
  entityId: number
  module: string
}

export default function EntityUpcomingActivities({ entityId, module }: EntityUpcomingActivitiesProps) {
  const { isUpcomingActivitiesLoading, upcomingActivities } = useUpcomingActivities(module, entityId)

  if (isUpcomingActivitiesLoading) {
    return (
      <div className="flex h-full flex-col rounded-md border border-solid border-[#EBEAFF] bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="space-y-4">
          <Skeleton.Input active block size="default" />
          <Skeleton.Input active block size="default" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-md border border-solid border-[#EBEAFF] bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <Typography.Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
        {__('Upcoming Activities')}
      </Typography.Text>

      {upcomingActivities.length === 0 ? (
        <Empty
          className="my-0"
          description={__('No upcoming activities')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="space-y-3">
          {upcomingActivities.map(activity => (
            <EntityUpcomingActivity activity={activity} key={activity.id} />
          ))}
        </div>
      )}
    </div>
  )
}
