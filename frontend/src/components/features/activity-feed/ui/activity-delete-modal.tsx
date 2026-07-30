import { __ } from '@common/helpers/i18nWrap'
import useDeleteActivity from '@features/activity-feed/data/use-delete-activity'
import useTaskStore from '@features/tasks/state/use-task-store'
import If from '@utilities/If'
import { Modal } from 'antd'
import { useEffect } from 'react'
import { LuInfo } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

export default function ActivityDeleteModal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const id = Number(searchParams.get('id')) || 0

  const { isDeleteModalOpen, setDeleteModalOpen } = useTaskStore()
  const { deleteActivity, isDeletingActivity } = useDeleteActivity()

  useEffect(() => {
    if (!searchParams.has('modal') || !searchParams.has('id') || searchParams.get('id') === '0') {
      setDeleteModalOpen(false)
      return
    }

    if (searchParams.get('modal') === 'delete') {
      setDeleteModalOpen(true)
      return
    }

    setDeleteModalOpen(false)
  }, [searchParams, setDeleteModalOpen])

  const handleCancel = () => {
    setSearchParams(prev => {
      prev.delete('modal')
      return prev
    })
  }

  const handleDelete = async () => {
    if (!id) return

    await deleteActivity(id)
    setSearchParams(prev => {
      prev.delete('modal')
      prev.delete('id')
      return prev
    })
  }

  return (
    <Modal
      confirmLoading={isDeletingActivity}
      okText={__('Delete')}
      onCancel={handleCancel}
      onOk={handleDelete}
      open={isDeleteModalOpen}
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <If conditions={isDeleteModalOpen}>
        <p className="text-sm">{__('Are you sure you want to delete this?')}</p>
      </If>
    </Modal>
  )
}
