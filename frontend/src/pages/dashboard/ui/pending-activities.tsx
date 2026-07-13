import { __ } from '@common/helpers/i18nWrap'
import { Typography } from 'antd'

import { type PendingActivity } from '../shared/types'
import ActivitySection from './activity-section'
import DashboardCard from './dashboard-card'

interface PendingActivitiesProps {
  pendingActivities: PendingActivity
}

export default function PendingActivities({ pendingActivities }: PendingActivitiesProps) {
  const sections = [
    { activity: pendingActivities.task, href: '/tasks', label: __('tasks') },
    { activity: pendingActivities.call, href: '/calls', label: __('calls') },
    { activity: pendingActivities.meeting, href: '/meetings', label: __('meetings') }
  ]

  return (
    <DashboardCard>
      <Typography.Title className="mb-0" level={3}>
        {__('Pending Activities')}
      </Typography.Title>
      <Typography.Text className="text-[#9090A8]">
        {__('Track your upcoming activities.')}
      </Typography.Text>

      {sections.map(({ activity, href, label }) => (
        <ActivitySection activity={activity} href={href} key={href} label={label} />
      ))}
    </DashboardCard>
  )
}
