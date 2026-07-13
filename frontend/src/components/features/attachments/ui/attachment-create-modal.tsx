import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import WpMediaUploader from '@features/wp-media-uploader'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import { Modal } from 'antd'
import { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveAttachment from '../data/use-save-attachments'
import useAttachmentFeatureStore from '../state/use-attachment-feature-store'

interface AttachmentCreateModalProps {
  entityId: number
  module: string
}

export default function AttachmentCreateModal({ entityId, module }: AttachmentCreateModalProps) {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useAttachmentFeatureStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments } = useAttachmentStore()
  const { isSavingAttachment, saveAttachment } = useSaveAttachment()
  const { messageApi } = useContext(NotifyContext)

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    clearAttachments()
  }

  const handleSubmit = async () => {
    if (!attachments || attachments.length === 0) {
      messageApi?.error(__('Please select at least one file'))
      return
    }

    await saveAttachment({
      attachments,
      entity_id: entityId,
      module
    })

    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    clearAttachments()
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'attachment_create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  return (
    <Modal
      centered
      confirmLoading={isSavingAttachment}
      destroyOnHidden
      okButtonProps={{ disabled: isSavingAttachment }}
      okText={__('Upload')}
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
      title={__('Upload Attachments')}
    >
      <div className="mb-2">
        <WpMediaUploader />
      </div>
    </Modal>
  )
}
