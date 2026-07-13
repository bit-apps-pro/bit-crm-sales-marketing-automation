import DashboardCard from '../dashboard-card'
import CardHeaderSkeleton from './card-header-skeleton'
import ProgressRowsSkeleton from './progress-rows-skeleton'

export default function InvoiceTopProductsSkeleton() {
  return (
    <DashboardCard>
      <CardHeaderSkeleton withAction />
      <ProgressRowsSkeleton rows={4} />
    </DashboardCard>
  )
}
