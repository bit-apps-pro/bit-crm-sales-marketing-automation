import CAPABILITIES from '@common/constants/capabilities'
import PAGINATION from '@common/constants/pagination'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import InvoiceBulkOperations from '@pages/invoices/shared/invoice-bulk-operations'
import { useSelectedKeys } from '@pages/invoices/state/use-selected-invoice-keys-store'
import InvoicesTable from '@pages/invoices/ui/invoices-table'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import { Button } from 'antd'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import useDealInvoices from './data/use-deal-invoices'

interface DealInvoiceProps {
  entityId: number
  module?: string
}
export default function DealInvoices({ entityId }: DealInvoiceProps) {
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''

  const selectedKeys = useSelectedKeys()

  const queryParams = useMemo(
    () => ({
      id: entityId,
      page,
      perPage,
      sortBy,
      sortOrder
    }),
    [entityId, page, perPage, sortBy, sortOrder]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { invoices, isInvoiceFetching, isInvoicePending, totalInvoice } =
    useDealInvoices(debouncedQueryParams)

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <div>
          <If conditions={selectedKeys.length !== 0 && checkCapability(CAPABILITIES.INVOICE.DELETE)}>
            <InvoiceBulkOperations />
          </If>
        </div>
        <Link target="_blank" to={`../invoices/create?dealId=${entityId}`}>
          <Button
            className="rounded-full text-sm capitalize text-gray-500 dark:text-gray-400"
            size="large"
          >
            {__(`Create Invoice`)}
          </Button>
        </Link>
      </div>
      <div className="rounded-lg bg-white dark:bg-neutral-900">
        <InvoicesTable
          invoices={invoices}
          isDealView
          isLoading={isInvoicePending || isInvoiceFetching}
        />
        <div className="flex justify-center py-2">
          <Pagination current={page} pageSize={perPage} size="small" total={totalInvoice} />
        </div>
      </div>
    </div>
  )
}
