import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import { useIsCreateModalOpen, useTagStoreActions } from '@pages/tags/state/use-tag-store'
import { type QueryObserverResult } from '@tanstack/react-query'
import If from '@utilities/If'
import { Modal } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useStoreTag from '../data/use-store-tag'
import TagForm from '../internal/tag-form'
import { type TagItemType } from '../shared/tag-types'

interface TagCreateModalProps {
  refetchTags: () => Promise<QueryObserverResult<unknown, unknown>>
}

export default function TagCreateModal({ refetchTags }: TagCreateModalProps) {
  const [form] = useForm()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isStoringTag, storeTag } = useStoreTag()
  const { messageApi } = useContext(NotifyContext)
  const isCreateModalOpen = useIsCreateModalOpen()

  const { handleModal, setCreateModalOpen } = useTagStoreActions()

  useEffect(() => {
    if (searchParams.get('modal') === 'create') {
      setCreateModalOpen(true)
      return
    }
    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  const handleCancel = () => {
    form.resetFields()
    handleModal('close', setSearchParams)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    const { data, status } = await storeTag(values).catch(
      error => error as Response<ValidationType<TagItemType>>
    )

    if (status === 'error') {
      if (typeof data === 'object') {
        const errors = Object.entries(data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
      } else {
        messageApi?.error(data)
      }

      return
    }

    form.resetFields()
    setCreateModalOpen(false)
    await refetchTags()
    handleModal('close', setSearchParams)
    messageApi?.success(typeof data === 'string' ? data : __('Tag Created'))
  }

  return (
    <Modal
      confirmLoading={isStoringTag}
      destroyOnHidden
      okButtonProps={{ 'aria-label': 'Tag save button' }}
      okText={__('Create')}
      onCancel={handleCancel}
      onOk={handleSubmit}
      open={isCreateModalOpen}
      title={__('Create New Tag')}
    >
      <If conditions={isCreateModalOpen}>
        <TagForm form={form} />
      </If>
    </Modal>
  )
}
