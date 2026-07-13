import { __ } from '@common/helpers/i18nWrap'
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
      capability: '',
      key: 'edit',
      label: (
        <Button icon={<LuPenLine />} onClick={handleEdit} size="small" type="link">
          {__('Edit')}
        </Button>
      )
    },
    {
      capability: '',
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

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setIsOpen(nextOpen)
    }
  }

  return (
    <Dropdown menu={{ items }} onOpenChange={handleOpenChange} open={isOpen} trigger={['click']}>
      <Button className="h-full w-full" icon={<LuEllipsisVertical size={12} />} type="link" />
    </Dropdown>
  )
}
