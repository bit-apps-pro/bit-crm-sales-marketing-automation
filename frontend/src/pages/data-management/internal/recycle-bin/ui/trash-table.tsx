import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button, Popconfirm, Table, type TableColumnsType } from 'antd'
import { useMemo } from 'react'
import { LuArchiveRestore, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import { type Trash, type TrashTableProps, type TrashTableRow } from '../shared/trash-type'
import { useSelectedTrashKeysStore } from '../state/use-selected-trash-keys-store'

const formatTrash = (trashes: Trash[]): TrashTableRow[] =>
  trashes.map(trash => ({
    created_at: formatDateTime(trash.created_at),
    deleted_by: trash.created_by_name,
    id: trash.id,
    module: trash.module,
    name: trash.full_name
  }))

export default function TrashTable({ isLoading, onDelete, onRestore, trashes }: TrashTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { selectedKeys, setSelectedKeys } = useSelectedTrashKeysStore()
  const formattedTrashes = useMemo(() => formatTrash(trashes), [trashes])
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''

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

  const columns: TableColumnsType<TrashTableRow> = useMemo(
    () => [
      {
        dataIndex: 'name',
        key: 'name',
        title: __('Name')
      },
      {
        dataIndex: 'module',
        key: 'module',
        title: __('Module')
      },
      {
        dataIndex: 'deleted_by',
        key: 'deleted_by',
        title: __('Deleted By')
      },
      {
        dataIndex: 'created_at',
        key: 'created_at',
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'created_at') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Deleted Time')
      },
      {
        align: 'center',
        key: 'actions',
        render: (_, record) => (
          <div className="flex items-center justify-center">
            <If conditions={checkCapability(CAPABILITIES.SETTING.DATA_MANAGEMENT)}>
              <Popconfirm
                cancelText={__('No')}
                description={__('Are you sure to restore?')}
                okText={__('Yes')}
                onConfirm={() => onRestore([record.id])}
                placement="topRight"
                title={__('Restore the item')}
              >
                <Button icon={<LuArchiveRestore size={14} />} type="link" />
              </Popconfirm>
            </If>
            <If conditions={checkCapability(CAPABILITIES.SETTING.DATA_MANAGEMENT)}>
              <Popconfirm
                cancelText={__('No')}
                description={__('Are you sure to delete permanently?')}
                okText={__('Yes')}
                onConfirm={() => onDelete([record.id])}
                placement="topRight"
                title={__('Delete the item')}
              >
                <Button danger icon={<LuTrash2 size={14} />} type="link" />
              </Popconfirm>
            </If>
          </div>
        ),
        title: __('Actions'),
        width: 120
      }
    ],
    [onDelete, onRestore, sortBy, sortOrder]
  )

  const rowSelection = {
    onChange: handleRowSelectionChange,
    selectedRowKeys: selectedKeys
  }

  return (
    <Table
      columns={columns}
      dataSource={formattedTrashes}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={formattedTrashes.length > 0 ? rowSelection : undefined}
      scroll={{ x: 'max-content' }}
      size="small"
    />
  )
}
