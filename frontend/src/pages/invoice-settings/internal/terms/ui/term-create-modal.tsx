import { slugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveTerm from '../data/use-save-term'
import { CUSTOM_TERM_PREFIX } from '../shared/constants'
import { useIsTermCreateModalOpen, useTermsStoreActions } from '../state/use-terms-store'
import TermForm from './term-form'

export default function TermCreateModal() {
  const [form] = Form.useForm()
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleModal } = useTermsStoreActions()
  const isCreateModalOpen = useIsTermCreateModalOpen()
  const { setCreateModalOpen } = useTermsStoreActions()
  const { isSavingTerm, saveTerm } = useSaveTerm(form)

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const key = CUSTOM_TERM_PREFIX + slugify(values.name, '_')
      await saveTerm({ ...values, key })
      setCreateModalOpen(false)
      handleClose()
    } catch (error) {
      console.error('Failed to create term:', error)
    }
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'term_create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      centered
      confirmLoading={isSavingTerm}
      destroyOnHidden
      okButtonProps={{ className: 'rounded-full' }}
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
      title={__('Create Term')}
    >
      <If conditions={isCreateModalOpen}>
        <TermForm form={form} />
      </If>
    </Modal>
  )
}
