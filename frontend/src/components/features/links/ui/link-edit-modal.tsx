import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import { type FieldOptionsType } from '../../notes/shared/note-types'
import useLink from '../data/use-link'
import useUpdateLink from '../data/use-update-link'
import useLinkStore from '../state/use-link-store'
import LinkForm from './link-form'

interface LinkEditModalProps {
  fieldOptions: FieldOptionsType[]
}

export default function LinkEditModal({ fieldOptions }: LinkEditModalProps) {
  const { handleModal, isEditModalOpen, setEditModalOpen } = useLinkStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isLoadingLink, link } = useLink(Number(searchParams.get('id')))
  const [form] = Form.useForm()
  const { isUpdatingLink, updateLink } = useUpdateLink(form)

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const id = Number(searchParams.get('id'))
    await updateLink({ ...values, id })
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  useEffect(() => {
    if (!searchParams.has('modal') || !searchParams.has('id') || searchParams.get('id') === '0') {
      setEditModalOpen(false)
      return
    }
    if (searchParams.get('modal') === 'link_edit') {
      setEditModalOpen(true)
      return
    }
    setEditModalOpen(false)
  }, [searchParams, setEditModalOpen])

  useEffect(() => {
    if (link) {
      const currentValues = form.getFieldsValue()
      const hasValues = Object.values(currentValues).some(
        val => val !== undefined && val !== null && val !== ''
      )
      if (!hasValues) {
        form.setFieldsValue(link)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link?.id])

  return (
    <Modal
      centered
      confirmLoading={isUpdatingLink}
      destroyOnHidden
      loading={isLoadingLink}
      okButtonProps={{ disabled: isUpdatingLink }}
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
      title={__('Update Link')}
    >
      <If conditions={isEditModalOpen}>
        <LinkForm fieldOptions={fieldOptions} form={form} />
      </If>
    </Modal>
  )
}
