import { Skeleton } from 'antd'

import DashboardCard from '../dashboard-card'

export default function PendingActivitiesSkeleton() {
  return (
    <DashboardCard>
      <Skeleton active paragraph={{ rows: 1, width: '90%' }} title={{ width: '50%' }} />

      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div className="mt-5" key={sectionIndex}>
          <div className="mb-2.5 flex items-center justify-between">
            <Skeleton.Input active className="!h-5 !min-w-[72px]" size="small" />
            <Skeleton.Button active className="!h-6 !w-[60px] !rounded-full" size="small" />
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 2 }).map((_, rowIndex) => (
              <div
                className="space-y-2 rounded border border-solid border-[#E5E3FE] p-2 dark:border-neutral-700 dark:bg-neutral-900"
                key={rowIndex}
              >
                <Skeleton.Input active block className="!h-[14px] !min-h-0" size="small" />
                <Skeleton.Input active block className="!h-[12px] !min-h-0" size="small" />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <Skeleton.Input active className="!h-3 !min-h-0 !min-w-[88px]" size="small" />
                  <Skeleton.Input active className="!h-3 !min-h-0 !min-w-[88px]" size="small" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </DashboardCard>
  )
}
