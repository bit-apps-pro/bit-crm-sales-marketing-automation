import { __ } from '@common/helpers/i18nWrap'
import { Button, Popconfirm, Space, Table } from 'antd'
import { useMemo } from 'react'
import { LuInfo, LuPenLine, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useDeleteTerm from '../data/use-delete-term'
import { type Term } from '../shared/types'
import { useTermsStoreActions } from '../state/use-terms-store'

interface TermsTable {
  data: Term[]
  loading: boolean
}

export default function TermsTable({ data, loading }: TermsTable) {
  const [, setSearchParams] = useSearchParams()
  const { handleModal } = useTermsStoreActions()
  const { deleteTerm, isDeletingTerm } = useDeleteTerm()

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'name',
        key: 'name',
        title: __('Name')
      },
      {
        dataIndex: 'days',
        editable: true,
        key: 'days',
        title: __('Days')
      },
      {
        align: 'center' as const,
        dataIndex: 'operation',
        key: 'operation',
        render: (_: unknown, record: Term) => (
          <Space>
            <Button
              disabled={record.key === 'custom'}
              icon={<LuPenLine size={14} />}
              onClick={() =>
                handleModal('open', setSearchParams, { id: record.key, modal: 'term_edit' })
              }
              type="text"
            />
            <Popconfirm
              cancelText={__('No')}
              description={__('Are you sure you want to delete the term?')}
              icon={false}
              okText={__('Delete')}
              onConfirm={async () => {
                await deleteTerm({ key: record.key })
              }}
              placement="topRight"
              title={
                <div className="flex items-center gap-1">
                  <LuInfo size={18} />
                  {__('Confirm Deletion')}
                </div>
              }
            >
              <Button
                danger
                disabled={record.key === 'custom'}
                icon={<LuTrash2 size={14} />}
                loading={isDeletingTerm}
                type="link"
              />
            </Popconfirm>
          </Space>
        ),
        title: __('Operation')
      }
    ]
  }, [setSearchParams, handleModal, deleteTerm, isDeletingTerm])
  return (
    <Table
      bordered
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      rowKey="key"
      size="small"
      tableLayout="fixed"
    />
  )
}
