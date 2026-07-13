import { type ReactNode } from 'react'

import EntitySummaryInfo from './entity-summary-info'
import EntitySummaryMeta from './entity-summary-meta'

export interface EntitySummaryData {
  createdAt: string
  createdBy?: string
  email?: string
  name: string
  phone?: string
  price?: number
  sku?: string
  status?: ReactNode
  updatedAt?: string
  updatedBy?: string
}

export default function EntitySummaryCard({
  actions,
  entity
}: {
  actions?: ReactNode
  entity: EntitySummaryData
}) {
  return (
    <div className="col-span-2 flex h-full w-full justify-between gap-4 rounded-md border border-solid border-[#EBEAFF] bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <EntitySummaryInfo entity={entity} />
      <div className="flex flex-col justify-between gap-2">
        <EntitySummaryMeta entity={entity} />
        {actions}
      </div>
    </div>
  )
}
