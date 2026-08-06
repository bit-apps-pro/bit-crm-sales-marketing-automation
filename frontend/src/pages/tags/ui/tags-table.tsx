import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useTableScrollHeight from '@common/hooks/use-table-scroll-height'
import { useTagStoreActions } from '@pages/tags/state/use-tag-store'
import If from '@utilities/If'
import { Button, Popconfirm, Table } from 'antd'
import { useCallback, useMemo } from 'react'
import { LuInfo, LuPencilLine, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useDeleteTags from '../data/use-delete-tags'
import { type TagItemType, type TagsTablePropsType } from '../shared/tag-types'
import { useTagStoreKeysActions, useTagStoreSelectedKeys } from '../state/use-selected-tag-keys-store'

export default function TagsTable({ isTagsLoading, tags }: TagsTablePropsType) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const { handleModal } = useTagStoreActions()
  const { clearStore, setSelectedKeys } = useTagStoreKeysActions()
  const { deleteTags } = useDeleteTags()
  const selectedKeys = useTagStoreSelectedKeys()
  const tableScrollY = useTableScrollHeight(400)

  const handleEdit = useCallback(
    (id: number) => {
      handleModal('open', setSearchParams, { id: id.toString(), modal: 'edit' })
    },
    [handleModal, setSearchParams]
  )

  const handleDeleteTag = useCallback(
    async (id: number) => {
      const { status } = await deleteTags({ ids: [id] })

      if (status === 'error') return

      if (tags.length === 1 && searchParams.get('page') !== '1') {
        setSearchParams(prev => {
          prev.set('page', String(Number(searchParams.get('page')) - 1))
          return prev
        })
      }
    },
    [deleteTags, tags.length, searchParams, setSearchParams]
  )

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

  const handleSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedKeys(newSelectedRowKeys)
  }

  const columns = useMemo(
    () => [
      {
        dataIndex: 'title',
        key: 'title',
        sorter: true,
        sortOrder: (() => {
          if (sortBy !== 'title') return
          return sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)
        })(),
        title: __('Title')
      },
      {
        dataIndex: 'module',
        key: 'module',
        render: (module: string) => {
          return <span className="capitalize">{module}</span>
        },
        title: __('Module')
      },
      {
        dataIndex: 'count',
        key: 'count',
        title: __('Count')
      },
      {
        dataIndex: 'actions',
        key: 'actions',
        render: (_: unknown, record: TagItemType) => (
          <div>
            <If conditions={checkCapability(CAPABILITIES.TAG.UPDATE)}>
              <Button
                icon={<LuPencilLine size={14} />}
                onClick={() => handleEdit(record.id)}
                type="link"
              ></Button>
            </If>
            <If conditions={checkCapability(CAPABILITIES.TAG.DELETE)}>
              <Popconfirm
                cancelText={__('No')}
                description={__('Are you sure you want to delete this tag?')}
                icon={false}
                onConfirm={() => {
                  handleDeleteTag(record.id)
                  clearStore()
                }}
                placement="topRight"
                title={
                  <div className="flex items-center gap-1">
                    <LuInfo />
                    {__('Confirm Deletion')}
                  </div>
                }
              >
                <Button aria-label={__('Delete tag')} danger icon={<LuTrash2 size={14} />} type="link" />
              </Popconfirm>
            </If>
          </div>
        ),
        title: __('Actions'),
        width: 100
      }
    ],
    [handleDeleteTag, clearStore, handleEdit, sortBy, sortOrder]
  )

  const rowSelection = {
    columnWidth: 48,
    fixed: true,
    onChange: handleSelectionChange,
    selectedRowKeys: selectedKeys
  }

  return (
    <Table<TagItemType>
      columns={columns}
      dataSource={tags}
      loading={isTagsLoading}
      onChange={handleTableChange}
      pagination={false}
      rowKey="id"
      rowSelection={tags.length > 0 ? rowSelection : undefined}
      scroll={{ x: 'max-content', y: tableScrollY }}
      size="small"
      virtual
    />
  )
}
