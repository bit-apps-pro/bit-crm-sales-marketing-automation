import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { type DropdownProps } from 'antd'
import { Button, Dropdown, Popconfirm } from 'antd'
import { useState } from 'react'
import { LuEllipsisVertical, LuPenLine, LuTrash2 } from 'react-icons/lu'
import { useParams, useSearchParams } from 'react-router'

import useDeleteNote from '../data/use-delete-note'
import useNoteStore from '../state/use-note-store'

export default function NoteListActionMore({ id }: { id: number }) {
  const { id: entityId } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [, setSearchParams] = useSearchParams()
  const { handleModal } = useNoteStore()
  const { deleteNote } = useDeleteNote()

  const handleEdit = () => {
    setIsOpen(false)
    handleModal('open', setSearchParams, {
      id: String(id),
      modal: 'note_edit'
    })
  }

  const handleDelete = async () => {
    if (!entityId) return
    await deleteNote({ entity_id: entityId, id })
    setIsOpen(false)
  }

  const items = [
    {
      capability: CAPABILITIES.NOTE.UPDATE,
      key: 'edit',
      label: (
        <Button icon={<LuPenLine />} onClick={handleEdit} size="small" type="link">
          {__('Edit')}
        </Button>
      )
    },
    {
      capability: CAPABILITIES.NOTE.DELETE,
      key: 'delete',
      label: (
        <Popconfirm
          cancelText={__('No')}
          okText={__('Yes')}
          onConfirm={handleDelete}
          title={__('Are you sure to delete this?')}
        >
          <Button danger icon={<LuTrash2 />} size="small" type="link">
            {__('Delete')}
          </Button>
        </Popconfirm>
      )
    }
  ]

  const availableItems = items.filter(item => item.capability && checkCapability(item.capability))

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setIsOpen(nextOpen)
    }
  }

  return (
    <If conditions={availableItems.length > 0}>
      <Dropdown
        menu={{ items: availableItems }}
        onOpenChange={handleOpenChange}
        open={isOpen}
        trigger={['click']}
      >
        <Button className="h-full w-full" icon={<LuEllipsisVertical size={12} />} type="link" />
      </Dropdown>
    </If>
  )
}
