import { __ } from '@common/helpers/i18nWrap'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import dayjs from 'dayjs'
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
  const { isFetchingTask, task } = useTask(Number(searchParams.get('id')))
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
    if (isEditModalOpen && task && task.id) {
      form.setFieldsValue({
        ...task,
        due_date: task.due_date ? dayjs(task.due_date) : undefined
      })

      if (task.attachments && task.attachments.length > 0) {
        setAttachments(task.attachments)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, isEditModalOpen])

  return (
    <Modal
      centered
      confirmLoading={isUpdatingTask}
      destroyOnHidden
      loading={isFetchingTask}
      okButtonProps={{ disabled: isUpdatingTask }}
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
      <If conditions={isEditModalOpen}>
        <TaskForm fieldOptions={fieldOptions} form={form} module={task?.module} variant={variant} />
      </If>
    </Modal>
  )
}
