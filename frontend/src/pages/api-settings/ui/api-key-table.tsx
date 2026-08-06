import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { type ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'
import { LuInfo, LuTrash2 } from 'react-icons/lu'

import useRevokeApiKey from '../data/use-revoke-api-key'
import { type ApiKeyType, type ApiUserRowType } from '../shared/api-settings-type'

interface ApiKeyTableProps {
  isLoadingApiKeys: boolean
  users: ApiUserRowType[]
}

export default function ApiKeyTable({ isLoadingApiKeys, users }: ApiKeyTableProps) {
  const { revokeApiKey } = useRevokeApiKey()

  const columns: ColumnsType<ApiUserRowType> = useMemo(
    () => [
      {
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <span className="flex items-center gap-2">
            {record.name}
            {record.isAdmin && <Tag color="orange">{__('Administrator')}</Tag>}
          </span>
        ),
        title: __('Name')
      },
      {
        dataIndex: 'email',
        key: 'email',
        title: __('Email')
      },
      {
        dataIndex: 'keyCount',
        key: 'keyCount',
        render: (_, record) => `${record.keyCount} ${__('Keys')}`,
        title: __('API keys')
      },
      {
        key: 'actions',
        render: (_, record) => (
          <div className="flex items-center gap-1">
            <Button className="p-0" href={record.profile} rel="noreferrer" target="_blank" type="link">
              {__('Manage')}
            </Button>
            <Tooltip
              title={__(
                "Opens this user's WordPress profile in a new tab, where application passwords can be renamed or revoked."
              )}
            >
              <span className="flex items-center">
                <LuInfo size={14} />
              </span>
            </Tooltip>
          </div>
        ),
        title: __('Actions')
      }
    ],
    []
  )

  const keyColumns = (user: ApiUserRowType): ColumnsType<ApiKeyType> => [
    {
      dataIndex: 'name',
      key: 'name',
      title: __('Key name')
    },
    {
      dataIndex: 'created',
      key: 'created',
      render: created => (created ? formatDateTime(new Date(created * 1000)) : '—'),
      title: __('Created')
    },
    {
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: (lastUsed, record) =>
        lastUsed ? (
          <Space direction="vertical" size={0}>
            <span>{formatDateTime(new Date(lastUsed * 1000))}</span>
            {record.lastIp && <Typography.Text type="secondary">{record.lastIp}</Typography.Text>}
          </Space>
        ) : (
          <Typography.Text type="secondary">{__('Never used')}</Typography.Text>
        ),
      title: __('Last used')
    },
    {
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          cancelText={__('No')}
          description={__('Any integration using this key will stop working.')}
          okText={__('Yes')}
          onConfirm={() => revokeApiKey({ userId: user.id, uuid: record.uuid })}
          placement="topRight"
          title={__('Revoke this key?')}
        >
          <Button danger icon={<LuTrash2 size={14} />} type="link" />
        </Popconfirm>
      ),
      title: __('Actions')
    }
  ]

  return (
    <Table<ApiUserRowType>
      columns={columns}
      dataSource={users}
      expandable={{
        expandedRowRender: user => (
          <Table<ApiKeyType>
            className="ml-6"
            columns={keyColumns(user)}
            dataSource={user.keys}
            pagination={false}
            rowKey="uuid"
            size="small"
          />
        )
      }}
      loading={isLoadingApiKeys}
      pagination={false}
      rowKey="id"
      size="small"
    />
  )
}
