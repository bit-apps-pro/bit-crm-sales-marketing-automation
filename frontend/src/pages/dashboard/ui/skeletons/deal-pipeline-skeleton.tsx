import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function DealPipelineSkeleton() {
  return (
    <DashboardCard>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
        <Skeleton
          active
          className="w-1/2"
          paragraph={{ rows: 1, width: '70%' }}
          title={{ width: '50%' }}
        />
        <Skeleton.Button active className="!w-64 flex-shrink-0 !rounded-full" />
      </div>
      <Skeleton.Node active className="!h-[368px] !w-full">
        <div />
      </Skeleton.Node>
    </DashboardCard>
  )
}
