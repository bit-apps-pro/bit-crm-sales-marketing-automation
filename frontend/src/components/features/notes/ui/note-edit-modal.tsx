import { __ } from '@common/helpers/i18nWrap'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useNote from '../data/use-note'
import useUpdateNote from '../data/use-update-note'
import { type FieldOptionsType } from '../shared/note-types'
import useNoteStore from '../state/use-note-store'
import NoteForm from './note-form'

interface NoteEditModalProps {
  fieldOptions: FieldOptionsType[]
}

export default function NoteEditModal({ fieldOptions }: NoteEditModalProps) {
  const { handleModal, isEditModalOpen, setEditModalOpen } = useNoteStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments, setAttachments } = useAttachmentStore()
  const { isFetchingNote, note } = useNote(Number(searchParams.get('id')), isEditModalOpen)
  const [form] = Form.useForm()
  const { isUpdatingNote, updateNote } = useUpdateNote(form)

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const id = Number(searchParams.get('id'))

    await updateNote({ ...values, attachments, id })

    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  useEffect(() => {
    if (!searchParams.has('modal') || !searchParams.has('id') || searchParams.get('id') === '0') {
      setEditModalOpen(false)
      return
    }

    if (searchParams.get('modal') === 'note_edit') {
      setEditModalOpen(true)
      return
    }

    setEditModalOpen(false)
  }, [searchParams, setEditModalOpen])

  useEffect(() => {
    if (note) {
      const currentValues = form.getFieldsValue()
      const hasValues = Object.values(currentValues).some(
        val => val !== undefined && val !== null && val !== ''
      )

      if (!hasValues) {
        form.setFieldsValue(note)

        if (note.attachments && note.attachments.length > 0) {
          setAttachments(note.attachments)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id])

  return (
    <Modal
      centered
      confirmLoading={isUpdatingNote}
      destroyOnHidden
      loading={isFetchingNote}
      okButtonProps={{ disabled: isUpdatingNote }}
      okText={__('Update')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={isEditModalOpen}
      styles={{
        body: {
          marginInline: '-22px',
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingInline: '22px'
        }
      }}
      title={__('Update Note')}
    >
      <If conditions={isEditModalOpen}>
        <NoteForm detailsValue={note?.details} fieldOptions={fieldOptions} form={form} />
      </If>
    </Modal>
  )
}
