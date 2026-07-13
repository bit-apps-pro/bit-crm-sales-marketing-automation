import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import useTerm from '../data/use-term'
import useUpdateTerm from '../data/use-update-term'
import { useIsTermEditModalOpen, useTermsStoreActions } from '../state/use-terms-store'
import TermForm from './term-form'

export default function TermEditModal() {
  const [form] = Form.useForm()
  const [termKey, setTermKey] = useState<string>('')
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleModal } = useTermsStoreActions()
  const isEditModalOpen = useIsTermEditModalOpen()
  const { setEditModalOpen } = useTermsStoreActions()
  const { isUpdatingTerm, updateTerm } = useUpdateTerm(form)
  const { isTermFetching, isTermPending, term } = useTerm(termKey)

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  const handleSubmit = async () => {
    if (!term?.key) {
      return
    }
    try {
      const values = await form.validateFields()
      await updateTerm({ ...values, key: term.key })
      handleClose()
    } catch (error) {
      console.error('Failed to update term:', error)
    }
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'term_edit') {
      setEditModalOpen(true)
      setTermKey(searchParams.get('id') || '')
      return
    }

    setEditModalOpen(false)
  }, [searchParams, setEditModalOpen])

  useEffect(() => {
    if (term && !isTermFetching && !isTermPending) {
      form.setFieldsValue({
        days: term.days,
        name: term.name
      })
    }
  }, [term, isTermFetching, isTermPending, form])

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      centered
      confirmLoading={isUpdatingTerm}
      destroyOnHidden
      loading={isTermFetching || isTermPending}
      okButtonProps={{ className: 'rounded-full' }}
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
      title={__('Update Term')}
    >
      <If conditions={isEditModalOpen}>
        <TermForm form={form} />
      </If>
    </Modal>
  )
}
