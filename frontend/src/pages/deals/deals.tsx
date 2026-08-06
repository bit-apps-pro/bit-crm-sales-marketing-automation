/* eslint-disable react-hooks/exhaustive-deps */
import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import PAGINATION from '@common/constants/pagination'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import AdvancedFilter from '@features/advanced-filter'
import { useActiveFilters } from '@features/advanced-filter/state/use-advance-filter-persist-store'
import TagFilter from '@features/tag-filter'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Space, Typography } from 'antd'
import { lazy, useEffect, useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'
import { NavLink, useSearchParams } from 'react-router'

import useDealFields from './data/use-deal-fields'
import useDeals from './data/use-deals'
import DealBulkOperations from './internal/deal-bulk-operations'
import DealsTableColumnSettings from './internal/deals-table-column-settings'
import ExportDeals from './internal/export-deals'
import ImportDeals from './internal/import-deals'
import { useDealViewStore } from './state/use-deal-setting-store'
import { useDealTableFieldActionsStore, useFieldListStore } from './state/use-deal-table-fields-store'
import { useSelectedKeysStore } from './state/use-selected-deal-keys-store'
import ViewSwitch from './ui/view-switch'

const DealsTable = lazy(() => import('./ui/deals-table'))
const DealsKanban = lazy(() => import('./internal/deals-kanban'))

export default function Deals() {
  const { setFieldList } = useDealTableFieldActionsStore()
  const fieldList = useFieldListStore()
  const selectedKeys = useSelectedKeysStore()
  const [searchParams] = useSearchParams()
  const view = useDealViewStore()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE
  const searchTerm = String(searchParams.get('searchTerm') || '')
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const tagParam = searchParams.get('tags')
  const selectedTags = useMemo(() => {
    return tagParam ? tagParam.split(',').filter(Boolean) : []
  }, [tagParam])

  const activeFilters = useActiveFilters()
  const dealActiveFilters = activeFilters[MODULES.DEAL] || []

  const { fields, isFieldsLoading, orders, visibleColumns } = useDealFields()

  const queryParams = useMemo(
    () => ({
      advancedFilterGroups: dealActiveFilters,
      page,
      perPage,
      searchTerm,
      sortBy,
      sortOrder,
      table: view === 'table',
      tags: selectedTags
    }),

    [
      searchParams,
      fieldList,
      perPage,
      page,
      searchTerm,
      sortBy,
      sortOrder,
      selectedTags,
      view,
      dealActiveFilters
    ]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { deals, isDealsFetching, isDealsLoading, totalDeals } = useDeals(debouncedQueryParams)

  const { customFields, systemDefinedFields } = useMemo(() => {
    const customFields: typeof fields = []
    const systemDefinedFields: typeof fields = []

    fields?.forEach(field => {
      if (field.is_custom) {
        customFields.push(field)
      } else {
        systemDefinedFields.push(field)
      }
    })

    return { customFields, systemDefinedFields }
  }, [fields])

  useEffect(() => {
    if (fields.length !== 0) {
      setFieldList(fields)
    }
  }, [fields])

  return (
    <div className="px-6 py-4 dark:bg-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Deals')}
          </Typography.Title>
          <If conditions={checkCapability(CAPABILITIES.DEAL.CREATE)}>
            <NavLink to="../deals/create">
              <Button className="rounded-full px-5" icon={<LuPlus />} size="large" type="primary">
                {__('New Deal')}
              </Button>
            </NavLink>
          </If>
          <If conditions={isDealsFetching}>
            <LoadingOutlined />
          </If>
        </div>
        <Space.Compact direction="horizontal" size="large">
          <ImportDeals customFields={customFields} systemDefinedFields={systemDefinedFields} />
          <ExportDeals customFields={customFields} systemDefinedFields={systemDefinedFields} />
        </Space.Compact>
      </div>
      <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3">
          <div className="flex items-center gap-2">
            <DealsTableColumnSettings orders={orders} visibleColumns={visibleColumns} />
            <ViewSwitch />
            <If conditions={selectedKeys.length !== 0}>
              <DealBulkOperations />
            </If>
          </div>
          <div className="flex items-center gap-2">
            <AdvancedFilter fields={fieldList} module={MODULES.DEAL} />
            <TagFilter module={MODULES.DEAL} />
            <SearchInput />
          </div>
        </div>

        {view === 'table' ? (
          <DealsTable
            deals={deals}
            fieldList={fieldList}
            isLoading={isDealsLoading || isFieldsLoading}
          />
        ) : (
          <DealsKanban searchData={debouncedQueryParams} />
        )}

        <If conditions={view === 'table'}>
          <div className="flex justify-center py-5">
            <Pagination total={totalDeals} />
          </div>
        </If>
      </div>
    </div>
  )
}
