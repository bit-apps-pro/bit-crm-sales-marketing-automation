import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function StatCardSkeleton() {
  return (
    <DashboardCard>
      <Skeleton active paragraph={{ rows: 2, width: ['60%', '40%'] }} title={{ width: '50%' }} />
    </DashboardCard>
  )
}
