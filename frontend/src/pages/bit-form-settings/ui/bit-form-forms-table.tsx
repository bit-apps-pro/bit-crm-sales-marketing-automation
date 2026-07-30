import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { Button, Space, Switch, Table, Typography } from 'antd'
import { type ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'
import { LuEye, LuPenLine, LuUnplug } from 'react-icons/lu'

import useToggleFormStatus from '../data/use-toggle-form-status'
import { type BitFormListItem } from '../shared/types'

interface BitFormFormsTableProps {
  forms: BitFormListItem[]
  loading: boolean
}

export default function BitFormFormsTable({ forms, loading }: BitFormFormsTableProps) {
  const { isToggling, toggleFormStatus, togglingFormId } = useToggleFormStatus()
  const tableScrollY = useTableScrollHeight(400)

  const columns = useMemo<ColumnsType<BitFormListItem>>(
    () => [
      {
        dataIndex: 'formName',
        ellipsis: {
          showTitle: true
        },
        key: 'formName',
        title: __('Form')
      },
      {
        dataIndex: 'shortcode',
        ellipsis: {
          showTitle: true
        },
        key: 'shortcode',
        render: (shortcode: string) => (
          <Typography.Text code copyable={{ text: shortcode }}>
            {shortcode}
          </Typography.Text>
        ),
        title: __('Shortcode')
      },
      {
        dataIndex: 'entriesCount',
        ellipsis: {
          showTitle: true
        },
        key: 'entriesCount',
        render: (entriesCount: number, item) => (
          <a href={item.urls.viewEntries} rel="noreferrer" target="_blank">
            {entriesCount}
          </a>
        ),
        title: __('Entries')
      },
      {
        dataIndex: 'createdAt',
        ellipsis: {
          showTitle: true
        },
        key: 'createdAt',
        render: (createdAt: string) => formatDateTime(createdAt),
        title: __('Created')
      },
      {
        align: 'center',
        ellipsis: {
          showTitle: true
        },
        key: 'published',
        render: (_, item) => (
          <Switch
            checked={item.formStatus === 1}
            disabled={item.formStatus === 2 || isToggling}
            loading={togglingFormId === item.formId}
            onChange={checked => toggleFormStatus({ formId: item.formId, status: checked ? 1 : 0 })}
            size="small"
          />
        ),
        title: __('Published')
      },
      {
        key: 'actions',
        render: (_, item) => (
          <Space>
            <Button
              href={item.urls.editForm}
              icon={<LuPenLine size={14} />}
              rel="noreferrer"
              size="small"
              target="_blank"
              type="link"
            />
            <Button
              href={item.urls.editIntegration}
              icon={<LuUnplug size={14} />}
              rel="noreferrer"
              size="small"
              target="_blank"
              type="link"
            />
            <Button
              href={item.urls.preview}
              icon={<LuEye size={14} />}
              rel="noreferrer"
              size="small"
              target="_blank"
              type="link"
            />
          </Space>
        ),
        title: __('Actions'),
        width: 100
      }
    ],
    [isToggling, toggleFormStatus, togglingFormId]
  )

  return (
    <Table<BitFormListItem>
      columns={columns}
      dataSource={forms}
      loading={loading}
      pagination={false}
      rowKey="formId"
      scroll={{ x: 'max-content', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
