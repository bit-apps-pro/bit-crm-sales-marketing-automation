import { type ActivityType } from '@features/activity-list/shared/activity-types'
import { useMemo } from 'react'

import ActivityCard from './activity-card'

interface ActivityListProps {
  activities?: ActivityType[]
  type?: string
}

export default function ActivityList({ activities = [], type }: ActivityListProps) {
  const [leftColumnActivities, rightColumnActivities] = useMemo(() => {
    const columns: [ActivityType[], ActivityType[]] = [[], []]

    activities.forEach((activity, index) => {
      columns[index % 2].push(activity)
    })

    return columns
  }, [activities])

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        {leftColumnActivities.map(activity => (
          <ActivityCard activity={activity} key={activity.id} type={type} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {rightColumnActivities.map(activity => (
          <ActivityCard activity={activity} key={activity.id} type={type} />
        ))}
      </div>
    </div>
  )
}
