import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function TutorialSkeleton() {
  return (
    <DashboardCard className="overflow-hidden">
      <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="contents 2xl:block 2xl:min-w-0 2xl:space-y-4">
          <div className="min-w-0">
            <Skeleton.Input active className="!h-6 !min-w-[110px]" size="small" />
            <div className="mt-1.5">
              <Skeleton.Input active block className="!h-[14px] !min-h-0" size="small" />
            </div>
          </div>
          <div className="order-3 2xl:order-none">
            <Skeleton.Button active className="!w-full !rounded-full 2xl:!w-[140px]" />
          </div>
        </div>
        <div className="order-2 flex shrink-0 items-center justify-center 2xl:order-none">
          <Skeleton.Avatar
            active
            className="!h-16 !w-16 sm:!h-20 sm:!w-20 lg:!h-16 lg:!w-16 2xl:!h-20 2xl:!w-20"
            shape="square"
          />
        </div>
      </div>
    </DashboardCard>
  )
}
