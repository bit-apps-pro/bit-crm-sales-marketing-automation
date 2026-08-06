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

import useCompanies from './data/use-companies'
import useCompanyFields from './data/use-company-fields'
import CompanyBulkOperations from './internal/company-bulk-operations'
import ExportCompanies from './internal/export-companies'
import ImportCompanies from './internal/import-companies'
import {
  useCompanyTableFieldActions,
  useCompanyTableFieldList
} from './state/use-company-table-fields-store'
import { useSelectedKeys } from './state/use-selected-company-keys-store'
import CompaniesTable from './ui/companies-table'
import CompaniesTableColumnSettings from './ui/companies-table-column-settings'

export default function Companies() {
  const fieldList = useCompanyTableFieldList()
  const { setFieldList } = useCompanyTableFieldActions()
  const selectedKeys = useSelectedKeys()
  const activeFilters = useActiveFilters()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE
  const searchTerm = String(searchParams.get('searchTerm') || '')
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const tagParam = searchParams.get('tags')
  const selectedTags = useMemo(() => {
    return tagParam ? tagParam.split(',').filter(Boolean) : []
  }, [tagParam])
  const companyActiveFilters = activeFilters[MODULES.COMPANY] || []

  const { fields, isFieldsLoading, orders, visibleColumns } = useCompanyFields()

  const queryParams = useMemo(
    () => ({
      page,
      perPage,
      searchTerm,
      sortBy,
      sortOrder,
      tags: selectedTags
    }),
    [perPage, page, searchTerm, sortBy, sortOrder, selectedTags]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { companies, isCompaniesFetching, isCompaniesLoading, totalCompanies } = useCompanies(
    debouncedQueryParams,
    companyActiveFilters
  )

  useEffect(() => {
    if (fields.length !== 0) {
      setFieldList(fields)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields])

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

  return (
    <div className="px-6 py-4 dark:bg-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Companies')}
          </Typography.Title>

          <If conditions={checkCapability(CAPABILITIES.COMPANY.CREATE)}>
            <NavLink to="../companies/create">
              <Button className="rounded-full" icon={<LuPlus name="plus" />} size="large" type="primary">
                {__('New Company')}
              </Button>
            </NavLink>
          </If>

          <If conditions={isCompaniesFetching}>
            <LoadingOutlined />
          </If>
        </div>

        <Space.Compact direction="horizontal" size="large">
          <ImportCompanies customFields={customFields} systemDefinedFields={systemDefinedFields} />
          <ExportCompanies
            customFields={customFields}
            systemDefinedFields={systemDefinedFields}
            totalCompanies={totalCompanies}
          />
        </Space.Compact>
      </div>

      <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3">
          <div className="flex items-center gap-2">
            <CompaniesTableColumnSettings orders={orders} visibleColumns={visibleColumns} />
            <If conditions={selectedKeys.length !== 0}>
              <CompanyBulkOperations />
            </If>
          </div>
          <div className="flex items-center gap-2">
            <AdvancedFilter<FieldItem> fields={fieldList} module={MODULES.COMPANY} />
            <TagFilter module={MODULES.COMPANY} />
            <SearchInput placeholder={__('Search by name or website')} />
          </div>
        </div>

        <CompaniesTable
          companies={companies}
          fieldList={fieldList}
          isLoading={isCompaniesLoading || isFieldsLoading}
        />

        <div className="flex justify-center py-5">
          <Pagination total={totalCompanies} />
        </div>
      </div>
    </div>
  )
}
