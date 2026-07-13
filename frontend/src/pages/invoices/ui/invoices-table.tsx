import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { formatDate } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { type InvoiceType } from '@pages/invoice-create/shared/invoice-create-types'
import If from '@utilities/If'
import { Button, Space, Table, Tag } from 'antd'
import { useMemo } from 'react'
import { LuPenLine } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import { useInvoiceKeysStoreActions, useSelectedKeys } from '../state/use-selected-invoice-keys-store'
import DeleteInvoicePopup from './delete-invoice-popup'

interface InvoicesTableProps {
  invoices: InvoiceType[]
  isDealView?: boolean
  isLoading: boolean
}

const statusConfig = {
  draft: { color: 'default', label: __('Draft') },
  overdue: { color: 'red', label: __('Overdue') },
  paid: { color: 'green', label: __('Paid') }
}

export default function InvoicesTable({ invoices, isDealView = false, isLoading }: InvoicesTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { setSelectedKeys } = useInvoiceKeysStoreActions()
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const selectedKeys = useSelectedKeys()
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

  const columns = useMemo(
    () => [
      {
        dataIndex: 'id',
        key: 'id',
        render: (id: number, record: InvoiceType) => {
          return (
            <Link
              className="hover:text-blue-500"
              rel="noopener noreferrer"
              target={isDealView ? '_blank' : undefined}
              to={`/invoices/details/${record.id}`}
            >
              {record.invoice_prefix}-{id}
            </Link>
          )
        },
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'id') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Invoice Number')
      },
      {
        dataIndex: 'deal_name',
        key: 'deal_name',
        render: (value: string, record: InvoiceType) => {
          return (
            <Link className="hover:text-blue-500" to={`/deals/details/${record.entity_id}`}>
              {value}
            </Link>
          )
        },
        title: __('Deal Name')
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const config = statusConfig[status as keyof typeof statusConfig] || {
            color: 'blue',
            label: status
          }

          return (
            <Tag className="capitalize" color={config.color}>
              {config.label}
            </Tag>
          )
        },
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'status') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Status')
      },
      {
        dataIndex: 'invoice_date',
        key: 'invoice_date',
        render: (date: string) => {
          const formattedDate = formatDate(date)
          return <span>{formattedDate}</span>
        },
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'invoice_date') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Invoice Date')
      },
      {
        dataIndex: 'due_date',
        key: 'due_date',
        render: (date: string) => {
          const formattedDate = formatDate(date)
          return <span>{formattedDate}</span>
        },
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'due_date') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Due Date')
      },
      {
        dataIndex: 'paid_at',
        key: 'paid_at',
        render: (date: null | string) => {
          return date ? formatDate(date) : '-'
        },
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'paid_at') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Paid At')
      },
      {
        dataIndex: 'actions',
        key: 'actions',
        render: (_: unknown, record: InvoiceType) => (
          <Space>
            <If conditions={checkCapability(CAPABILITIES.INVOICE.UPDATE)}>
              {record.status === 'paid' ? (
                <Button disabled type="link">
                  <LuPenLine size={14} />
                </Button>
              ) : (
                <Link to={`/invoices/edit/${record.id}`}>
                  <Button type="link">
                    <LuPenLine size={14} />
                  </Button>
                </Link>
              )}
            </If>
            <If conditions={checkCapability(CAPABILITIES.INVOICE.DELETE) && !isDealView}>
              <DeleteInvoicePopup id={record.id} />
            </If>
          </Space>
        ),
        title: __('Actions')
      }
    ],
    [sortBy, sortOrder, isDealView]
  )
  const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
    setSelectedKeys(selectedRowKeys)
  }
  const rowSelection = {
    onChange: handleRowSelectionChange,
    selectedRowKeys: selectedKeys
  }
  return (
    <Table<InvoiceType>
      columns={columns}
      dataSource={invoices}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={invoices.length > 0 ? rowSelection : undefined}
      scroll={{ x: '100%', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
