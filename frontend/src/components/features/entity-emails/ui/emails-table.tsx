import { __ } from '@common/helpers/i18nWrap'
import { Table, Tag, Typography } from 'antd'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { type FormattedEmailData } from '../shared/types'
import useEmailViewStore from '../state/use-email-view-store'

interface EmailsTableProps {
  emails: FormattedEmailData[]
  isLoading?: boolean
}

export default function EmailsTable({ emails, isLoading }: EmailsTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleViewOpen } = useEmailViewStore()
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''

  const handleEmailView = useCallback(
    (emailId: number) => {
      handleViewOpen(emailId, emails)
    },
    [handleViewOpen, emails]
  )

  const handleTableChange = (_pagination: unknown, _filters: unknown, sorter: unknown) => {
    const sortData = Array.isArray(sorter) ? sorter[0] : sorter

    setSearchParams(prev => {
      if (
        sortData &&
        typeof sortData === 'object' &&
        'field' in sortData &&
        'order' in sortData &&
        sortData.field &&
        sortData.order
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
        dataIndex: 'subject',
        key: 'subject',
        render: (_: unknown, record: FormattedEmailData) => (
          <div
            className="group flex h-full w-full cursor-pointer flex-col hover:text-blue-500"
            onClick={() => handleEmailView(record?.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleEmailView(record?.id)
                e.preventDefault()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Typography.Title className="mb-0 group-hover:text-blue-400" level={5}>
              {record?.subject}
            </Typography.Title>
            <Typography.Text>{record?.receivedBy}</Typography.Text>
          </div>
        ),
        title: __('Subject')
      },
      {
        dataIndex: 'emailDate',
        key: 'emailDate',
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'emailDate') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Date')
      },
      {
        dataIndex: 'sentBy',
        key: 'sentBy',
        title: __('Sent By')
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (_: unknown, record: FormattedEmailData) => (
          <Tag className="text-xs" color={record.status === 'sent' ? 'green' : 'blue'}>
            {record.status}
          </Tag>
        ),
        title: __('Status')
      }
    ],
    [sortBy, sortOrder, handleEmailView]
  )
  return (
    <Table
      columns={columns}
      dataSource={emails}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      size="small"
    />
  )
}
