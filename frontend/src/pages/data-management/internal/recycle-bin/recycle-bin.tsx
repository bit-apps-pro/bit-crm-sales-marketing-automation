import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import ModuleSelect from '@utilities/module-select'
import Pagination from '@utilities/pagination'
import { Button, DatePicker, Typography } from 'antd'
import useModal from 'antd/es/modal/useModal'
import { type Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { LuInfo, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useDeleteTrash from './data/use-delete-trash'
import useEmptyTrash from './data/use-empty-trash'
import useRestoreTrash from './data/use-restore-trash'
import useTrashes from './data/use-trashes'
import { useSelectedTrashKeysStore } from './state/use-selected-trash-keys-store'
import TrashBulkOperations from './ui/trash-bulk-operations'
import TrashTable from './ui/trash-table'

export default function RecycleBin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modal, contextHolder] = useModal()
  const { clearSelectedKeys, selectedKeys } = useSelectedTrashKeysStore()

  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage') || 10)
  const module = searchParams.get('module') || ''
  const dateRange = searchParams.get('dateRange') || ''
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const { isFetchingTrashes, isPendingTrashes, isRefetchingTrashes, totalTrashes, trashes } = useTrashes(
    {
      dateRange,
      module,
      page,
      perPage,
      sortBy,
      sortOrder
    }
  )
  const { isRestoringTrash, restoreTrash } = useRestoreTrash()
  const { deleteTrash, isDeletingTrash } = useDeleteTrash()
  const { emptyTrash } = useEmptyTrash()

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => {
      if (prev.has('page')) {
        prev.set('page', '1')
      }
      if (!value) {
        prev.delete(key)
        return prev
      }
      prev.set(key, value)
      return prev
    })
  }

  const handleRestoreTrash = useCallback(
    async (ids: number[]) => {
      await restoreTrash({
        ids
      })
      clearSelectedKeys()
    },
    [restoreTrash, clearSelectedKeys]
  )

  const handleDeleteTrash = useCallback(
    async (ids: number[]) => {
      await deleteTrash({
        ids
      })
      clearSelectedKeys()
    },
    [deleteTrash, clearSelectedKeys]
  )

  const handleEmptyTrash = useCallback(async () => {
    await emptyTrash()
    clearSelectedKeys()
  }, [emptyTrash, clearSelectedKeys])

  const showDeleteAllConfirm = () => {
    modal.confirm({
      content: __('Are you Confirm to delete permanently?'),
      icon: <LuInfo size={18} />,
      okText: __('Empty'),
      onOk: () => handleEmptyTrash(),
      title: __('Empty trash')
    })
  }

  return (
    <>
      {contextHolder}
      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            <Typography.Title className="mb-0" level={4}>
              {__('Recycle Bin')}
            </Typography.Title>
            <Button
              aria-label={__('Empty Trash')}
              className="rounded-full"
              danger
              icon={<LuTrash2 size={14} />}
              onClick={showDeleteAllConfirm}
              size="large"
            >
              {__('Empty Trash')}
            </Button>
            <If conditions={selectedKeys.length !== 0}>
              <TrashBulkOperations
                onDelete={handleDeleteTrash}
                onRestore={handleRestoreTrash}
                selectedIds={selectedKeys.map(Number)}
              />
            </If>
            <If
              conditions={
                isFetchingTrashes || isRefetchingTrashes || isRestoringTrash || isDeletingTrash
              }
            >
              <LoadingOutlined />
            </If>
          </div>
          <div className="flex items-center gap-2">
            <ModuleSelect
              allowClear
              className="w-36 [&_.ant-select-selector]:rounded-full"
              onChange={value => handleFilterChange('module', value)}
              placeholder={__('Filter by module')}
              popupMatchSelectWidth={false}
              value={module || undefined}
            />
            <DatePicker.RangePicker
              allowClear
              className="w-64 rounded-full"
              format="YYYY-MM-DD"
              onChange={(_, dateStringArray) => {
                let dateString = ''
                if (dateStringArray.every(Boolean)) {
                  dateString = dateStringArray.join(',')
                }
                return handleFilterChange('dateRange', dateString)
              }}
              value={dateRange ? (dateRange.split(',').map(d => dayjs(d)) as [Dayjs, Dayjs]) : undefined}
            />
          </div>
        </div>
        <TrashTable
          isLoading={isFetchingTrashes || isPendingTrashes}
          onDelete={handleDeleteTrash}
          onRestore={handleRestoreTrash}
          trashes={trashes}
        />
        <div className="flex justify-center p-2">
          <Pagination total={totalTrashes} />
        </div>
      </div>
    </>
  )
}
