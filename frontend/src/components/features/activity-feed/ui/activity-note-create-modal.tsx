import { __ } from '@common/helpers/i18nWrap'
import ActivityNoteForm from '@features/activity-feed/ui/activity-note-form'
import useSaveNote from '@features/notes/data/use-save-note'
import { NOTE_TYPE_SUBMODULE } from '@features/notes/shared/constants'
import {
  useActivityNoteActions,
  useActivityNoteIsCreateModalOpen
} from '@features/tasks/state/use-activity-note-store'
import { Button, Form, Popover, Space } from 'antd'
import { type ReactNode, useEffect } from 'react'
import { useSearchParams } from 'react-router'

import { type ActivityTypeValue } from '../shared/activity-types'

interface ActivityNoteCreateModalProps {
  activityType: ActivityTypeValue
  children: ReactNode
}

export default function ActivityNoteCreateModal({
  activityType,
  children
}: ActivityNoteCreateModalProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [form] = Form.useForm()
  const id = Number(searchParams.get('id')) || 0
  const { handleModal, setCreateModalOpen } = useActivityNoteActions()
  const isNoteCreateModalOpen = useActivityNoteIsCreateModalOpen()
  const { isStoringNote, noteStore } = useSaveNote(form)

  useEffect(() => {
    if (searchParams.get('modal') === 'create') {
      setCreateModalOpen(true)
      return
    }
    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  const handleCancel = () => {
    form.resetFields()
    handleModal('close', setSearchParams)
  }

  const handleSubmit = async () => {
    if (!id) return
    const values = await form.validateFields()
    await noteStore({
      ...values,
      entity_id: id,
      module: 'activity',
      submodule_type: activityType,
      type: NOTE_TYPE_SUBMODULE
    })
    handleCancel()
  }

  return (
    <Popover
      content={
        <div className="w-80 space-y-3">
          <ActivityNoteForm form={form} />
          <Space className="flex justify-end">
            <Button className="rounded-full" onClick={handleCancel}>
              {__('Cancel')}
            </Button>
            <Button
              className="rounded-full"
              loading={isStoringNote}
              onClick={handleSubmit}
              type="primary"
            >
              {__('Create')}
            </Button>
          </Space>
        </div>
      }
      onOpenChange={open => {
        if (!open) handleCancel()
      }}
      open={isNoteCreateModalOpen}
      placement="bottomRight"
      title={__('Create Note')}
      trigger="click"
    >
      {children}
    </Popover>
  )
}
