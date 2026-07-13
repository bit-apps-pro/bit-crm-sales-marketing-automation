import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { cn } from '@common/helpers/globalHelpers'
import { __, sprintf } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import If from '@utilities/If'
import { Typography } from 'antd'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import useDashboard from './data/use-dashboard'
import DashboardSkeleton from './ui/dashboard-skeleton'
import DealPipeline from './ui/deal-pipeline'
import InvoiceStats from './ui/invoice-stats'
import LeadsBySource from './ui/leads-by-source'
import PendingActivities from './ui/pending-activities'
import StatCards from './ui/stat-cards'
import TopProducts from './ui/top-products'
import Tutorial from './ui/tutorial'

export default function Dashboard() {
  const [searchParams] = useSearchParams()

  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const queryParams = useMemo(
    () => ({
      endDate,
      startDate
    }),
    [startDate, endDate]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const {
    dealsPipeline,
    invoiceStatusOverview,
    isLoading,
    leadCountBySource,
    pendingActivities,
    stats,
    topProductsByQuantity,
    userName
  } = useDashboard(debouncedQueryParams)

  const canViewDeals = checkCapability(CAPABILITIES.DEAL.VIEW)
  const canViewInvoices = checkCapability(CAPABILITIES.INVOICE.VIEW)
  const canViewProducts = checkCapability(CAPABILITIES.PRODUCT.VIEW)
  const hasSalesOverviewAccess = canViewDeals || canViewInvoices || canViewProducts

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="p-5">
      <div>
        <Typography.Title className="" level={2}>
          {sprintf(__('Welcome %s,'), userName)}
        </Typography.Title>
      </div>
      <div className="flex flex-col gap-5">
        <StatCards stats={stats} />
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5">
          <div className="w-full md:col-span-1">
            <PendingActivities pendingActivities={pendingActivities} />
          </div>
          <div
            className={cn(
              'col-span-1 flex flex-col gap-5 lg:col-span-3',
              !hasSalesOverviewAccess && 'hidden'
            )}
          >
            <If conditions={canViewDeals}>
              <DealPipeline dealPipeline={dealsPipeline} />
            </If>
            <div
              className={cn(
                'grid grid-cols-1 items-stretch gap-5',
                canViewInvoices && canViewProducts ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
              )}
            >
              <If conditions={canViewInvoices}>
                <InvoiceStats invoiceStatusOverview={invoiceStatusOverview} />
              </If>
              <If conditions={canViewProducts}>
                <TopProducts topProductsByQuantity={topProductsByQuantity} />
              </If>
            </div>
          </div>
          <div className="w-full space-y-5 md:col-span-1">
            <If conditions={checkCapability(CAPABILITIES.LEAD.VIEW)}>
              <LeadsBySource leadCountBySource={leadCountBySource} />
            </If>
            <Tutorial />
          </div>
        </div>
      </div>
    </div>
  )
}
