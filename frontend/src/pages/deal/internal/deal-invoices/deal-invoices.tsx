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
import { Button, Typography } from 'antd'
import { useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'
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
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Invoices')}
          </Typography.Title>
          <Link target="_blank" to={`../invoices/create?dealId=${entityId}`}>
            <Button className="rounded-full text-sm capitalize" icon={<LuPlus />} type="primary">
              {__(`New`)}
            </Button>
          </Link>
        </div>

        <If conditions={selectedKeys.length !== 0 && checkCapability(CAPABILITIES.INVOICE.DELETE)}>
          <InvoiceBulkOperations size="middle" />
        </If>
      </div>
      <div>
        <InvoicesTable
          invoices={invoices}
          isDealView={true}
          isLoading={isInvoicePending || isInvoiceFetching}
        />
        <div className="flex justify-center py-3">
          <Pagination current={page} pageSize={perPage} total={totalInvoice} />
        </div>
      </div>
    </div>
  )
}
