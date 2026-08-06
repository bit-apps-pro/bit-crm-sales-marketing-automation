import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'
import CardHeaderSkeleton from './card-header-skeleton'

export default function LeadCountBySourceSkeleton() {
  return (
    <DashboardCard>
      <CardHeaderSkeleton withAction />
      <div className="flex items-center justify-center">
        <Skeleton.Node active className="w-full" />
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="flex items-center justify-between gap-2" key={index}>
            <Skeleton.Input active className="!h-4 !min-h-0 !min-w-[96px]" size="small" />
            <Skeleton.Input active className="!h-4 !min-h-0 !w-8 !min-w-0" size="small" />
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
