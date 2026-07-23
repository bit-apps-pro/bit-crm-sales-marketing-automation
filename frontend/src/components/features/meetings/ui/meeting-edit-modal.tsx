import { __ } from '@common/helpers/i18nWrap'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useMeeting from '../data/use-meeting'
import useUpdateMeeting from '../data/use-update-meeting'
import { type FieldOptionsType } from '../shared/meeting-types'
import useMeetingStore from '../state/use-meeting-store'
import MeetingForm from './meeting-form'

interface MeetingEditModalProps {
  fieldOptions?: FieldOptionsType[]
  variant: 'component' | 'page'
}

export default function MeetingEditModal({ fieldOptions, variant }: MeetingEditModalProps) {
  const { handleModal, isEditModalOpen, setEditModalOpen } = useMeetingStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments, setAttachments } = useAttachmentStore()
  const { isFetchingMeeting, meeting } = useMeeting(Number(searchParams.get('id')))
  const [form] = Form.useForm()
  const { isUpdatingMeeting, updateMeeting } = useUpdateMeeting(form)

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const id = Number(searchParams.get('id'))

    await updateMeeting({ ...values, attachments, id, type: 'meeting' })

    setEditModalOpen(false)
    form.resetFields()
    handleModal('close', setSearchParams)
    clearAttachments()
  }

  useEffect(() => {
    if (!searchParams.has('modal') || !searchParams.has('id') || searchParams.get('id') === '0') {
      setEditModalOpen(false)
      return
    }

    if (searchParams.get('modal') === 'edit') {
      setEditModalOpen(true)
      return
    }

    setEditModalOpen(false)
  }, [searchParams, setEditModalOpen])

  useEffect(() => {
    if (meeting && meeting.id) {
      const currentValues = form.getFieldsValue()
      const hasValues = Object.values(currentValues).some(
        val => val !== undefined && val !== null && val !== ''
      )

      if (!hasValues) {
        form.setFieldsValue(meeting)

        if (meeting.attachments && meeting.attachments.length > 0) {
          setAttachments(meeting.attachments)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting?.id])

  return (
    <Modal
      centered
      confirmLoading={isUpdatingMeeting}
      destroyOnHidden
      loading={isFetchingMeeting}
      okButtonProps={{ disabled: isUpdatingMeeting }}
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
      title={__('Update Meeting')}
    >
      <If conditions={isEditModalOpen}>
        <MeetingForm
          entityId={meeting?.entity_id}
          fieldOptions={fieldOptions}
          form={form}
          module={meeting?.module}
          variant={variant}
        />
      </If>
    </Modal>
  )
}
