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
import IntegrationSettingsNavigation from '@features/integration-settings-navigation'
import TagFilter from '@features/tag-filter'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Space, Typography } from 'antd'
import { useEffect, useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'
import { NavLink, useSearchParams } from 'react-router'

import useContactFields from './data/use-contact-fields'
import useContacts from './data/use-contacts'
import ContactBulkOperations from './internal/contact-bulk-operations'
import ContactsTableColumnSettings from './internal/contacts-table-column-settings'
import ExportContacts from './internal/export-contacts'
import ImportContacts from './internal/import-contacts'
import {
  useContactTableFieldActions,
  useContactTableFieldList
} from './state/use-contact-table-fields-store'
import { useContactStoreSelectedKeys } from './state/use-selected-contact-keys-store'
import ContactsTable from './ui/contacts-table'

export default function Contacts() {
  const { setFieldList } = useContactTableFieldActions()
  const fieldList = useContactTableFieldList()
  const selectedContactKeys = useContactStoreSelectedKeys()
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

  const contactActiveFilters = activeFilters[MODULES.CONTACT] || []

  const { fields, isFieldsFetching, isFieldsPending, orders, visibleColumns } = useContactFields()

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

  const { contacts, isContactsFetching, isContactsPending, totalContacts } = useContacts(
    debouncedQueryParams,
    contactActiveFilters
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Contacts')}
          </Typography.Title>

          <If conditions={checkCapability(CAPABILITIES.CONTACT.CREATE)}>
            <NavLink to="../contacts/create">
              <Button className="rounded-full" icon={<LuPlus name="plus" />} size="large" type="primary">
                {__('New Contact')}
              </Button>
            </NavLink>
          </If>

          <If conditions={isFieldsFetching}>
            <LoadingOutlined />
          </If>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <IntegrationSettingsNavigation
            label={__('WooCommerce sync')}
            to="/settings/woo-settings"
            tooltip={__(
              'Automatically add customers from WooCommerce orders to Bit CRM and optionally tag them by purchased products or coupon codes.'
            )}
          />
          <Space.Compact direction="horizontal" size="large">
            <ImportContacts customFields={customFields} systemDefinedFields={systemDefinedFields} />
            <ExportContacts
              customFields={customFields}
              systemDefinedFields={systemDefinedFields}
              totalContacts={totalContacts}
            />
          </Space.Compact>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3">
          <div className="flex items-center gap-2">
            <ContactsTableColumnSettings orders={orders} visibleColumns={visibleColumns} />
            <If conditions={selectedContactKeys.length !== 0}>
              <ContactBulkOperations />
            </If>
          </div>
          <div className="flex items-center gap-2">
            <AdvancedFilter<FieldItem> fields={fieldList} module={MODULES.CONTACT} />
            <TagFilter module={MODULES.CONTACT} />
            <SearchInput placeholder={__('Search by name or email')} />
          </div>
        </div>

        <ContactsTable
          contacts={contacts}
          fieldList={fieldList}
          isLoading={isContactsFetching || isContactsPending || isFieldsPending || isFieldsFetching}
        />

        <div className="flex justify-center py-5">
          <Pagination total={totalContacts} />
        </div>
      </div>
    </div>
  )
}
