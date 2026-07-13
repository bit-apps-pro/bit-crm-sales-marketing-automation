import CAPABILITIES from '@common/constants/capabilities'
import { $appConfig } from '@common/globalStates'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type Deal } from '@pages/deal/shared/deal-types'
import If from '@utilities/If'
import { Button, Table } from 'antd'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { LuEye } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import DeleteDealPopup from '../internal/deal-bulk-operations/ui/delete-deal-popup'
import { useSelectedKeysActionsStore, useSelectedKeysStore } from '../state/use-selected-deal-keys-store'

interface DealsTableProps {
  deals: Deal[]
  fieldList: FieldItem[]
  isLoading: boolean
}

export default function DealsTable({ deals, fieldList, isLoading }: DealsTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { setSelectedKeys } = useSelectedKeysActionsStore()
  const selectedKeys = useSelectedKeysStore()
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const { homeCurrencyData } = useAtomValue($appConfig)
  const tableScrollY = useTableScrollHeight(400)

  const handleTableChange = (_pagination: unknown, _filters: unknown, sorter: unknown) => {
    const sortData = Array.isArray(sorter) ? sorter[0] : sorter

    setSearchParams(prev => {
      if (
        sortData &&
        typeof sortData === 'object' &&
        'field' in sortData &&
        'order' in sortData &&
        sortData.field
      ) {
        prev.set('sortBy', String(sortData.field))
        prev.set('sortOrder', sortData.order === 'ascend' ? 'asc' : 'desc')
      } else {
        prev.delete('sortBy')
        prev.delete('sortOrder')
      }

      return prev
    })
  }

  const handleRowSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedKeys(newSelectedRowKeys)
  }

  const dynamicColumns = useMemo(
    () =>
      fieldList
        .filter(field => field.is_visible)
        .map(field => ({
          dataIndex: field.field_key,
          ellipsis: {
            showTitle: true
          },
          key: field.field_key,
          render: (text: string, record: Deal): React.ReactNode => {
            if (field.field_key === 'name') {
              return <Link to={`details/${record.id}`}>{record.name}</Link>
            }

            if (field.field_key === 'company_name' && record.company_id && record.company_name) {
              return <Link to={`/companies/details/${record.company_id}`}>{record.company_name}</Link>
            }

            if (field.field_key === 'contact_id' && record.contact_id && record.contact_name) {
              return <Link to={`/contacts/details/${record.contact_id}`}>{record.contact_name}</Link>
            }

            if (field.field_key === 'owner_id' && record.owner_name) {
              return String(record.owner_name)
            }

            if (
              field.field_key === 'amount' &&
              (record.home_currency_amount ?? record.amount) !== null
            ) {
              return generateCurrencyFormatPreview(
                homeCurrencyData,
                record.home_currency_amount ?? record.amount
              )
            }

            return String(text ?? '')
          },
          sorter: true,
          sortOrder: (() => {
            if (sortBy !== field.field_key) return
            return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
          })(),
          title: field?.label,
          width: 200
        })),
    [fieldList, sortBy, sortOrder, homeCurrencyData]
  )

  const columns = [
    ...dynamicColumns,
    {
      dataIndex: 'actions',
      fixed: 'right' as const,
      key: 'actions',
      render: (_: unknown, record: Deal) => (
        <div>
          <If conditions={checkCapability(CAPABILITIES.DEAL.VIEW)}>
            <Link to={`../deals/details/${record?.id}`}>
              <Button icon={<LuEye size={14} />} type="link" />
            </Link>
          </If>

          <If conditions={checkCapability(CAPABILITIES.DEAL.DELETE)}>
            <DeleteDealPopup id={record.id} />
          </If>
        </div>
      ),
      title: __('Actions'),
      width: 100
    }
  ]

  const rowSelection = {
    columnWidth: 50,
    fixed: true as const,
    onChange: handleRowSelectionChange,
    selectedRowKeys: selectedKeys
  }

  return (
    <Table<Deal>
      columns={columns}
      dataSource={deals}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={deals.length > 0 ? rowSelection : undefined}
      scroll={{ x: 'max-content', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
