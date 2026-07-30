import { __ } from '@common/helpers/i18nWrap'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useTask from '../data/use-task'
import useUpdateTask from '../data/use-update-task'
import { type FieldOptionsType } from '../shared/task-types'
import useTaskStore from '../state/use-task-store'
import TaskForm from './task-form'

interface TaskEditModalProps {
  fieldOptions?: FieldOptionsType[]
  variant: 'component' | 'page'
}

export default function TaskEditModal({ fieldOptions, variant }: TaskEditModalProps) {
  const { handleModal, isEditModalOpen, setEditModalOpen } = useTaskStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { attachments, clearAttachments, setAttachments } = useAttachmentStore()
  const id = Number(searchParams.get('id')) || 0
  const { isFetchingTask, task } = useTask(id)
  const [form] = Form.useForm()
  const { isUpdatingTask, updateTask } = useUpdateTask(form)

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
    clearAttachments()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const id = Number(searchParams.get('id'))

    await updateTask({ ...values, attachments, id, type: 'task' })

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
    if (task?.attachments && task.attachments.length > 0) {
      setAttachments(task.attachments)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  // The form instance outlives the modal, so antd keeps the previous values
  // across reopens; sync them whenever fresh data arrives.
  useEffect(() => {
    if (isEditModalOpen && task) {
      form.setFieldsValue(task)
    }
  }, [form, isEditModalOpen, task])

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      centered
      confirmLoading={isUpdatingTask}
      destroyOnHidden
      loading={isFetchingTask}
      okButtonProps={{ className: 'rounded-full', disabled: isUpdatingTask }}
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
      title={__('Update Task')}
    >
      <If conditions={isEditModalOpen && !!task?.id}>
        <TaskForm
          fieldOptions={fieldOptions}
          form={form}
          initialValues={task}
          key={task?.id}
          module={task?.module}
          variant={variant}
        />
      </If>
    </Modal>
  )
}
