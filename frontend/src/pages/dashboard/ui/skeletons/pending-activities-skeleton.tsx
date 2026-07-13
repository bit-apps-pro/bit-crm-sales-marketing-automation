import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function PendingActivitiesSkeleton() {
  return (
    <DashboardCard>
      <Skeleton active paragraph={{ rows: 1, width: '90%' }} title={{ width: '50%' }} />
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="mt-5" key={index}>
          <Skeleton active paragraph={{ rows: 2, width: ['100%', '70%'] }} title={{ width: '40%' }} />
        </div>
      ))}
    </DashboardCard>
  )
}
