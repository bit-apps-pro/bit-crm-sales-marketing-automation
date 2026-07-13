import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveMeeting from '../data/use-save-meeting'
import { type FieldOptionsType } from '../shared/meeting-types'
import useMeetingStore from '../state/use-meeting-store'
import MeetingForm from './meeting-form'

interface MeetingCreateModalProps {
  entityId?: number
  fieldOptions?: FieldOptionsType[]
  module?: string
  variant: 'component' | 'page'
}

export default function MeetingCreateModal({
  entityId,
  fieldOptions,
  module,
  variant
}: MeetingCreateModalProps) {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useMeetingStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments } = useAttachmentStore()
  const [form] = Form.useForm()
  const { isStoringMeeting, meetingStore } = useSaveMeeting(form)

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const data = {
      ...values,
      attachments,
      type: 'meeting'
    }

    if (variant === 'component') {
      data.entity_id = entityId
      data.module = module
    }

    await meetingStore(data)

    setCreateModalOpen(false)
    form.resetFields()
    handleModal('close', setSearchParams)
    clearAttachments()
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'meeting_create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  useEffect(() => {
    if (config.CURRENT_USER_ID && isCreateModalOpen) {
      form.setFieldValue('assigned_to', config.CURRENT_USER_ID)
    }
  }, [form, isCreateModalOpen])

  return (
    <Modal
      centered
      confirmLoading={isStoringMeeting}
      destroyOnHidden
      okButtonProps={{ disabled: isStoringMeeting }}
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
      title={__('Create Meeting')}
    >
      <If conditions={isCreateModalOpen}>
        <MeetingForm fieldOptions={fieldOptions} form={form} variant={variant} />
      </If>
    </Modal>
  )
}
