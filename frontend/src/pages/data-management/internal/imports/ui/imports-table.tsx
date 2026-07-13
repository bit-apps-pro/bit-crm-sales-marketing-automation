import { __ } from '@common/helpers/i18nWrap'
import { Button, Popconfirm, Table, type TableColumnsType } from 'antd'
import { useCallback, useMemo } from 'react'
import { LuTrash2 } from 'react-icons/lu'

import useDeleteImportData from '../data/use-delete-import-data'
import { type ImportsData, type ImportsTableProps } from '../shared/types'

export default function ImportsTable({ importsData, loading }: ImportsTableProps) {
  const { deleteImportData } = useDeleteImportData()

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteImportData(id)
    },
    [deleteImportData]
  )

  const columns: TableColumnsType<ImportsData> = useMemo(
    () => [
      {
        dataIndex: 'file_name',
        key: 'file_name',
        title: __('File')
      },
      {
        dataIndex: 'module',
        key: 'module',
        title: __('Module')
      },
      {
        dataIndex: 'created_at',
        key: 'created_at',
        title: __('Date')
      },
      {
        dataIndex: 'total',
        key: 'total',
        title: __('Total')
      },
      {
        dataIndex: 'completed',
        key: 'completed',
        title: __('Created')
      },
      {
        dataIndex: 'updated',
        key: 'updated',
        title: __('Updated')
      },
      {
        dataIndex: 'skipped',
        key: 'skipped',
        title: __('Skipped')
      },
      {
        align: 'center',
        key: 'actions',
        render: (_, record) => (
          <Popconfirm
            cancelText={__('No')}
            description={__('Are you sure to delete this import?')}
            okText={__('Yes')}
            onConfirm={() => handleDelete(record.id)}
            placement="topRight"
            title={__('Delete the import')}
          >
            <Button
              danger
              disabled={record.status !== 'completed'}
              icon={<LuTrash2 size={14} />}
              type="link"
            />
          </Popconfirm>
        ),
        title: __('Actions'),
        width: 80
      }
    ],
    [handleDelete]
  )

  return (
    <Table
      columns={columns}
      dataSource={importsData}
      loading={loading}
      pagination={false}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      size="small"
    />
  )
}
