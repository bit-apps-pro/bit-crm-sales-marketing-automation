import { checkCapability, getCapability } from '@common/helpers/capabilityHelper'
import { renderFullName } from '@common/helpers/entity-helpers'
import { unslugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { type FieldItem, type ModuleType } from '@common/types/types'
import If from '@utilities/If'
import { Button, Space, Table, Tag, Typography } from 'antd'
import { type Key, useMemo } from 'react'
import { LuEye } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import {
  useRelatedEntityKeysStoreActions,
  useSelectedKeys
} from '../state/use-selected-related-entity-keys-store'
import DetachRelatedEntitiesPopup from './detach-related-entities-popup'

interface RelatedEntitiesTableProps {
  detachable: boolean
  entities: ModuleType[]
  entity: string
  entityId: number
  fields: FieldItem[]
  isLoading: boolean
  relatedEntity: string
}
export default function RelatedEntitiesTable({
  detachable,
  entities,
  entity,
  entityId,
  fields,
  isLoading,
  relatedEntity
}: RelatedEntitiesTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = searchParams.get('sortBy') || 'id'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const tableScrollY = useTableScrollHeight(400)
  const selectedKeys = useSelectedKeys()
  const { setSelectedKeys } = useRelatedEntityKeysStoreActions()

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

  const handleRowSelectionChange = (newSelectedRowKeys: Key[]) => {
    setSelectedKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    columnWidth: 48,
    fixed: true,
    onChange: handleRowSelectionChange,
    selectedRowKeys: selectedKeys
  }

  const dynamicColumns = useMemo(
    () =>
      fields
        .filter(field => field.is_visible)
        .map(field => ({
          dataIndex: field.field_key,
          ellipsis: {
            showTitle: true
          },
          key: field.field_key,
          render: (text: string, record: ModuleType): React.ReactNode => {
            if (field.field_key === 'name') {
              return (
                <Link target="_blank" to={`../${relatedEntity}s/details/${record.id}`}>
                  <Typography.Text className="hover:text-blue-500">{text}</Typography.Text>{' '}
                </Link>
              )
            }
            if (field.field_key === 'contact_id') {
              if (entity === 'contact') {
                return <Typography.Text>{record.contact_name}</Typography.Text>
              }
              return (
                <Link target="_blank" to={`../contacts/details/${record.contact_id}`}>
                  <Typography.Text className="hover:text-blue-500">
                    {record.contact_name}
                  </Typography.Text>
                </Link>
              )
            }
            if (field.field_key === 'full_name') {
              return (
                <Link target="_blank" to={`../${relatedEntity}s/details/${record.id}`}>
                  <Typography.Text className="hover:text-blue-500">
                    {renderFullName(record?.title, record?.first_name, record?.last_name)}
                  </Typography.Text>
                </Link>
              )
            }
            if (field.field_key === 'company_id' && record?.company_name) {
              if (entity === 'company') {
                return <Typography.Text>{record.company_name}</Typography.Text>
              }
              return (
                <Link target="_blank" to={`../companies/details/${record.company_id}`}>
                  <Typography.Text className="hover:text-blue-500">
                    {record.company_name}
                  </Typography.Text>
                </Link>
              )
            }
            if (field.field_key === 'parent_id' && record?.parent_name) {
              return (
                <Link target="_blank" to={`../${relatedEntity}s/details/${record.parent_id}`}>
                  <Typography.Text className="hover:text-blue-500">{record.parent_name}</Typography.Text>
                </Link>
              )
            }
            if (field.type === 'select' || field.type === 'radio') {
              return unslugify(text)
            }
            if (field.field_key === 'owner_id' && record?.owner_name) {
              return record.owner_name
            }
            let parsedValue: string | string[] = text
            try {
              const parsed = JSON.parse(text)
              if (Array.isArray(parsed) && parsed.every(e => typeof e === 'string')) {
                parsedValue = parsed
              }
            } catch {
              //empty scope
            }
            if (Array.isArray(parsedValue)) {
              return (
                <div className="flex flex-row flex-wrap gap-1">
                  {parsedValue?.map((item, index) => (
                    <Tag className="m-0 text-xs" key={index}>
                      {unslugify(item)}
                    </Tag>
                  ))}
                </div>
              )
            }
            return parsedValue
          },
          sorter: field.field_key !== 'full_name',
          sortOrder: (() => {
            if (sortBy !== field.field_key) return
            return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
          })(),
          title: field?.label,
          width: 200
        })),
    [fields, sortBy, sortOrder, entity, relatedEntity]
  )

  const columns = [
    ...dynamicColumns,
    {
      dataIndex: 'actions',
      fixed: 'right' as const,
      key: 'actions',
      render: (_: unknown, record: ModuleType) => (
        <Space align="center">
          <If conditions={checkCapability(getCapability('VIEW', relatedEntity))}>
            <Link target="_blank" to={`../${relatedEntity}s/details/${record?.id}`}>
              <Button icon={<LuEye size={14} />} type="link" />
            </Link>
          </If>
          <If conditions={checkCapability(getCapability('UPDATE', relatedEntity)) && detachable}>
            <DetachRelatedEntitiesPopup
              entity={entity}
              entityId={entityId}
              relatedEntity={relatedEntity}
              relatedEntityIds={[record?.id]}
            />
          </If>
        </Space>
      ),
      title: __('Actions'),
      width: 100
    }
  ]
  return (
    <Table
      columns={columns}
      dataSource={entities}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={detachable && entities && entities.length > 0 ? rowSelection : undefined}
      scroll={{ x: 'max-content', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
