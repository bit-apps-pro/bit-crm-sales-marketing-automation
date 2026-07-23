import { __ } from '@common/helpers/i18nWrap'
import useDeleteNote from '@features/notes/data/use-delete-note'
import useUpdateNote from '@features/notes/data/use-update-note'
import { type NoteType } from '@features/notes/shared/note-types'
import If from '@utilities/If'
import { Button, Dropdown, Form } from 'antd'
import { LuEllipsisVertical, LuPenLine, LuTrash2 } from 'react-icons/lu'

import ActivityNoteForm from './activity-note-form'

interface ActivityNoteProps {
  editNoteId?: number | string
  note: NoteType
  setEditNoteId: (id: number | string | undefined) => void
}
export default function ActivityNote({ editNoteId, note, setEditNoteId }: ActivityNoteProps) {
  const [form] = Form.useForm()
  const { isUpdatingNote, updateNote } = useUpdateNote(form)
  const { deleteNote, isDeletingNote } = useDeleteNote()

  const handleDeleteNote = async (noteId?: number | string) => {
    if (!noteId || !note.entity_id) return
    await deleteNote({ entity_id: note.entity_id, id: noteId })
  }

  const handleEditNote = (noteId?: number | string) => {
    if (!noteId) return
    setEditNoteId(noteId)
  }

  const handleUpdateNote = async () => {
    if (!note.entity_id) return
    const values = await form.validateFields()
    updateNote({ ...values, entity_id: note.entity_id, id: note.id, module: 'activity' })
    setEditNoteId(undefined)
  }

  const handleCancel = () => {
    setEditNoteId(undefined)
    form.resetFields()
  }

  const items = [
    {
      icon: <LuPenLine size={14} />,
      key: 'edit',
      label: __('Edit'),
      onClick: () => handleEditNote(note.id)
    },
    {
      disabled: isDeletingNote,
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: () => handleDeleteNote(note.id)
    }
  ]

  return (
    <div>
      <If conditions={editNoteId !== note.id}>
        <div className="flex items-start justify-between gap-2 border-0 border-b border-solid border-[#EBEAFF] dark:border-neutral-700">
          <div
            className="min-w-0 break-normal break-words"
            dangerouslySetInnerHTML={{ __html: note.details }}
          />
          <div className="flex shrink-0 items-center">
            <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
              <Button
                className="text-gray-600 dark:text-gray-400"
                icon={<LuEllipsisVertical size={12} />}
                type="link"
              />
            </Dropdown>
          </div>
        </div>
      </If>
      <If conditions={editNoteId === note.id}>
        <div>
          <ActivityNoteForm detailsValue={note.details} form={form} isEditing={true} />
          <div className="flex items-center justify-end gap-2">
            <Button className="rounded-full" onClick={handleCancel} size="middle">
              {__('Cancel')}
            </Button>
            <Button
              className="rounded-full"
              loading={isUpdatingNote}
              onClick={handleUpdateNote}
              size="middle"
              type="primary"
            >
              {__('Update Note')}
            </Button>
          </div>
        </div>
      </If>
    </div>
  )
}
