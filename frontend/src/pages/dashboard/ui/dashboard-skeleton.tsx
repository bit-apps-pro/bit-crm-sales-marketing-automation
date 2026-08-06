import { Skeleton } from 'antd'

import DealPipelineSkeleton from './skeletons/deal-pipeline-skeleton'
import InvoiceTopProductsSkeleton from './skeletons/invoice-top-products-skeleton'
import LeadCountBySourceSkeleton from './skeletons/lead-count-by-source-skeleton'
import PendingActivitiesSkeleton from './skeletons/pending-activities-skeleton'
import StatCardSkeleton from './skeletons/stat-card-skeleton'
import TutorialSkeleton from './skeletons/tutorial-skeleton'

const STAT_CARD_COUNT = 5

export default function DashboardSkeleton() {
  return (
    <div className="px-6 py-4">
      <div className="mb-[0.5em] pt-[0.2em]">
        <Skeleton.Input active className="!h-[38px] !min-w-[260px]" />
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: STAT_CARD_COUNT }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-10">
          <div className="w-full md:col-span-3">
            <PendingActivitiesSkeleton />
          </div>
          <div className="col-span-1 flex flex-col gap-5 lg:col-span-5">
            <DealPipelineSkeleton />
            <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
              <InvoiceTopProductsSkeleton />
              <InvoiceTopProductsSkeleton />
            </div>
          </div>
          <div className="w-full space-y-5 md:col-span-2">
            <LeadCountBySourceSkeleton />
            <TutorialSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
