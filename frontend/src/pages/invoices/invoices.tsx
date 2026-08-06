import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import PAGINATION from '@common/constants/pagination'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import { Button, Typography } from 'antd'
import { useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'
import { NavLink, useSearchParams } from 'react-router'

import useInvoices from './data/use-invoices'
import InvoiceBulkOperations from './shared/invoice-bulk-operations/ui/invoice-bulk-operations'
import { useSelectedKeys } from './state/use-selected-invoice-keys-store'
import InvoiceStatusFilter from './ui/invoice-status-filter'
import InvoicesTable from './ui/invoices-table'

export default function Invoices() {
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const statuses = searchParams.get('statuses') || ''
  const selectedKeys = useSelectedKeys()

  const queryParams = useMemo(
    () => ({
      page,
      perPage,
      sortBy,
      sortOrder,
      statuses
    }),
    [page, perPage, sortBy, sortOrder, statuses]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { invoices, isInvoiceFetching, isInvoiceLoading, totalInvoice } =
    useInvoices(debouncedQueryParams)

  return (
    <div className="space-y-6 px-6 py-4 dark:bg-transparent">
      <div className="flex items-center gap-2">
        <Typography.Title className="mb-0" level={3}>
          {__('Invoices')}
        </Typography.Title>
        <If conditions={checkCapability(CAPABILITIES.INVOICE.CREATE)}>
          <NavLink to="../invoices/create">
            <Button className="rounded-full px-5" icon={<LuPlus />} size="large" type="primary">
              {__('New Invoice')}
            </Button>
          </NavLink>
        </If>
        <If conditions={isInvoiceFetching}>
          <LoadingOutlined />
        </If>
      </div>
      <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3">
          <div>
            <If conditions={selectedKeys.length > 0}>
              <InvoiceBulkOperations />
            </If>
          </div>
          <InvoiceStatusFilter />
        </div>
        <InvoicesTable invoices={invoices} isLoading={isInvoiceLoading} />
        <div className="flex justify-center py-5">
          <Pagination total={totalInvoice} />
        </div>
      </div>
    </div>
  )
}
