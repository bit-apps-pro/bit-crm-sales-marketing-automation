import { __ } from '@common/helpers/i18nWrap'
import { type FormInstance, Popconfirm } from 'antd'
import { Table, Typography } from 'antd'
import { type Key, useCallback, useMemo, useState } from 'react'
import { LuArchive, LuCheck, LuPenLine, LuX } from 'react-icons/lu'

import useArchiveStage from '../data/use-archive-stage'
import useUpdateStage from '../data/use-update-stage'
import { type Stage } from '../shared/types'
import DragHandle from './stage-drag-handle'
import Row from './stage-row'
import StagesTableEditableCell from './stages-table-editable-cell'

const getInputType = (dataIndex: string): 'color' | 'number' | 'select' | 'text' => {
  if (dataIndex === 'color') return 'color'
  if (dataIndex === 'deal_category') return 'select'
  if (dataIndex === 'probability') return 'number'
  return 'text'
}

export default function StagesTable({ data, form }: { data: Stage[]; form: FormInstance }) {
  const [editingKey, setEditingKey] = useState('')
  const { updateStage } = useUpdateStage()
  const { archiveStage } = useArchiveStage()

  const isEditing = useCallback((record: Stage) => record.key === editingKey, [editingKey])

  const edit = useCallback(
    (record: Partial<Stage> & { key: React.Key }) => {
      form.setFieldsValue({
        color: record.color,
        deal_category: record.deal_category,
        name: record.name,
        probability: record.probability
      })
      setEditingKey(record.key)
    },
    [form]
  )

  const cancel = useCallback(() => {
    setEditingKey('')
  }, [])

  const save = useCallback(
    async (key: Key) => {
      try {
        const row = await form.validateFields()

        await updateStage({ ...row, key })

        setEditingKey('')
      } catch (error) {
        console.error('Validate Failed:', error)
      }
    },
    [form, updateStage]
  )

  const mergedColumns = useMemo(() => {
    const columns = [
      { align: 'center' as const, key: 'sort', render: () => <DragHandle />, width: 80 },
      {
        dataIndex: 'name',
        editable: true,
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
        editable: true,
        title: __('Probability (%)'),
        width: '15%'
      },
      {
        dataIndex: 'deal_category',
        editable: true,
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
        render: (_: unknown, record: Stage) => {
          const editable = isEditing(record)
          return editable ? (
            <span className="flex items-center justify-center gap-2">
              <Typography.Link onClick={() => save(record.key)} title={__('Save')}>
                <LuCheck color="green" size={18} />
              </Typography.Link>
              <Typography.Link onClick={cancel} title={__('Cancel')}>
                <LuX color="red" size={18} />
              </Typography.Link>
            </span>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Typography.Link disabled={editingKey !== ''} title={__('Archive')}>
                <Popconfirm
                  cancelText={__('No')}
                  description={
                    <span>
                      {__('If you archive this stage, all deals in this stage')}
                      <br />
                      {__('will also be hidden in the Kanban view.')}
                    </span>
                  }
                  okText={__('Yes')}
                  okType="danger"
                  onConfirm={() => archiveStage(record.key)}
                  placement="topRight"
                  title={__('Are you sure you want to archive this stage?')}
                >
                  <span>
                    <LuArchive />
                  </span>
                </Popconfirm>
              </Typography.Link>
              <Typography.Link
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
                title={__('Edit')}
              >
                <LuPenLine />
              </Typography.Link>
            </div>
          )
        },
        title: __('Operation'),
        width: '20%'
      }
    ]

    return columns.map(col => {
      if (!col.editable) {
        return col
      }

      return {
        ...col,
        onCell: (record: Stage) => ({
          dataIndex: col.dataIndex,
          editing: isEditing(record),
          index: 0,
          inputType: getInputType(col.dataIndex),
          record,
          title: col.title
        })
      }
    })
  }, [editingKey, archiveStage, isEditing, save, cancel, edit])

  return (
    <Table<Stage>
      bordered
      columns={mergedColumns}
      components={{
        body: {
          cell: StagesTableEditableCell,
          row: Row
        }
      }}
      dataSource={data}
      pagination={false}
      rowKey="key"
      scroll={{ x: 'max-content' }}
      tableLayout="fixed"
    />
  )
}
