import { __ } from '@common/helpers/i18nWrap'
import { Popconfirm, Table, Typography } from 'antd'
import { type Key, useCallback, useMemo } from 'react'
import { LuArchiveRestore } from 'react-icons/lu'

import { type Stage } from '../../stages/shared/types'
import useUnarchiveStage from '../data/use-unarchive-stage'
import useSelectedStageKeysStore from '../state/use-selected-stage-keys-store'

interface ArchivedStagesTableProps {
  data: Stage[]
  loading?: boolean
}

export default function ArchivedStagesTable({ data, loading = false }: ArchivedStagesTableProps) {
  const { clearSelectedKeys, selectedKeys, setSelectedKeys } = useSelectedStageKeysStore()
  const { unarchiveStage } = useUnarchiveStage()

  const handleUnarchiveStage = useCallback(
    async (key: Key) => {
      await unarchiveStage([key])
      clearSelectedKeys()
    },
    [unarchiveStage, clearSelectedKeys]
  )

  const columns = useMemo(
    () => [
      {
        dataIndex: 'name',
        render: (text: string, record: Stage) => (
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: record.color,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                height: 20,
                width: 20
              }}
            />
            {text}
          </div>
        ),
        title: __('Stage Name'),
        width: '40%'
      },
      {
        dataIndex: 'probability',
        title: __('Probability (%)'),
        width: '15%'
      },
      {
        dataIndex: 'deal_category',
        render: (text: string) => {
          const displayText = typeof text === 'string' ? text.replaceAll('_', ' ') : ''

          return <span className="capitalize">{displayText}</span>
        },
        title: __('Deal Category'),
        width: '25%'
      },
      {
        align: 'center' as const,
        dataIndex: 'operation',
        render: (_: unknown, record: Stage) => (
          <div className="flex items-center justify-center gap-2">
            <Typography.Link title={__('Unarchive')}>
              <Popconfirm
                cancelText={__('No')}
                description={
                  <span>
                    {__('Are you sure you want to unarchive this stage?')}
                    <br />
                    {__('This will make it available in the active stages list.')}
                  </span>
                }
                okText={__('Yes')}
                okType="primary"
                onConfirm={() => handleUnarchiveStage(record.key)}
                placement="topRight"
                title={__('Unarchive stage?')}
              >
                <span>
                  <LuArchiveRestore />
                </span>
              </Popconfirm>
            </Typography.Link>
          </div>
        ),
        title: __('Operations'),
        width: '15%'
      }
    ],
    [handleUnarchiveStage]
  )

  const rowSelection = useMemo(
    () => ({
      onChange: (selectedRowKeys: Key[]) => {
        setSelectedKeys(selectedRowKeys)
      },
      selectedRowKeys: selectedKeys
    }),
    [selectedKeys, setSelectedKeys]
  )

  return (
    <Table<Stage>
      bordered
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      rowKey="key"
      rowSelection={rowSelection}
      scroll={{ x: 'max-content' }}
      tableLayout="fixed"
    />
  )
}
