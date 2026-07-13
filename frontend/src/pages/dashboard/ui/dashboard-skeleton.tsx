import { Skeleton } from 'antd'

import DealPipelineSkeleton from './skeletons/deal-pipeline-skeleton'
import InvoiceTopProductsSkeleton from './skeletons/invoice-top-products-skeleton'
import LeadCountBySourceSkeleton from './skeletons/lead-count-by-source-skeleton'
import PendingActivitiesSkeleton from './skeletons/pending-activities-skeleton'
import StatCardSkeleton from './skeletons/stat-card-skeleton'
import TutorialSkeleton from './skeletons/tutorial-skeleton'

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <Skeleton active className="max-w-md" paragraph={false} title={{ width: '40%' }} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5">
        <div className="w-full md:col-span-1">
          <PendingActivitiesSkeleton />
        </div>
        <div className="col-span-1 flex flex-col gap-5 lg:col-span-3">
          <DealPipelineSkeleton />
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <InvoiceTopProductsSkeleton />
            <InvoiceTopProductsSkeleton />
          </div>
        </div>
        <div className="w-full space-y-5 md:col-span-1">
          <LeadCountBySourceSkeleton />
          <TutorialSkeleton />
        </div>
      </div>
    </div>
  )
}
