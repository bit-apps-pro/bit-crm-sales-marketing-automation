import { __ } from '@common/helpers/i18nWrap'
// Import from the original activities feature
import config from '@config/config'
import { PRIORITIES } from '@features/activity-list/shared/activity-constants'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveTask from '../data/use-save-task'
import { type FieldOptionsType } from '../shared/task-types'
import useTaskStore from '../state/use-task-store'
import TaskForm from './task-form'

interface TaskCreateModalProps {
  entityId?: number
  fieldOptions?: FieldOptionsType[]
  module?: string
  variant: 'component' | 'page'
}

export default function TaskCreateModal({
  entityId,
  fieldOptions,
  module,
  variant
}: TaskCreateModalProps) {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useTaskStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments } = useAttachmentStore()
  const [form] = Form.useForm()
  const { isStoringTask, taskStore } = useSaveTask(form)

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
      type: 'task'
    }

    if (variant === 'component') {
      data.entity_id = entityId
      data.module = module
    }

    await taskStore(data)

    setCreateModalOpen(false)
    form.resetFields()
    handleModal('close', setSearchParams)
    clearAttachments()
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'task_create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  useEffect(() => {
    if (isCreateModalOpen) {
      form.setFieldValue('priority', PRIORITIES.MEDIUM)

      if (config.CURRENT_USER_ID) {
        form.setFieldValue('assigned_to', config.CURRENT_USER_ID)
      }
    }
  }, [form, isCreateModalOpen])

  return (
    <Modal
      centered
      confirmLoading={isStoringTask}
      destroyOnHidden
      okButtonProps={{ disabled: isStoringTask }}
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
      title={__('Create Task')}
    >
      <If conditions={isCreateModalOpen}>
        <TaskForm fieldOptions={fieldOptions} form={form} variant={variant} />
      </If>
    </Modal>
  )
}
