import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import PAGINATION from '@common/constants/pagination'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import AdvancedFilter from '@features/advanced-filter'
import { useActiveFilters } from '@features/advanced-filter/state/use-advance-filter-persist-store'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import TagFilter from '@features/tag-filter'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Space, Typography } from 'antd'
import { useEffect, useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'
import { NavLink, useSearchParams } from 'react-router'

import useLeadFields from './data/use-lead-fields'
import useLeads from './data/use-leads'
import ExportLeads from './internal/export-leads'
import ImportLeads from './internal/import-leads'
import LeadBulkOperations from './internal/lead-bulk-operations'
import LeadsTableColumnSettings from './internal/leads-table-column-settings'
import { useLeadTableFieldActions, useLeadTableFieldList } from './state/use-lead-table-fields-store'
import { useLeadStoreSelectedKeys } from './state/use-selected-lead-keys-store'
import LeadsTable from './ui/leads-table'

export default function Leads() {
  const fieldList = useLeadTableFieldList()
  const { setFieldList } = useLeadTableFieldActions()
  const selectedLeadKeys = useLeadStoreSelectedKeys()
  const activeFilters = useActiveFilters()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE
  const searchTerm = String(searchParams.get('searchTerm') || '')
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const activeTag = useMemo(
    () => searchParams.get('tags')?.split(',').map(Number).filter(Boolean) || [],
    [searchParams]
  )

  const leadActiveFilters = activeFilters[MODULES.LEAD] || []
  const { fields, isFieldsFetching, isFieldsPending, orders, visibleColumns } = useLeadFields()

  const queryParams = useMemo(
    () => ({
      page,
      perPage,
      searchTerm,
      sortBy,
      sortOrder,
      tags: activeTag
    }),
    [perPage, page, searchTerm, sortBy, sortOrder, activeTag]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { isLeadsFetching, isLeadsPending, leads, totalLeads } = useLeads(
    debouncedQueryParams,
    leadActiveFilters
  )

  useEffect(() => {
    if (fields.length !== 0) {
      setFieldList(fields)
    }
  }, [fields, setFieldList])

  const { customFields, systemDefinedFields } = useMemo(() => {
    const customFields: typeof fields = []
    const systemDefinedFields: typeof fields = []

    fields?.forEach(field => {
      if (field.field_key !== 'full_name') {
        if (field.is_custom) {
          customFields.push(field)
        } else {
          systemDefinedFields.push(field)
        }
      }
    })

    return { customFields, systemDefinedFields }
  }, [fields])

  return (
    <div className="px-6 py-4 dark:bg-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Leads')}
          </Typography.Title>

          <If conditions={checkCapability(CAPABILITIES.LEAD.CREATE)}>
            <NavLink to="../leads/create">
              <Button className="rounded-full px-5" icon={<LuPlus />} size="large" type="primary">
                {__('New Lead')}
              </Button>
            </NavLink>
          </If>
          <If conditions={isLeadsFetching}>
            <LoadingOutlined />
          </If>
        </div>
        <Space.Compact direction="horizontal" size="large">
          <ImportLeads customFields={customFields} systemDefinedFields={systemDefinedFields} />
          <ExportLeads
            customFields={customFields}
            systemDefinedFields={systemDefinedFields}
            totalLeads={totalLeads}
          />
        </Space.Compact>
      </div>
      <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3">
          <div className="flex items-center gap-2">
            <LeadsTableColumnSettings orders={orders} visibleColumns={visibleColumns} />
            <If conditions={selectedLeadKeys.length !== 0}>
              <LeadBulkOperations />
            </If>
          </div>
          <div className="flex items-center gap-2">
            <AdvancedFilter<FieldItem> fields={fieldList} module={MODULES.LEAD} />
            <TagFilter module={MODULES.LEAD} />
            <SearchInput placeholder={__('Search by name or email')} />
          </div>
        </div>
        <LeadsTable
          fieldList={fieldList}
          isLoading={isLeadsFetching || isLeadsPending || isFieldsPending || isFieldsFetching}
          leads={leads}
        />
        <div className="flex justify-center py-5">
          <Pagination total={totalLeads} />
        </div>
      </div>
    </div>
  )
}
