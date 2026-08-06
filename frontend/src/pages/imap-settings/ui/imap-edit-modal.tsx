import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { Form, Modal, Typography } from 'antd'
import { useContext, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'

import useImap from '../data/use-imap'
import useImaps from '../data/use-imaps'
import useUpdateImap from '../data/use-update-imap'
import useImapStore from '../state/use-imap-store'
import ImapForm from './imap-form'

export default function ImapEditModal() {
  const { handleModal, isEditModalOpen, setEditModalOpen } = useImapStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { messageApi } = useContext(NotifyContext)
  const { page } = useParams()
  const pageNo = Number(page) || 1
  const { refetchImaps } = useImaps(pageNo)
  const { imap, isImapLoading } = useImap(Number(searchParams.get('id')))
  const [form] = Form.useForm()
  const { isUpdatingImap, updateImap } = useUpdateImap(form)

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

  if (imap && !form.isFieldsTouched()) {
    form.setFieldsValue(imap)
  }

  const handleClose = () => {
    setEditModalOpen(false)
    handleModal('close', setSearchParams)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    const { data } = await updateImap({ ...values, id: Number(searchParams.get('id')) })

    setEditModalOpen(false)
    handleModal('close', setSearchParams)
    refetchImaps()
    messageApi?.success(typeof data === 'string' ? data : __('Imap updated'))
  }

  return (
    <Modal
      destroyOnHidden
      loading={isImapLoading}
      okButtonProps={{
        'aria-label': 'IMAP settings save button',
        disabled: isUpdatingImap || !imap,
        loading: isUpdatingImap
      }}
      okText={__('Update')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={isEditModalOpen}
      title={__('Update IMAP Settings')}
    >
      {isEditModalOpen &&
        (imap ? (
          <ImapForm form={form} />
        ) : (
          <Typography.Text type="danger">{__('Imap settings not found!')}</Typography.Text>
        ))}
    </Modal>
  )
}
