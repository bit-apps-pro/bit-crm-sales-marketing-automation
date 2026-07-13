import { __ } from '@common/helpers/i18nWrap'
import { Button, Dropdown } from 'antd'
import { type DropdownProps } from 'antd/lib'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

export default function DealCardActions({
  id,
  open,
  setOpen
}: {
  id: number
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [, setSearchParams] = useSearchParams()

  const handleModalOpen = (modalType: string) => {
    setOpen(false)
    setSearchParams({ id: String(id), modal: modalType })
  }

  const items = [
    {
      icon: <LuPlus />,
      key: 'task',
      label: __('New Task'),
      onClick: () => handleModalOpen('task_create')
    },
    {
      icon: <LuPlus />,
      key: 'meeting',
      label: __('New Meeting'),
      onClick: () => handleModalOpen('meeting_create')
    },
    {
      icon: <LuPlus />,
      key: 'call',
      label: __('New Call'),
      onClick: () => handleModalOpen('call_create')
    },
    {
      icon: <LuPlus />,
      key: 'attachment',
      label: __('New Attachment'),
      onClick: () => handleModalOpen('attachment_create')
    },
    {
      icon: <LuPlus />,
      key: 'note',
      label: __('New Note'),
      onClick: () => handleModalOpen('note_create')
    },
    {
      icon: <LuPlus />,
      key: 'link',
      label: __('New Link'),
      onClick: () => handleModalOpen('link_create')
    }
  ]

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger') {
      setOpen?.(nextOpen)
    }
  }

  return (
    <Dropdown
      arrow
      menu={{ items }}
      onOpenChange={handleOpenChange}
      open={open}
      placement="bottom"
      trigger={['click']}
    >
      <Button className="rounded-full" icon={<LuPlus />} size="small" type="default" />
    </Dropdown>
  )
}
