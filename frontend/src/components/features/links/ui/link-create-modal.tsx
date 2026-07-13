import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import { type FieldOptionsType } from '../../notes/shared/note-types'
import useSaveLink from '../data/use-save-link'
import useLinkStore from '../state/use-link-store'
import LinkForm from './link-form'

interface LinkCreateModalProps {
  entityId: number
  fieldOptions: FieldOptionsType[]
  module: string
}

export default function LinkCreateModal({ entityId, fieldOptions, module }: LinkCreateModalProps) {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useLinkStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [form] = Form.useForm()
  const { isStoringLink, linkStore } = useSaveLink(form)

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    await linkStore({ ...values, entity_id: entityId, module })
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'link_create') {
      setCreateModalOpen(true)
      return
    }
    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      centered
      confirmLoading={isStoringLink}
      destroyOnHidden
      okButtonProps={{ className: 'rounded-full', disabled: isStoringLink }}
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
      title={__('Create Link')}
    >
      <If conditions={isCreateModalOpen}>
        <LinkForm fieldOptions={fieldOptions} form={form} />
      </If>
    </Modal>
  )
}
