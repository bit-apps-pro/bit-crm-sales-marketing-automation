import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { renderFullName } from '@common/helpers/entity-helpers'
import { unslugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type ContactType } from '@pages/contact/shared/contact-types'
import If from '@utilities/If'
import { Button, Table, Tag, Typography } from 'antd'
import { useMemo } from 'react'
import { LuEye } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import {
  useContactStoreKeysActions,
  useContactStoreSelectedKeys
} from '../state/use-selected-contact-keys-store'
import DeleteContactPopup from './delete-contact-popup'

interface ContactsTableProps {
  contacts: ContactType[]
  fieldList: FieldItem[]
  isLoading: boolean
}

export default function ContactsTable({ contacts, fieldList, isLoading }: ContactsTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedContactKeys = useContactStoreSelectedKeys()
  const { setSelectedKeys } = useContactStoreKeysActions()
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
          render: (text: string, record: ContactType): React.ReactNode => {
            if (field.field_key === 'full_name') {
              return (
                <Link to={`details/${record.id}`}>
                  <div className="group flex h-full w-full cursor-pointer flex-col hover:text-blue-500">
                    <Typography.Title className="mb-0 text-nowrap group-hover:text-blue-400" level={5}>
                      {renderFullName(record.title, record?.first_name, record?.last_name)}
                    </Typography.Title>
                    <Typography.Text className="text-nowrap">{record.email}</Typography.Text>
                  </div>
                </Link>
              )
            }

            if (field.type === 'select' || field.type === 'radio') {
              return unslugify(text)
            }

            let parsedValue: string | string[] = text

            try {
              const parsed = JSON.parse(text)
              if (Array.isArray(parsed) && parsed.every(e => typeof e === 'string')) {
                parsedValue = parsed
              }
            } catch {
              // empty scope
            }
            if (Array.isArray(parsedValue)) {
              return (
                <div className="flex flex-row flex-wrap gap-1">
                  {parsedValue?.map((item, index) => (
                    <Tag className="m-0 text-xs" key={`${index}-${item}`}>
                      {unslugify(item)}
                    </Tag>
                  ))}
                </div>
              )
            }
            return parsedValue
          },
          sorter: field.field_key === 'full_name' ? false : true,
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
      render: (_: unknown, record: ContactType) => (
        <div>
          <If conditions={checkCapability(CAPABILITIES.CONTACT.VIEW)}>
            <Link to={`details/${record.id}`}>
              <Button icon={<LuEye size={14} />} type="link" />
            </Link>
          </If>
          <If conditions={checkCapability(CAPABILITIES.CONTACT.DELETE)}>
            <DeleteContactPopup id={record.id} />
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
    selectedRowKeys: selectedContactKeys
  }
  return (
    <Table<ContactType>
      columns={columns}
      dataSource={contacts}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={contacts.length > 0 ? rowSelection : undefined}
      scroll={{ x: 'max-content', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
