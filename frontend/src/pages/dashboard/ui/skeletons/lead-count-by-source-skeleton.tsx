import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'
import CardHeaderSkeleton from './card-header-skeleton'

export default function LeadCountBySourceSkeleton() {
  return (
    <DashboardCard>
      <CardHeaderSkeleton withAction />
      <div className="flex justify-center">
        <Skeleton.Avatar active className="!h-56 !w-56" shape="circle" />
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="flex items-center justify-between" key={index}>
            <div className="flex items-center gap-2">
              <Skeleton.Avatar active shape="square" size="small" />
              <Skeleton.Input active size="small" />
            </div>
            <Skeleton.Input active className="!w-[32px]" size="small" />
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
