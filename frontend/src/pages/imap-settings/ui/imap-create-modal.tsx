import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { Form, Modal } from 'antd'
import { useContext, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'

import useImaps from '../data/use-imaps'
import useSaveImap from '../data/use-save-imap'
import useImapStore from '../state/use-imap-store'
import ImapForm from './imap-form'

export default function ImapCreateModal() {
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useImapStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [form] = Form.useForm()
  const { imapStore, isStoringImap } = useSaveImap(form)
  const { messageApi } = useContext(NotifyContext)
  const { page } = useParams()
  const pageNo = Number(page) || 1
  const { refetchImaps } = useImaps(pageNo)

  useEffect(() => {
    if (searchParams.get('modal') === 'create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    const { data } = await imapStore(values)

    setCreateModalOpen(false)
    form.resetFields()
    handleModal('close', setSearchParams)
    refetchImaps()

    messageApi?.success(typeof data === 'string' ? data : __('Imap settings created successfully'))
  }

  return (
    <Modal
      destroyOnHidden
      okButtonProps={{
        'aria-label': 'IMAP settings save button',
        disabled: isStoringImap,
        loading: isStoringImap
      }}
      okText={__('Create')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={isCreateModalOpen}
      title={__('Create IMAP Settings')}
    >
      {isCreateModalOpen && <ImapForm form={form} />}
    </Modal>
  )
}
