import { MoreOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { type DropdownProps } from 'antd'
import { Button, Dropdown, Popconfirm } from 'antd'
import { useState } from 'react'
import { LuPencilLine, LuTrash2 } from 'react-icons/lu'
import { useParams, useSearchParams } from 'react-router'

import useDeleteImap from '../data/use-delete-imap'
import useImaps from '../data/use-imaps'
import useImapStore from '../state/use-imap-store'

export default function ImapItemDropdown({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const [, setSearchParams] = useSearchParams()
  const { handleModal } = useImapStore()
  const { page } = useParams()
  const pageNo = Number(page) || 1
  const { refetchImaps } = useImaps(pageNo)
  const { deleteImap } = useDeleteImap()

  const handleEdit = () => {
    setOpen(false)
    handleModal('open', setSearchParams, { id: id.toString(), modal: 'edit' })
  }

  const handleDelete = async () => {
    await deleteImap(id)

    setOpen(false)
    refetchImaps()
  }

  const menuItems = [
    {
      capability: CAPABILITIES.SETTING.IMAP,
      key: '1',
      label: (
        <Button
          disabled={id === 0}
          icon={<LuPencilLine />}
          onClick={handleEdit}
          size="small"
          type="link"
        >
          {__('Edit')}
        </Button>
      )
    },
    {
      capability: CAPABILITIES.SETTING.IMAP,
      key: '2',
      label: (
        <Popconfirm
          cancelText={__('No')}
          okText={__('Yes')}
          onConfirm={handleDelete}
          title={__('Are you sure?')}
        >
          <Button className="p-0" danger icon={<LuTrash2 />} size="small" type="link">
            {__('Delete')}
          </Button>
        </Popconfirm>
      )
    }
  ]

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setOpen(nextOpen)
    }
  }

  const availableMenuItems = menuItems.filter(
    item => item.capability && checkCapability(item.capability)
  )

  return (
    <Dropdown
      arrow={true}
      menu={{ items: availableMenuItems }}
      onOpenChange={handleOpenChange}
      open={open}
      placement="bottom"
      trigger={['click']}
    >
      <Button data-testid="imapItemDropdown" onClick={() => setOpen(!open)} type="link">
        <MoreOutlined />
      </Button>
    </Dropdown>
  )
}
