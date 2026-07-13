import { __ } from '@common/helpers/i18nWrap'
import { type DropdownProps } from 'antd'
import { Button, Dropdown, Popconfirm } from 'antd'
import { useState } from 'react'
import { LuCircleCheck, LuCircleX, LuEllipsisVertical, LuPenLine, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useDeleteActivity from '../data/use-delete-activity'
import useStatusUpdateActivity from '../data/use-status-update-activity'
import { useActivityStoreActions } from '../state/use-activity-store'

interface ActivityListActionMoreProps {
  id: number
  isCompleted?: boolean
}

export default function ActivityListActionMore({ id, isCompleted }: ActivityListActionMoreProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isUpdatingStatus, updateStatus } = useStatusUpdateActivity()
  const { handleModal } = useActivityStoreActions()
  const [, setSearchParams] = useSearchParams()
  const { deleteActivity } = useDeleteActivity()

  const handleStatusUpdate = async () => {
    await updateStatus({ id })
    setIsOpen(false)
  }

  const handleEdit = () => {
    setIsOpen(false)
    handleModal('open', setSearchParams, { id: id.toString(), modal: 'edit' })
  }

  const handleDelete = async () => {
    await deleteActivity(id)
    setIsOpen(false)
  }

  const items = [
    {
      capability: '',
      disabled: isUpdatingStatus,
      icon: isCompleted ? <LuCircleX size={14} /> : <LuCircleCheck size={14} />,
      key: 'status',
      label: isCompleted ? __('Mark as incomplete') : __('Mark as completed'),
      onClick: handleStatusUpdate
    },
    {
      capability: '',
      icon: <LuPenLine size={14} />,
      key: 'edit',
      label: __('Edit'),
      onClick: handleEdit
    },
    {
      capability: '',
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: (
        <Popconfirm
          cancelText={__('No')}
          okText={__('Yes')}
          onConfirm={handleDelete}
          title={__('Are you sure to delete this?')}
        >
          {__('Delete')}
        </Popconfirm>
      )
    }
  ]

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setIsOpen(nextOpen)
    }
  }

  return (
    <Dropdown
      menu={{ items }}
      onOpenChange={handleOpenChange}
      open={isOpen}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        className="h-full w-full text-gray-600 dark:text-gray-400"
        icon={<LuEllipsisVertical size={12} />}
        type="link"
      />
    </Dropdown>
  )
}
