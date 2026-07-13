import { __ } from '@common/helpers/i18nWrap'
import useSaveNote from '@features/notes/data/use-save-note'
import { type NoteType } from '@features/notes/shared/note-types'
import If from '@utilities/If'
import { Button, Form, Skeleton, Typography } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'

import useActivityNotes from '../data/use-activity-notes'
import ActivityNote from './activity-note'
import ActivityNoteForm from './activity-note-form'

interface ActivityNotesProps {
  activityId?: number
  open: boolean
}

export default function ActivityNotes({ activityId, open }: ActivityNotesProps) {
  const [form] = Form.useForm()

  const { isStoringNote, noteStore } = useSaveNote(form)
  const [editNoteId, setEditNoteId] = useState<number | string | undefined>()

  const { isFetchingNotes, notes } = useActivityNotes(activityId || 0)

  const handleSubmit = async () => {
    if (!activityId) return
    const values = await form.validateFields()
    await noteStore({ ...values, entity_id: activityId, module: 'activity', type: 'submodule' })
    form.resetFields()
  }

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          animate={{ marginTop: 20, maxHeight: 1000, opacity: 1, paddingBottom: 20, paddingTop: 20 }}
          className="overflow-hidden rounded border border-solid border-[#E5E3FE] px-5 dark:border-gray-700"
          exit={{ marginTop: 0, maxHeight: 0, opacity: 0, paddingBottom: 0, paddingTop: 0 }}
          initial={{ marginTop: 0, maxHeight: 0, opacity: 0, paddingBottom: 0, paddingTop: 0 }}
          key="activity-notes-panel"
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="space-y-5">
            {isFetchingNotes ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <>
                {notes && notes.length > 0 ? (
                  <div className="space-y-2">
                    <Typography.Title level={5}>{__('All Notes')}</Typography.Title>
                    {notes.map((note: NoteType) => (
                      <ActivityNote
                        editNoteId={editNoteId}
                        key={note.id}
                        note={note}
                        setEditNoteId={setEditNoteId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">{__('No notes found')}</div>
                )}
              </>
            )}
            <If conditions={editNoteId === undefined}>
              <div>
                <ActivityNoteForm form={form} />
                <div className="text-right">
                  <Button
                    className="rounded-full"
                    disabled={isStoringNote}
                    icon={<LuPlus />}
                    onClick={handleSubmit}
                    size="middle"
                    type="primary"
                  >
                    {__('Add Note')}
                  </Button>
                </div>
              </div>
            </If>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
