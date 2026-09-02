import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function StatCardSkeleton() {
  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="relative z-10">
        <Skeleton.Input active className="!h-5 w-full" size="small" />
        <div className="mt-5">
          <Skeleton.Input active className="!h-[42px] w-full" />
          <div className="mt-1.5">
            <Skeleton.Input active className="!h-[13px] w-full" size="small" />
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
