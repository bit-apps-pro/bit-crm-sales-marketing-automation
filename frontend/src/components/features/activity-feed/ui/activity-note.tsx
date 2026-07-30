import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import ActivityNoteForm from '@features/activity-feed/ui/activity-note-form'
import useDeleteNote from '@features/notes/data/use-delete-note'
import useUpdateNote from '@features/notes/data/use-update-note'
import { NOTE_TYPE_SUBMODULE } from '@features/notes/shared/constants'
import { type NoteType } from '@features/notes/shared/note-types'
import { Button, Dropdown, Form, type MenuProps, Popconfirm, Popover, Space, Typography } from 'antd'
import { useState } from 'react'
import { LuEllipsisVertical, LuInfo, LuPenLine, LuTrash2 } from 'react-icons/lu'

interface ActivityNoteProps {
  note: NoteType
}

export default function ActivityNote({ note }: ActivityNoteProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [form] = Form.useForm()

  const { isUpdatingNote, updateNote } = useUpdateNote(form)
  const { deleteNote, isDeletingNote } = useDeleteNote()

  const handleEditCancel = () => {
    setIsEditOpen(false)
    form.resetFields()
  }

  const handleEditSubmit = async () => {
    if (!note.id || !note.entity_id) return
    const values = await form.validateFields()
    await updateNote({
      ...values,
      entity_id: note.entity_id,
      id: note.id,
      module: 'activity',
      type: NOTE_TYPE_SUBMODULE
    })
    handleEditCancel()
  }

  const handleDelete = async () => {
    if (!note.id || !note.entity_id) return
    await deleteNote({ entity_id: note.entity_id, id: note.id })
    setIsDeleteOpen(false)
  }

  const items: MenuProps['items'] = [
    {
      icon: <LuPenLine size={14} />,
      key: 'edit',
      label: __('Edit'),
      onClick: () => {
        setIsMenuOpen(false)
        setIsEditOpen(true)
      }
    },
    {
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: () => {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
      }
    }
  ]

  const menuTrigger = (
    <Dropdown
      arrow
      className="!mr-0 !pr-0"
      menu={{ items }}
      onOpenChange={setIsMenuOpen}
      open={isMenuOpen}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button className="!mr-0 !pr-0" icon={<LuEllipsisVertical />} type="link" />
    </Dropdown>
  )

  return (
    <div
      className="rounded border border-solid border-[#E5E3FE] p-3 dark:border-neutral-700"
      key={note.id}
    >
      <div className="flex items-start gap-0.5">
        <div
          className="flex-1 break-normal break-words"
          dangerouslySetInnerHTML={{ __html: note.details }}
        />
        <Popconfirm
          cancelText={__('No')}
          description={__('Are you sure you want to delete this note?')}
          okButtonProps={{ loading: isDeletingNote }}
          okText={__('Delete')}
          onConfirm={handleDelete}
          onOpenChange={open => {
            if (!open) setIsDeleteOpen(false)
          }}
          open={isDeleteOpen}
          title={
            <div className="flex items-center gap-1">
              <LuInfo size={18} />
              {__('Confirm Deletion')}
            </div>
          }
          trigger={[]}
        >
          <Popover
            content={
              isEditOpen && (
                <div className="w-80 space-y-3" key={note.id}>
                  <ActivityNoteForm detailsValue={note.details} form={form} isEditing />
                  <Space className="flex justify-end">
                    <Button className="rounded-full" onClick={handleEditCancel}>
                      {__('Cancel')}
                    </Button>
                    <Button
                      className="rounded-full"
                      loading={isUpdatingNote}
                      onClick={handleEditSubmit}
                      type="primary"
                    >
                      {__('Save')}
                    </Button>
                  </Space>
                </div>
              )
            }
            destroyOnHidden
            onOpenChange={open => {
              if (!open) handleEditCancel()
            }}
            open={isEditOpen}
            placement="bottomRight"
            title={__('Edit Note')}
            trigger={[]}
          >
            {menuTrigger}
          </Popover>
        </Popconfirm>
      </div>
      <Typography.Text className="text-xs">
        {note?.created_at && formatDateTime(note.created_at)}
      </Typography.Text>
    </div>
  )
}
