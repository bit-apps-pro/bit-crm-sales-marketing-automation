import { __ } from '@common/helpers/i18nWrap'
import { Badge, Button, Empty, Typography } from 'antd'
import { Link } from 'react-router'

import { type PendingActivityGroup } from '../shared/types'
import ActivityRow from './activity-row'

interface ActivitySectionProps {
  activity: PendingActivityGroup
  href: string
  label: string
}

export default function ActivitySection({ activity, href, label }: ActivitySectionProps) {
  return (
    <div className="mt-5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-start gap-1.5">
          <Typography.Title className="capitalize" level={5}>
            {label}
          </Typography.Title>
          <Badge color="#703DD7" count={activity?.total} overflowCount={99} />
        </div>
        <Link to={href}>
          <Button className="rounded-full" size="small" type="text">
            {__('View all')}
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {activity?.items.length > 0 ? (
          activity.items.map(item => <ActivityRow item={item} key={item.id} />)
        ) : (
          <Empty description={__('No pending activities')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </div>
  )
}
