import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { useIsEditModalOpen, useTagStoreActions } from '@pages/tags/state/use-tag-store'
import { type QueryObserverResult } from '@tanstack/react-query'
import { Modal } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useTag from '../data/use-tag'
import useUpdateTag from '../data/use-update-tag'
import TagForm from '../internal/tag-form'

interface TagEditModalProps {
  refetchTags: () => Promise<QueryObserverResult<unknown, unknown>>
}

export default function TagEditModal({ refetchTags }: TagEditModalProps) {
  const [form] = useForm()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isUpdatingTag, updateTag } = useUpdateTag(form)
  const { messageApi } = useContext(NotifyContext)
  const isEditModalOpen = useIsEditModalOpen()
  const { handleModal, setEditModalOpen } = useTagStoreActions()
  const { isTagLoading, tag } = useTag(Number(searchParams.get('id')))

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
    if (tag && !form.isFieldsTouched()) {
      form.setFieldsValue(tag)
    }
  }, [tag, form])

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    const id = searchParams.get('id')

    if (!id || id === '0') {
      messageApi?.error(__('Invalid tag ID'))
      return
    }

    const { data } = await updateTag({ ...values, id: Number(id) })

    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    refetchTags()
    messageApi?.success(typeof data === 'string' ? data : __('Tag Updated Successfully'))
  }

  return (
    <Modal
      destroyOnHidden
      loading={isTagLoading}
      okButtonProps={{ disabled: isTagLoading, loading: isUpdatingTag }}
      okText={__('Update')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={isEditModalOpen}
      title={__('Update Tag')}
    >
      {isEditModalOpen && <TagForm form={form} />}
    </Modal>
  )
}
