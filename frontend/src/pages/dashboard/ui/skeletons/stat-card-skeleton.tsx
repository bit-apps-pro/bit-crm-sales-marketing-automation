import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function StatCardSkeleton() {
  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton.Avatar active className="!h-9 !w-9 !rounded-[10px]" shape="square" />
            <Skeleton.Input active className="!h-5 !min-w-[84px]" size="small" />
          </div>
          <Skeleton.Avatar active className="!h-7 !w-7" shape="circle" />
        </div>

        <div className="mt-5">
          <Skeleton.Input active className="!h-[42px] !min-w-[72px]" />
          <div className="mt-1.5">
            <Skeleton.Input active className="!h-[13px] !min-w-[140px]" size="small" />
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
