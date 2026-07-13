import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveCall from '../data/use-save-call'
import { type FieldOptionsType } from '../shared/call-types'
import useCallStore from '../state/use-call-store'
import CallForm from './call-form'

interface CallCreateModalProps {
  entityId?: number
  fieldOptions?: FieldOptionsType[]
  module?: string
  variant: 'component' | 'page'
}

export default function CallCreateModal({
  entityId,
  fieldOptions,
  module,
  variant
}: CallCreateModalProps) {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useCallStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments } = useAttachmentStore()
  const [form] = Form.useForm()
  const { callStore, isStoringCall } = useSaveCall(form)

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
      type: 'call'
    }

    if (variant === 'component') {
      data.entity_id = entityId
      data.module = module
    }

    await callStore(data)

    setCreateModalOpen(false)
    form.resetFields()
    handleModal('close', setSearchParams)
    clearAttachments()
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'call_create') {
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
      confirmLoading={isStoringCall}
      destroyOnHidden
      okButtonProps={{ disabled: isStoringCall }}
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
      title={__('Create Call')}
    >
      <If conditions={isCreateModalOpen}>
        <CallForm fieldOptions={fieldOptions} form={form} variant={variant} />
      </If>
    </Modal>
  )
}
