import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button, Popconfirm, Table, Typography } from 'antd'
import { type ColumnsType } from 'antd/es/table'
import { useCallback, useMemo } from 'react'
import { LuPenLine, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useDeleteLink from '../data/use-delete-link'
import { type LinkType } from '../shared/link-types'
import useLinkStore from '../state/use-link-store'

export default function LinkTable({ links, loading }: { links?: LinkType[]; loading?: boolean }) {
  const { handleModal } = useLinkStore()
  const { deleteLink } = useDeleteLink()
  const [, setSearchParams] = useSearchParams()

  const handleEdit = useCallback(
    (id: number) => {
      handleModal('open', setSearchParams, { id: String(id), modal: 'link_edit' })
    },
    [handleModal, setSearchParams]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteLink(id)
    },
    [deleteLink]
  )

  const columns: ColumnsType<LinkType> = useMemo(
    () => [
      {
        dataIndex: 'title',
        key: 'title',
        title: __('Title')
      },
      {
        dataIndex: 'description',
        key: 'description',
        title: __('Description')
      },
      {
        dataIndex: 'link',
        key: 'link',
        render: (value, record) => (
          <Typography.Link
            className="text-blue-600 hover:underline"
            copyable
            href={record?.processed_url || value}
            target="_blank"
          >
            {value}
          </Typography.Link>
        ),
        title: __('Link')
      },
      {
        dataIndex: 'created_by',
        key: 'created_by',
        render: text => text || '-',
        title: __('Created By')
      },
      {
        dataIndex: 'created_at',
        key: 'created_at',
        title: __('Date')
      },
      {
        key: 'actions',
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <If conditions={checkCapability(CAPABILITIES.LINK.UPDATE)}>
              <Button
                icon={<LuPenLine />}
                onClick={() => handleEdit(record.id!)}
                size="small"
                type="link"
              />
            </If>
            <If conditions={checkCapability(CAPABILITIES.LINK.DELETE)}>
              <Popconfirm
                cancelText={__('No')}
                okText={__('Yes')}
                onConfirm={() => handleDelete(record.id!)}
                title={__('Are you sure to delete this?')}
              >
                <Button danger icon={<LuTrash2 />} size="small" type="link" />
              </Popconfirm>
            </If>
          </div>
        ),
        title: __('Actions')
      }
    ],
    [handleEdit, handleDelete]
  )

  return (
    <Table
      columns={columns}
      dataSource={links}
      loading={loading}
      pagination={false}
      rowKey="id"
      size="small"
    />
  )
}
