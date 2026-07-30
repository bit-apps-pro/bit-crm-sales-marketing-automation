import { __ } from '@common/helpers/i18nWrap'
import useStatusUpdateActivity from '@features/activity-feed/data/use-status-update-activity'
import { useActivityStoreActions } from '@features/activity-feed/state/use-activity-store'
import { type MenuProps } from 'antd'
import { Button, Dropdown } from 'antd'
import { LuCircleCheck, LuCircleX, LuEllipsisVertical, LuPenLine, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

interface ActivityActionsProps {
  isCompleted?: boolean
}

export default function ActivityActions({ isCompleted }: ActivityActionsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleModal } = useActivityStoreActions()
  const id = Number(searchParams.get('id')) || 0
  const { isUpdatingStatus, updateStatus } = useStatusUpdateActivity()

  const handleStatusUpdate = async () => {
    if (!id) return
    await updateStatus({ id })
  }

  const items: MenuProps['items'] = [
    {
      disabled: isUpdatingStatus,
      icon: isCompleted ? <LuCircleX size={14} /> : <LuCircleCheck size={14} />,
      key: 'status',
      label: isCompleted ? __('Mark as incomplete') : __('Mark as completed'),
      onClick: handleStatusUpdate
    },
    {
      icon: <LuPenLine />,
      key: 'edit',
      label: __('Edit'),
      onClick: () => handleModal('open', setSearchParams, { modal: 'edit' })
    },
    {
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: () => handleModal('open', setSearchParams, { modal: 'delete' })
    }
  ]
  return (
    <Dropdown arrow menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Button icon={<LuEllipsisVertical size={14} />} type="link" />
    </Dropdown>
  )
}
