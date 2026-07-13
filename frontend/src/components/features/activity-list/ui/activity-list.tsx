import { type ActivityType } from '@features/activity-list/shared/activity-types'

import ActivityCard from './activity-card'

interface ActivityListProps {
  activities?: ActivityType[]
  type?: string
}

export default function ActivityList({ activities, type }: ActivityListProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">
      {activities?.map(activity => (
        <ActivityCard activity={activity} key={activity.id} type={type} />
      ))}
    </div>
  )
}
