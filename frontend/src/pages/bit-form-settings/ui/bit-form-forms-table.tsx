import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { Button, Space, Switch, Table, Tooltip, Typography } from 'antd'
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

  // Every column carries a width: with `scroll.y` antd lays the table out fixed, and
  // width-less columns split the leftover space -- on a phone each one shrank to its
  // first letter behind the ellipsis instead of the table scrolling sideways.
  const columns = useMemo<ColumnsType<BitFormListItem>>(
    () => [
      {
        dataIndex: 'formName',
        ellipsis: {
          showTitle: true
        },
        key: 'formName',
        title: __('Form'),
        width: 200
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
        title: __('Shortcode'),
        width: 200
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
        title: __('Entries'),
        width: 90
      },
      {
        dataIndex: 'createdAt',
        ellipsis: {
          showTitle: true
        },
        key: 'createdAt',
        render: (createdAt: string) => formatDateTime(createdAt),
        title: __('Created'),
        width: 220
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
        title: __('Published'),
        width: 110
      },
      {
        fixed: 'right',
        key: 'actions',
        render: (_, item) => (
          <Space>
            <Tooltip title={__('Edit form in Bit Form')}>
              <Button
                href={item.urls.editForm}
                icon={<LuPenLine size={14} />}
                rel="noreferrer"
                size="small"
                target="_blank"
                type="link"
              />
            </Tooltip>
            <Tooltip title={__('Edit integration in Bit Form')}>
              <Button
                href={item.urls.editIntegration}
                icon={<LuUnplug size={14} />}
                rel="noreferrer"
                size="small"
                target="_blank"
                type="link"
              />
            </Tooltip>

            <Tooltip title={__('Preview form in Bit Form')}>
              <Button
                href={item.urls.preview}
                icon={<LuEye size={14} />}
                rel="noreferrer"
                size="small"
                target="_blank"
                type="link"
              />
            </Tooltip>
          </Space>
        ),
        title: __('Actions'),
        width: 120
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
