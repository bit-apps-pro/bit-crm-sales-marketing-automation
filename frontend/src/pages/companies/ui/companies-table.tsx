import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type CompanyType } from '@pages/company/shared/company-types'
import If from '@utilities/If'
import { Button, Table, Tag } from 'antd'
import { useMemo } from 'react'
import { LuEye } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import DeleteCompanyPopup from '../internal/company-bulk-operations/ui/delete-company-popup'
import { useCompanyKeysStoreActions, useSelectedKeys } from '../state/use-selected-company-keys-store'

interface CompaniesTableProps {
  companies: CompanyType[]
  fieldList: FieldItem[]
  isLoading: boolean
}

export default function CompaniesTable({ companies, fieldList, isLoading }: CompaniesTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedKeys = useSelectedKeys()
  const { setSelectedKeys } = useCompanyKeysStoreActions()
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
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
          render: (text: string, record: CompanyType): React.ReactNode => {
            if (field.field_key === 'name') {
              return <Link to={`details/${record.id}`}>{record.name}</Link>
            }

            if (field.field_key === 'parent_id' && record?.parent_name) {
              return <Link to={`details/${record?.parent_id}`}>{record?.parent_name}</Link>
            }

            if (field.field_key === 'owner_id' && record?.owner_name) {
              return record.owner_name
            }

            let parsedValue: string | string[] = text
            try {
              const parsed = JSON.parse(text)
              if (Array.isArray(parsed) && parsed.every(e => typeof e === 'string')) {
                parsedValue = parsed
              }
            } catch {
              //empty scope
            }
            if (Array.isArray(parsedValue)) {
              return (
                <div className="flex flex-row flex-wrap gap-1">
                  {parsedValue?.map(item => (
                    <Tag className="m-0 text-xs" key={item}>
                      {item}
                    </Tag>
                  ))}
                </div>
              )
            }
            return parsedValue
          },
          sorter: true,
          sortOrder: (() => {
            if (sortBy !== field.field_key) return
            return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
          })(),
          title: field?.label,
          width: 200
        })),
    [fieldList, sortBy, sortOrder]
  )

  const columns = [
    ...dynamicColumns,
    {
      dataIndex: 'actions',
      fixed: 'right' as const,
      key: 'actions',
      render: (_: unknown, record: CompanyType) => (
        <div>
          <If conditions={checkCapability(CAPABILITIES.COMPANY.VIEW)}>
            <Link to={`../companies/details/${record?.id}`}>
              <Button icon={<LuEye size={14} />} type="link" />
            </Link>
          </If>

          <If conditions={checkCapability(CAPABILITIES.COMPANY.DELETE)}>
            <DeleteCompanyPopup id={record.id} />
          </If>
        </div>
      ),
      title: __('Actions'),
      width: 100
    }
  ]

  const rowSelection = {
    columnWidth: 48,
    fixed: true,
    onChange: handleRowSelectionChange,
    selectedRowKeys: selectedKeys
  }

  return (
    <Table<CompanyType>
      columns={columns}
      dataSource={companies}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={companies.length > 0 ? rowSelection : undefined}
      scroll={{ x: 'max-content', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
