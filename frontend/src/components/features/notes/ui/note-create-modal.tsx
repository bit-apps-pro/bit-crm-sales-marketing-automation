import { __ } from '@common/helpers/i18nWrap'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveNote from '../data/use-save-note'
import { type FieldOptionsType } from '../shared/note-types'
import useNoteStore from '../state/use-note-store'
import NoteForm from './note-form'

interface NoteCreateModalProps {
  entityId: number | string
  fieldOptions: FieldOptionsType[]
  module: string
  type?: string
}

export default function NoteCreateModal({
  entityId,
  fieldOptions,
  module,
  type = ''
}: NoteCreateModalProps) {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useNoteStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments } = useAttachmentStore()
  const [form] = Form.useForm()
  const { isStoringNote, noteStore } = useSaveNote(form)

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    await noteStore({
      ...values,
      attachments,
      entity_id: entityId,
      module,
      type
    })

    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'note_create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  return (
    <Modal
      centered
      confirmLoading={isStoringNote}
      destroyOnHidden
      okButtonProps={{ disabled: isStoringNote }}
      okText={__('Create')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={isCreateModalOpen}
      styles={{
        body: {
          marginInline: '-22px',
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingInline: '22px'
        }
      }}
      title={__('Create Note')}
    >
      <If conditions={isCreateModalOpen}>
        <NoteForm fieldOptions={fieldOptions} form={form} />
      </If>
    </Modal>
  )
}
