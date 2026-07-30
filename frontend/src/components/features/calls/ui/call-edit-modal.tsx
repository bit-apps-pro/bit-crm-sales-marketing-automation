import { __ } from '@common/helpers/i18nWrap'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useCall from '../data/use-call'
import useUpdateCall from '../data/use-update-call'
import { type FieldOptionsType } from '../shared/call-types'
import useCallStore from '../state/use-call-store'
import CallForm from './call-form'

interface CallEditModalProps {
  fieldOptions?: FieldOptionsType[]
  variant: 'component' | 'page'
}

export default function CallEditModal({ fieldOptions, variant }: CallEditModalProps) {
  const { handleModal, isEditModalOpen, setEditModalOpen } = useCallStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments, setAttachments } = useAttachmentStore()
  const { call, isFetchingCall } = useCall(Number(searchParams.get('id')))
  const [form] = Form.useForm()
  const { isUpdatingCall, updateCall } = useUpdateCall(form)

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const id = Number(searchParams.get('id'))

    await updateCall({ ...values, attachments, id, type: 'call' })

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
    if (call?.attachments && call.attachments.length > 0) {
      setAttachments(call.attachments)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.id])

  // The form instance outlives the modal, so antd keeps the previous values
  // across reopens; sync them whenever fresh data arrives.
  useEffect(() => {
    if (isEditModalOpen && call) {
      form.setFieldsValue(call)
    }
  }, [form, isEditModalOpen, call])

  return (
    <Modal
      centered
      confirmLoading={isUpdatingCall}
      destroyOnHidden
      loading={isFetchingCall}
      okButtonProps={{ disabled: isUpdatingCall }}
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
      title={__('Update Call')}
    >
      <If conditions={isEditModalOpen && !!call?.id}>
        <CallForm
          entityId={call?.entity_id}
          fieldOptions={fieldOptions}
          form={form}
          initialValues={call}
          key={call?.id}
          module={call?.module}
          variant={variant}
        />
      </If>
    </Modal>
  )
}
